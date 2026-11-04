import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import CheckoutForm from '../components/CheckoutForm.jsx'
import CardVisual from '../components/CardVisual.jsx'
import CheckoutSummary from '../components/CheckoutSummary.jsx'
import PaymentResult from '../components/PaymentResult.jsx'
import { formatCurrency } from '../utils/format.js'

const CHECKOUT_STATUS = {
  INICIADO: 'INICIADO',
  PROCESANDO: 'PROCESANDO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
}

function Checkout() {
  const { user } = useAuth()
  const { subscription, plan, pendingPayment, demoNotice, loading, error, refresh } = useSubscription()
  const navigate = useNavigate()
  const [status, setStatus] = useState(CHECKOUT_STATUS.INICIADO)
  const [result, setResult] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [actionError, setActionError] = useState('')
  const [card, setCard] = useState({
    holderName: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  const [cardErrors, setCardErrors] = useState({})

  const amount = plan?.priceMxn ?? subscription?.priceMxn ?? 0
  const currency = plan?.currency || subscription?.currency || 'MXN'
  const isTrial = Boolean(subscription?.isTrial)
  const submitLabel = isTrial
    ? `Simular activación · ${formatCurrency(amount, currency)} MXN`
    : `Simular renovación · ${formatCurrency(amount, currency)} MXN`

  function handleCardChange(name, value) {
    setCard((current) => ({ ...current, [name]: value }))
  }

  function validateCard() {
    const errors = {}

    if (!card.holderName.trim()) {
      errors.holderName = 'El titular de la tarjeta es obligatorio.'
    }

    const digits = card.cardNumber.replace(/\D/g, '')
    if (digits.length !== 16) {
      errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.'
    }

    const expiryMatch = card.expiry.match(/^(\d{2})\/(\d{2})$/)
    if (!expiryMatch) {
      errors.expiry = 'La fecha de vencimiento debe tener el formato MM/AA.'
    } else {
      const month = Number(expiryMatch[1])
      const year = 2000 + Number(expiryMatch[2])
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() + 1

      if (month < 1 || month > 12) {
        errors.expiry = 'La fecha de vencimiento no es válida.'
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'La fecha de vencimiento debe ser futura.'
      }
    }

    if (!/^\d{3,4}$/.test(card.cvv)) {
      errors.cvv = 'El CVV debe tener 3 o 4 dígitos.'
    }

    return errors
  }

  async function handlePay() {
    if (processing) {
      return
    }

    const errors = validateCard()
    setCardErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setProcessing(true)
    setStatus(CHECKOUT_STATUS.PROCESANDO)
    setActionError('')

    try {
      const paymentId = pendingPayment?.id
      const data = paymentId
        ? await api.post(`/subscriptions/payments/${paymentId}/confirm`, {})
        : await (async () => {
            const created = await api.post('/subscriptions/payments', {})
            return api.post(`/subscriptions/payments/${created.payment.id}/confirm`, {})
          })()

      setResult(data)
      setStatus(CHECKOUT_STATUS.APROBADO)
      await refresh()
    } catch (error) {
      setActionError(error.message)
      setStatus(CHECKOUT_STATUS.INICIED)
    } finally {
      setProcessing(false)
    }
  }

  async function handleReject() {
    if (processing) {
      return
    }

    setProcessing(true)
    setStatus(CHECKOUT_STATUS.PROCESANDO)
    setActionError('')

    try {
      const paymentId = pendingPayment?.id
      const data = paymentId
        ? await api.post(`/subscriptions/payments/${paymentId}/reject`, {
            reason: 'Operación rechazada manualmente.',
          })
        : await (async () => {
            const created = await api.post('/subscriptions/payments', {})
            return api.post(`/subscriptions/payments/${created.payment.id}/reject`, {
              reason: 'Operación rechazada manualmente.',
            })
          })()

      setResult(data)
      setStatus(CHECKOUT_STATUS.RECHAZADO)
      await refresh()
    } catch (error) {
      setActionError(error.message)
      setStatus(CHECKOUT_STATUS.INICIED)
    } finally {
      setProcessing(false)
    }
  }

  function handleRetry() {
    setResult(null)
    setStatus(CHECKOUT_STATUS.INICIADO)
    setActionError('')
  }

  function handleBackToPlan() {
    navigate('/precios')
  }

  if (loading && !subscription) {
    return <p className="section muted">Cargando checkout de pago...</p>
  }

  if (error && !subscription) {
    return (
      <section className="section narrow">
        <h2>No se pudo cargar el checkout</h2>
        <p className="error">{error}</p>
        <button className="btn btn-primary" type="button" onClick={refresh}>
          Intentar de nuevo
        </button>
      </section>
    )
  }

  return (
    <section className="section checkout-section">
      <header className="section-head">
        <p className="checkout-brand">Chiapas de origen</p>
        <p className="eyebrow">Suscripción</p>
        <h2>Checkout de pago</h2>
        <p className="section-sub">
          Este flujo es una simulación académica. Usa solo datos ficticios; no ingreses
          información real de tarjeta.
        </p>
      </header>

      {demoNotice && <p className="demo-note">{demoNotice}</p>}
      {actionError && <p className="error">{actionError}</p>}

      <ol className="checkout-steps">
        {['Plan', 'Pago', 'Resultado'].map((label, index) => (
          <li
            key={label}
            className={index === (status === CHECKOUT_STATUS.APROBADO || status === CHECKOUT_STATUS.RECHAZADO ? 2 : status === CHECKOUT_STATUS.PROCESANDO ? 1 : 0) ? 'is-active' : ''}
          >
            <span className="checkout-step-label">{label}</span>
          </li>
        ))}
      </ol>

      <div className="checkout-layout">
        <div className="checkout-main">
          <CardVisual
            holderName={card.holderName}
            cardNumber={card.cardNumber}
            expiry={card.expiry}
          />

          {status === CHECKOUT_STATUS.APROBADO || status === CHECKOUT_STATUS.RECHAZADO ? (
            <PaymentResult
              status={status}
              result={result}
              user={user}
              plan={plan}
              subscription={subscription}
              onRetry={handleRetry}
              onBackToPlan={handleBackToPlan}
              demoNotice={demoNotice}
            />
          ) : status === CHECKOUT_STATUS.PROCESANDO ? (
            <div className="checkout-processing">
              <span className="spinner" aria-hidden="true" />
              <p>Registrando la simulación...</p>
            </div>
          ) : (
            <CheckoutForm
              card={card}
              errors={cardErrors}
              processing={processing}
              onChange={handleCardChange}
              onSubmit={handlePay}
              onReject={handleReject}
              submitLabel={submitLabel}
              processingLabel="Registrando..."
            />
          )}

          {status === CHECKOUT_STATUS.INICIED && (
            <div className="checkout-actions">
              <button
                className="btn btn-outline btn-block"
                type="button"
                onClick={handleBackToPlan}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <CheckoutSummary subscription={subscription} plan={plan} demoNotice={demoNotice} />
      </div>
    </section>
  )
}

export default Checkout
