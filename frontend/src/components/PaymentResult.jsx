import { useNavigate } from 'react-router-dom'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format.js'

function PaymentResult({
  status,
  result,
  user,
  plan,
  subscription,
  onRetry,
  onBackToPlan,
  demoNotice,
}) {
  const navigate = useNavigate()

  if (status === 'APROBADO' || result?.payment?.status === 'APPROBADO') {
    const payment = result?.payment
    const subscriptionData = result?.subscription || subscription
    const planName = subscriptionData?.planName || plan?.name
    const amount = subscriptionData?.priceMxn || payment?.amountMxn
    const currency = subscriptionData?.currency || payment?.currency
    const reference = payment?.reference
    const confirmedAt = payment?.confirmedAt
    const currentPeriodEnd = subscriptionData?.currentPeriodEnd

    return (
      <div className="payment-result">
        <svg
          className="payment-result-icon"
          viewBox="0 0 24 24"
          width="56"
          height="56"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </svg>
        <h3>Pago aprobado</h3>
        <p>
          Tu suscripción fue activada correctamente. El pago confirmado es una simulación
          de demostración.
        </p>

        <dl className="detail-list">
          <div>
            <dt>Plan</dt>
            <dd>{planName}</dd>
          </div>
          <div>
            <dt>Monto</dt>
            <dd>
              {formatCurrency(amount, currency)} MXN
            </dd>
          </div>
          <div>
            <dt>Referencia</dt>
            <dd>{reference}</dd>
          </div>
          <div>
            <dt>Fecha</dt>
            <dd>{formatDateTime(confirmedAt)}</dd>
          </div>
          <div>
            <dt>Vence</dt>
            <dd>{formatDate(currentPeriodEnd)}</dd>
          </div>
        </dl>

        {demoNotice && <p className="demo-note">{demoNotice}</p>}

        <div className="request-actions">
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => navigate(user?.role === 'ADVISOR' ? '/panel/asesor' : '/panel/productor')}
          >
            Ir al panel
          </button>
          <button className="btn btn-outline" type="button" onClick={() => window.print()}>
            Imprimir comprobante
          </button>
        </div>
      </div>
    )
  }

  if (status === 'RECHAZADO' || result?.payment?.status === 'RECHAZADO') {
    const payment = result?.payment
    const reason = payment?.failureReason || 'Operación rechazada manualmente en el entorno DEMO.'

    return (
      <div className="payment-result">
        <h3>Pago rechazado</h3>
        <p>El pago simulado fue rechazado.</p>
        <p>Motivo: {reason}</p>
        <p>La suscripción no se activó con este intento.</p>

        <div className="request-actions">
          <button className="btn btn-primary" type="button" onClick={onRetry}>
            Volver a intentarlo
          </button>
          <button className="btn btn-outline" type="button" onClick={onBackToPlan}>
            Volver al plan
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default PaymentResult
