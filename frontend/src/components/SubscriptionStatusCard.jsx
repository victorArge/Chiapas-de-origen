import { formatCurrency, formatDate } from '../utils/format.js'
import { statusInfo, subscriptionStatusInfo } from '../data/subscriptions.js'

function SubscriptionStatusCard({ subscription, plan, notice }) {
  if (!subscription) {
    return (
      <div className="subscription-card">
        <p className="muted">No hay una suscripción asociada a tu cuenta.</p>
      </div>
    )
  }

  const status = statusInfo(subscriptionStatusInfo, subscription.status)

  return (
    <div className="subscription-card">
      <div className="subscription-card-head">
        <div>
          <p className="eyebrow">{subscription.isTrial ? 'Periodo de prueba' : 'Plan contratado'}</p>
          <h3>{plan?.name || subscription.planName}</h3>
        </div>
        <span className={`status ${status.className}`}>{status.label}</span>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Precio mensual</dt>
          <dd>{formatCurrency(subscription.priceMxn, subscription.currency)} MXN</dd>
        </div>
        <div>
          <dt>Inicio del periodo</dt>
          <dd>{formatDate(subscription.currentPeriodStart)}</dd>
        </div>
        <div>
          <dt>Vencimiento</dt>
          <dd>{formatDate(subscription.currentPeriodEnd)}</dd>
        </div>
        <div>
          <dt>Días restantes</dt>
          <dd>{subscription.daysRemaining}</dd>
        </div>
      </dl>

      {subscription.isTrial && subscription.isActive && (
        <p className="muted">
          Estás en el periodo de prueba de 30 días. Puedes simular un pago para activar tu
          plan mensual en cualquier momento.
        </p>
      )}

      {!subscription.isActive && (
        <p className="error">
          Tu suscripción no está activa. Realiza un pago simulado para volver a usar las
          funciones de tu cuenta.
        </p>
      )}

      {notice && <p className="demo-note">{notice}</p>}
    </div>
  )
}

export default SubscriptionStatusCard
