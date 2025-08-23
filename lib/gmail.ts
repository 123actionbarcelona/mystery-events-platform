import { google } from 'googleapis'

const gmail = google.gmail('v1')

// Configurar OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob' // Para aplicaciones web
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

export interface EmailData {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    content: string
    encoding: 'base64'
  }>
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    // Crear el mensaje MIME
    const message = createMimeMessage(emailData)
    
    // Enviar el email
    const response = await gmail.users.messages.send({
      auth: oauth2Client,
      userId: 'me',
      requestBody: {
        raw: Buffer.from(message).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
      },
    })

    console.log('Email sent successfully:', response.data.id)
    return true

  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

function createMimeMessage(emailData: EmailData): string {
  const boundary = 'boundary_' + Math.random().toString(36).substr(2, 9)
  
  let message = [
    `From: Mystery Events <${process.env.GMAIL_FROM_EMAIL}>`,
    `To: ${emailData.to}`,
    `Subject: ${emailData.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    emailData.html,
  ].join('\n')

  // Añadir attachments si existen
  if (emailData.attachments && emailData.attachments.length > 0) {
    for (const attachment of emailData.attachments) {
      message += [
        '',
        `--${boundary}`,
        `Content-Type: application/octet-stream; name="${attachment.filename}"`,
        'Content-Transfer-Encoding: base64',
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        '',
        attachment.content,
      ].join('\n')
    }
  }

  message += `\n--${boundary}--`
  
  return message
}

// Funciones específicas para diferentes tipos de emails

export async function sendBookingConfirmationEmail(booking: any): Promise<boolean> {
  const emailTemplate = await getEmailTemplate('booking_confirmation')
  
  if (!emailTemplate) {
    console.error('Email template not found: booking_confirmation')
    return false
  }

  const html = replaceTemplateVariables(emailTemplate.html, {
    customerName: booking.customerName,
    eventTitle: booking.event.title,
    eventDate: new Date(booking.event.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    eventTime: booking.event.time,
    eventLocation: booking.event.location,
    bookingCode: booking.bookingCode,
    quantity: booking.quantity.toString(),
    totalAmount: new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(booking.totalAmount),
  })

  const subject = replaceTemplateVariables(emailTemplate.subject, {
    eventTitle: booking.event.title,
  })

  return await sendEmail({
    to: booking.customerEmail,
    subject,
    html,
  })
}

export async function sendBookingReminderEmail(booking: any): Promise<boolean> {
  const emailTemplate = await getEmailTemplate('booking_reminder')
  
  if (!emailTemplate) {
    console.error('Email template not found: booking_reminder')
    return false
  }

  const html = replaceTemplateVariables(emailTemplate.html, {
    customerName: booking.customerName,
    eventTitle: booking.event.title,
    eventDate: new Date(booking.event.date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    eventTime: booking.event.time,
    eventLocation: booking.event.location,
    bookingCode: booking.bookingCode,
  })

  const subject = replaceTemplateVariables(emailTemplate.subject, {
    eventTitle: booking.event.title,
  })

  return await sendEmail({
    to: booking.customerEmail,
    subject,
    html,
  })
}

async function getEmailTemplate(name: string) {
  try {
    const { db } = await import('@/lib/db')
    return await db.emailTemplate.findUnique({
      where: { name, active: true },
    })
  } catch (error) {
    console.error('Error fetching email template:', error)
    return null
  }
}

function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  
  return result
}