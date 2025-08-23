import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import { sendBookingConfirmationEmail } from '@/lib/gmail'
import { addAttendeeToCalendarEvent } from '@/lib/calendar'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id)

  const bookingId = session.metadata?.bookingId
  if (!bookingId) {
    console.error('No booking ID in session metadata')
    return
  }

  try {
    // Actualizar el estado de la reserva
    const booking = await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'completed',
        stripeSessionId: session.id,
      },
      include: {
        event: true,
        customer: true,
        tickets: true,
      },
    })

    // Actualizar estadísticas del cliente
    await db.customer.update({
      where: { id: booking.customer.id },
      data: {
        totalBookings: {
          increment: 1,
        },
        totalSpent: {
          increment: booking.totalAmount,
        },
      },
    })

    // Verificar si el evento está agotado
    const remainingTickets = await db.event.findUnique({
      where: { id: booking.eventId },
      select: { availableTickets: true },
    })

    if (remainingTickets && remainingTickets.availableTickets <= 0) {
      await db.event.update({
        where: { id: booking.eventId },
        data: { status: 'soldout' },
      })
    }

    console.log(`Booking ${booking.bookingCode} confirmed for ${booking.customerEmail}`)

    // Enviar email de confirmación
    try {
      const emailSent = await sendBookingConfirmationEmail(booking)
      if (emailSent) {
        await db.booking.update({
          where: { id: bookingId },
          data: { confirmationSent: true },
        })
        console.log(`Confirmation email sent for booking ${booking.bookingCode}`)
      }
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError)
    }

    // Agregar al calendario si el evento está sincronizado
    try {
      if (booking.event.calendarEventId) {
        await addAttendeeToCalendarEvent(
          booking.event.calendarEventId,
          booking.customerEmail
        )
        console.log(`Customer added to calendar event for booking ${booking.bookingCode}`)
      }
    } catch (calendarError) {
      console.error('Error adding to calendar:', calendarError)
    }

  } catch (error) {
    console.error('Error processing completed checkout:', error)
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Checkout session expired:', session.id)

  const bookingId = session.metadata?.bookingId
  if (!bookingId) {
    console.error('No booking ID in session metadata')
    return
  }

  try {
    // Encontrar la reserva
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    })

    if (!booking) {
      console.error('Booking not found:', bookingId)
      return
    }

    // Marcar reserva como fallida
    await db.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'failed',
      },
    })

    // Devolver tickets al inventario
    await db.event.update({
      where: { id: booking.eventId },
      data: {
        availableTickets: {
          increment: booking.quantity,
        },
      },
    })

    // Marcar tickets como cancelados
    await db.ticket.updateMany({
      where: { bookingId: bookingId },
      data: { status: 'cancelled' },
    })

    console.log(`Booking ${booking.bookingCode} expired and tickets returned to inventory`)

  } catch (error) {
    console.error('Error processing expired checkout:', error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id)
  // Lógica adicional si es necesaria
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id)
  // Lógica adicional si es necesaria
}