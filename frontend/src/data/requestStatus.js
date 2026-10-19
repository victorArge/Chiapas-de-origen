export const REQUEST_STATUS = {
  PENDING: { label: 'Pendiente', className: 'status-pending' },
  ACCEPTED: { label: 'Aceptada', className: 'status-accepted' },
  REJECTED: { label: 'Rechazada', className: 'status-rejected' },
  FINISHED: { label: 'Finalizada', className: 'status-finished' },
}

export function statusInfo(status) {
  return REQUEST_STATUS[status] || { label: status, className: '' }
}
