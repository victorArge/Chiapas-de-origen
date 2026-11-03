export const subscriptionStatusInfo = {
  ACTIVE: { label: 'Activa', className: 'status-active' },
  EXPIRED: { label: 'Vencida', className: 'status-expired' },
  CANCELLED: { label: 'Cancelada', className: 'status-cancelled' },
}

export const paymentStatusInfo = {
  PENDING: { label: 'Pendiente', className: 'status-pending' },
  APPROVED: { label: 'Aprobado', className: 'status-approved' },
  REJECTED: { label: 'Rechazado', className: 'status-rejected' },
}

export const paymentTypeInfo = {
  INITIAL: 'Pago inicial',
  RENEWAL: 'Renovación',
}

export const verificationStatusInfo = {
  NOT_SUBMITTED: { label: 'Sin enviar', className: 'status-neutral' },
  PENDING: { label: 'En revisión', className: 'status-pending' },
  APPROVED: { label: 'Aprobada', className: 'status-approved' },
  REJECTED: { label: 'Rechazada', className: 'status-rejected' },
}

export const documentTypeOptions = [
  { value: 'IDENTIFICATION', label: 'Identificación oficial' },
  { value: 'PROOF_OF_STUDIES', label: 'Comprobante de estudios' },
  { value: 'PROFESSIONAL_LICENSE', label: 'Cédula profesional' },
  { value: 'CERTIFICATE', label: 'Certificado' },
  { value: 'OTHER', label: 'Otro documento' },
]

export function documentTypeLabel(value) {
  return documentTypeOptions.find((option) => option.value === value)?.label || 'Documento'
}

export function statusInfo(map, value) {
  return map[value] || { label: value || 'Sin estado', className: 'status-neutral' }
}
