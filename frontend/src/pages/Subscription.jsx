import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import SubscriptionStatusCard from '../components/SubscriptionStatusCard.jsx'
import {
  paymentStatusInfo,
  paymentTypeInfo,
  statusInfo,
} from '../data/subscriptions.js'
import { formatCurrency, formatDate, formatDateTime } from '../utils/format.js'

function Subscription() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    subscription,
    plan,
    pendingPayment,
    demoNotice,
    loading,
    error,
    refresh,
  } = useSubscription()
  const [payments, setPayments] = useState([])
  const [historyStatus, setHistoryStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadPayments = useCallback(async () => {
    setHistoryStatus('loading')
    try {
      const data = await api.get('/subscriptions/payments/me')
      setPayments(data.items)
      setHistoryStatus('ready')
    } catch (err) {
      setActionError(err.message)
      setHistoryStatus('error')
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments])

  async function runAction(action, successMessage) {
    setActionError('')
    setMessage('')
    setActionLoading(true)

    try {
      await action()
      await Promise.all([refresh(), loadPayments()])
      setMessage(successMessage)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  function confirmPayment() {
    runAction(
      () => api.post(`/subscriptions/payments/${pendingPayment.id}/confirm`, {}),
      'Pago simulado aprobado. Tu suscripción está activa.',
    )
  }

  function rejectPayment() {
    runAction(
      () =>
        api.post(`/subscriptions/payments/${pendingPayment.id}/reject`, {
          reason: 'Operación rechazada manualmente en el entorno DEMO.',
        }),
      'Pago simulado rechazado. Tu suscripción no cambió.',
    )
  }

  const paymentLabel = subscription?.isTrial
    ? 'Simular pago del plan'
    : subscription?.isActive
      ? 'Simular renovación'
      : 'Simular pago de reactivación'

  if (loading && !subscription) {
    return <p className="section muted">Cargando suscripción...</p>
  }

  if (error && !subscription) {
    return (
      <section className="section narrow">
        <h2>No se pudo cargar tu suscripción</h2>
        <p className="error">{error}</p>
        <button className="btn btn-primary" type="button" onClick={refresh}>
          Intentar de nuevo
        </button>
      </section>
    )
  }

  return (
    <section className="section">
      <header className="section-head">
        <p className="eyebrow">Mi suscripción</p>
        <h2>Suscripción de {user?.name}</h2>
        <p className="section-sub">
          Administra tu plan mensual y revisa el historial de operaciones simuladas.
        </p>
      </header>

      {message && <p className="success">{message}</p>}
      {actionError && <p className="error">{actionError}</p>}

      <div className="subscription-layout">
        <div>
          <SubscriptionStatusCard
            subscription={subscription}
            plan={plan}
            notice={demoNotice}
          />

          <div className="subscription-actions">
            {pendingPayment ? (
              <div className="pending-payment">
                <div>
                  <p className="eyebrow">Pago pendiente</p>
                  <strong>
                    {formatCurrency(pendingPayment.amountMxn, pendingPayment.currency)} MXN
                  </strong>
                  <p className="muted">
                    Referencia {pendingPayment.reference} ·{' '}
                    {formatDateTime(pendingPayment.createdAt)}
                  </p>
                </div>
                <div className="request-actions">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={confirmPayment}
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : 'Confirmar pago DEMO'}
                  </button>
                  <button
                    className="btn btn-outline"
                    type="button"
                    onClick={rejectPayment}
                    disabled={actionLoading}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => navigate('/suscripcion/pago')}
                disabled={actionLoading || !subscription}
              >
                {actionLoading ? 'Procesando...' : paymentLabel}
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="panel-subtitle">Historial de pagos</h3>
          {historyStatus === 'loading' && <p className="muted">Cargando pagos...</p>}
          {historyStatus === 'ready' && payments.length === 0 && (
            <p className="muted">Todavía no hay pagos simulados registrados.</p>
          )}

          {historyStatus === 'ready' && payments.length > 0 && (
            <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Moneda</th>
                  <th>Estado</th>
                  <th>Referencia</th>
                  <th>Vencimiento</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const status = statusInfo(paymentStatusInfo, payment.status)
                  return (
                    <tr key={payment.id}>
                      <td>{formatDateTime(payment.createdAt)}</td>
                      <td>
                        {paymentTypeInfo[payment.type] || payment.type}
                        <span className="cell-note">{payment.reference}</span>
                      </td>
                      <td>{formatCurrency(payment.amountMxn, payment.currency)}</td>
                      <td>{payment.currency}</td>
                      <td>
                        <span className={`status ${status.className}`}>{status.label}</span>
                        {payment.failureReason && (
                          <span className="cell-note">{payment.failureReason}</span>
                        )}
                      </td>
                      <td>
                        <code>{payment.reference}</code>
                      </td>
                      <td>{formatDate(subscription?.currentPeriodEnd)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Subscription
