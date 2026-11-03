import { formatCurrency, formatDate } from '../utils/format.js'

function CheckoutSummary({ subscription, plan, demoNotice }) {
  const planName = plan?.name || subscription?.planName || 'Plan'
  const amount = plan?.priceMxn ?? subscription?.priceMxn ?? 0
  const currency = plan?.currency || subscription?.currency || 'MXN'
  const isTrial = Boolean(subscription?.isTrial)
  const status = subscription?.status
  const currentPeriodStart = subscription?.currentPeriodStart
  const currentPeriodEnd = subscription?.currentPeriodEnd

  return (
    <aside className="checkout-summary">
      <h3>Resumen del plan</h3>
      <dl className="detail-list">
        <div>
          <dt>Plan</dt>
          <dd>{planName}</dd>
        </div>
        <div>
          <dt>Concepto</dt>
          <dd>{isTrial ? 'Periodo de prueba' : 'Plan mensual'}</dd>
        </div>
        <div>
          <dt>Precio</dt>
          <dd>
            {formatCurrency(amount, currency)} MXN
          </dd>
        </div>
        <div>
          <dt>Periodo</dt>
          <dd>
            {currentPeriodStart ? `${formatDate(currentPeriodStart)} — ${formatDate(currentPeriodEnd)}` : '30 días'}
          </dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{status}</dd>
        </div>
      </dl>
      {demoNotice && <p className="demo-note">{demoNotice}</p>}
    </aside>
  )
}

export default CheckoutSummary
