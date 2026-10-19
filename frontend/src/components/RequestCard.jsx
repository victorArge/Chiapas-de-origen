import { statusInfo } from '../data/requestStatus.js'

function RequestCard({ request, perspective = 'producer', children }) {
  const status = statusInfo(request.status)
  const counterpart =
    perspective === 'advisor'
      ? `Solicitante: ${request.requester.name}`
      : `Asesor: ${request.advisor.name}`

  return (
    <article className="card request-card">
      <div className="request-head">
        <h3>{request.advisoryType.name}</h3>
        <span className={`status ${status.className}`}>{status.label}</span>
      </div>
      <p className="card-meta">{counterpart}</p>
      <p>{request.problemDescription}</p>
      <p className="muted">
        Creada: {new Date(request.createdAt).toLocaleDateString('es-MX')}
      </p>
      {children}
    </article>
  )
}

export default RequestCard
