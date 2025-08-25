// lib/pdf-generator.tsx
// Generador de PDFs para vales regalo
// Creado: 24 Agosto 2025

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer'
import QRCode from 'qrcode'
import { formatAmount, formatDate } from './voucher-utils'

// ================================
// TIPOS
// ================================

export interface VoucherPDFData {
  id: string
  code: string
  type: 'amount' | 'event' | 'pack'
  originalAmount: number
  currentBalance: number
  purchaserName: string
  recipientName?: string
  personalMessage?: string
  expiryDate: Date
  templateUsed: string
  eventTitle?: string
  purchaseDate: Date
}

// ================================
// ESTILOS BASE
// ================================

const baseStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  container: {
    flex: 1,
    border: '2px solid #1a1a2e',
    borderRadius: 15,
    padding: 40,
    position: 'relative'
  },
  header: {
    textAlign: 'center',
    marginBottom: 30
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20
  },
  codeSection: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    textAlign: 'center',
    marginBottom: 30,
    border: '1px solid #dee2e6'
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    letterSpacing: 2,
    marginBottom: 10
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 5
  },
  validUntil: {
    fontSize: 12,
    color: '#666'
  },
  messageSection: {
    backgroundColor: '#fff3cd',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    border: '1px solid #ffeaa7'
  },
  messageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#856404'
  },
  message: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    lineHeight: 1.4
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 5
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase'
  },
  infoValue: {
    fontSize: 12,
    color: '#1a1a2e',
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTop: '1px solid #dee2e6',
    paddingTop: 15
  },
  footerText: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.3
  },
  qrCode: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10
  }
})

// ================================
// ESTILOS POR TEMPLATE
// ================================

const elegantStyles = StyleSheet.create({
  ...baseStyles,
  container: {
    ...baseStyles.container,
    backgroundColor: '#fefefe',
    border: '3px solid #764ba2',
    boxShadow: '0 10px 25px rgba(118, 75, 162, 0.1)'
  },
  title: {
    ...baseStyles.title,
    color: '#764ba2',
    fontSize: 30
  },
  amount: {
    ...baseStyles.amount,
    color: '#764ba2'
  },
  code: {
    ...baseStyles.code,
    color: '#764ba2'
  }
})

const christmasStyles = StyleSheet.create({
  ...baseStyles,
  page: {
    ...baseStyles.page,
    backgroundColor: '#f8f8f8'
  },
  container: {
    ...baseStyles.container,
    backgroundColor: '#ffffff',
    border: '3px solid #bb2528',
    position: 'relative'
  },
  title: {
    ...baseStyles.title,
    color: '#bb2528',
    fontSize: 28
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#165b33'
  },
  amount: {
    ...baseStyles.amount,
    color: '#bb2528'
  },
  code: {
    ...baseStyles.code,
    color: '#165b33'
  }
})

const mysteryStyles = StyleSheet.create({
  ...baseStyles,
  page: {
    ...baseStyles.page,
    backgroundColor: '#1a1a2e'
  },
  container: {
    ...baseStyles.container,
    backgroundColor: '#16213e',
    border: '2px solid #ffd700',
    color: '#ffffff'
  },
  title: {
    ...baseStyles.title,
    color: '#ffd700',
    fontSize: 26
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#cccccc'
  },
  amount: {
    ...baseStyles.amount,
    color: '#ffd700'
  },
  code: {
    ...baseStyles.code,
    color: '#ffd700'
  },
  infoValue: {
    ...baseStyles.infoValue,
    color: '#ffffff'
  },
  codeSection: {
    ...baseStyles.codeSection,
    backgroundColor: '#0f1419',
    border: '1px solid #ffd700'
  }
})

// ================================
// COMPONENTE PDF
// ================================

interface VoucherPDFProps {
  voucher: VoucherPDFData
  qrCodeDataURL?: string
}

export const VoucherPDF: React.FC<VoucherPDFProps> = ({ voucher, qrCodeDataURL }) => {
  // Seleccionar estilos según template
  const getStyles = () => {
    switch (voucher.templateUsed) {
      case 'elegant': return elegantStyles
      case 'christmas': return christmasStyles
      case 'mystery': return mysteryStyles
      default: return baseStyles
    }
  }

  const styles = getStyles()

  // Determinar título según tipo
  const getVoucherTitle = () => {
    switch (voucher.type) {
      case 'event':
        return `Vale para: ${voucher.eventTitle || 'Evento Misterio'}`
      case 'pack':
        return 'Pack Experiencias Mystery'
      default:
        return 'Vale Regalo Mystery Events'
    }
  }

  const getSubtitle = () => {
    switch (voucher.type) {
      case 'event':
        return 'Experiencia única de misterio'
      case 'pack':
        return 'Múltiples aventuras te esperan'
      default:
        return 'La aventura perfecta te está esperando'
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎭 MYSTERY EVENTS</Text>
            <Text style={styles.subtitle}>{getSubtitle()}</Text>
          </View>

          {/* QR Code */}
          {qrCodeDataURL && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <Image src={qrCodeDataURL} style={styles.qrCode} />
            </View>
          )}

          {/* Código y Valor */}
          <View style={styles.codeSection}>
            <Text style={styles.code}>{voucher.code}</Text>
            <Text style={styles.amount}>{formatAmount(voucher.currentBalance)}</Text>
            <Text style={styles.validUntil}>
              Válido hasta: {formatDate(voucher.expiryDate)}
            </Text>
          </View>

          {/* Título personalizado */}
          <View style={{ marginBottom: 20, textAlign: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1a1a2e' }}>
              {getVoucherTitle()}
            </Text>
          </View>

          {/* Mensaje personal */}
          {voucher.personalMessage && (
            <View style={styles.messageSection}>
              <Text style={styles.messageTitle}>Mensaje personal:</Text>
              <Text style={styles.message}>{voucher.personalMessage}</Text>
            </View>
          )}

          {/* Información del vale */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Para</Text>
              <Text style={styles.infoValue}>
                {voucher.recipientName || 'Portador'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>De</Text>
              <Text style={styles.infoValue}>{voucher.purchaserName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha</Text>
              <Text style={styles.infoValue}>
                {formatDate(voucher.purchaseDate)}
              </Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Para usar este vale, presenta el código en el proceso de reserva en mysteryevents.com{'\n'}
              • Los vales no son reembolsables • Válido para una sola transacción{'\n'}
              • En caso de pérdida contacta con admin@mysteryevents.com{'\n'}
              Vale ID: {voucher.id} | Emitido: {formatDate(voucher.purchaseDate)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}

// ================================
// FUNCIONES DE GENERACIÓN
// ================================

/**
 * Genera código QR para validación del vale
 */
export async function generateVoucherQR(voucherCode: string): Promise<string> {
  try {
    const validationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/validate/${voucherCode}`
    return await QRCode.toDataURL(validationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#1a1a2e',
        light: '#ffffff'
      }
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return ''
  }
}

/**
 * Genera PDF del vale como buffer
 */
export async function generateVoucherPDF(
  voucher: VoucherPDFData
): Promise<Buffer> {
  try {
    // Generar QR code
    const qrCodeDataURL = await generateVoucherQR(voucher.code)
    
    // Crear PDF con react-pdf/renderer
    const { pdf } = await import('@react-pdf/renderer')
    
    const pdfDocument = (
      <VoucherPDF voucher={voucher} qrCodeDataURL={qrCodeDataURL} />
    )
    
    // Renderizar a buffer
    const pdfBuffer = await pdf(pdfDocument).toBuffer()
    
    return pdfBuffer
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate voucher PDF')
  }
}

// ================================
// UTILIDADES TEMPLATE
// ================================

export const TEMPLATE_INFO = {
  elegant: {
    name: 'Elegante',
    description: 'Diseño sofisticado con tonos morados',
    primaryColor: '#764ba2',
    suitable: ['cumpleaños', 'aniversarios', 'corporativo']
  },
  christmas: {
    name: 'Navidad',
    description: 'Temática navideña con colores festivos',
    primaryColor: '#bb2528',
    suitable: ['navidad', 'año nuevo', 'fiestas']
  },
  mystery: {
    name: 'Misterio',
    description: 'Diseño oscuro y misterioso',
    primaryColor: '#ffd700',
    suitable: ['halloween', 'eventos nocturnos', 'mystery lovers']
  },
  fun: {
    name: 'Divertido',
    description: 'Colores vibrantes y diseño alegre',
    primaryColor: '#28a745',
    suitable: ['jóvenes', 'grupos de amigos', 'celebraciones']
  }
} as const

export type VoucherTemplate = keyof typeof TEMPLATE_INFO

/**
 * Obtiene información de un template
 */
export function getTemplateInfo(templateId: string) {
  return TEMPLATE_INFO[templateId as VoucherTemplate] || TEMPLATE_INFO.elegant
}