import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import {
  paymentStatusInfo,
  paymentTypeInfo,
  statusInfo,
  subscriptionStatusInfo,
  verificationStatusInfo,
} from '../data/subscriptions.js'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
} from '../utils/format.js'
import BrandBanner from '../components/BrandBanner.jsx'

const SECTIONS = [
  { id: 'overview', label: 'Resumen' },
  { id: 'verifications', label: 'Verificaciones' },
  { id: 'users', label: 'Usuarios' },
  { id: 'subscriptions', label: 'Suscripciones' },
  { id: 'payments', label: 'Pagos' },
]

function Stat({ label, value, note }) {
  return (
    <div className="stat-card">
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {note && <span className="stat-note">{note}</span>}
    </div>
  )
}

function AdminPanel() {
  const { user } = useAuth()
  const [section, setSection] = useState('overview')
  const [overview, setOverview] = useState(null)
  const [verifications, setVerifications] = useState([])
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [actionId, setActionId] = useState('')
  const [rejectingId, setRejectingId] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const [verificationFilter, setVerificationFilter] = useState('PENDING')
  const [userRole, setUserRole] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')

  const loadAll = useCallback(async () => {
    setError('')
    try {
      const [overviewData, verificationData, userData, subscriptionData, paymentData] =
        await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/verifications'),
          api.get('/admin/users'),
          api.get('/admin/subscriptions'),
          api.get('/admin/payments'),
        ])

      setOverview(overviewData)
      setVerifications(verificationData.items)
      setUsers(userData.items)
      setSubscriptions(subscriptionData.items)
      setPayments(paymentData.items)
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const pendingVerifications = useMemo(
    () => verifications.filter((item) => item.status === 'PENDING'),
    [verifications],
  )

  const filteredVerifications = useMemo(() => {
    if (!verificationFilter) return verifications
    return verifications.filter((item) => item.status === verificationFilter)
  }, [verifications, verificationFilter])

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase()

    return users.filter((item) => {
      if (userRole && item.role !== userRole) return false
      if (!query) return true
      return (
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query)
      )
    })
  }, [users, userRole, userQuery])

  const filteredSubscriptions = useMemo(() => {
    if (!subscriptionFilter) return subscriptions
    return subscriptions.filter((item) => item.status === subscriptionFilter)
  }, [subscriptions, subscriptionFilter])

  const filteredPayments = useMemo(() => {
    if (!paymentFilter) return payments
    return payments.filter((item) => item.status === paymentFilter)
  }, [payments, paymentFilter])

  async function handleDownload(document) {
    setError('')
    try {
      const path = document.downloadUrl.replace(/^\/api/, '')
      await api.download(path, document.originalName)
    } catch (err) {
      setError(`No se pudo descargar el documento: ${err.message}`)
    }
  }

  async function approveVerification(id) {
    setActionId(id)
    setMessage('')
    setError('')

    try {
      const data = await api.post(`/admin/verifications/${id}/approve`, {})
      setVerifications((current) =>
        current.map((item) => (item.id === id ? data.verification : item)),
      )
      setMessage('Verificación aprobada. El asesor podrá mostrarse como verificado.')
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId('')
    }
  }

  async function rejectVerification(event, id) {
    event.preventDefault()
    setMessage('')
    setError('')

    if (rejectReason.trim().length < 5) {
      setError('El motivo de rechazo debe tener al menos 5 caracteres.')
      return
    }

    setActionId(id)

    try {
      const data = await api.post(`/admin/verifications/${id}/reject`, {
        reason: rejectReason.trim(),
      })
      setVerifications((current) =>
        current.map((item) => (item.id === id ? data.verification : item)),
      )
      setRejectingId('')
      setRejectReason('')
      setMessage('Verificación rechazada y motivo registrado.')
      await loadAll()
    } catch (err) {
      setError(err.message)
    } finally {
      setActionId('')
    }
  }

  if (status === 'loading') {
    return <p className="section muted">Cargando panel administrador...</p>
  }

  if (status === 'error') {
    return (
      <section className="section narrow">
        <h2>No se pudo cargar el panel</h2>
        <p className="error">{error}</p>
        <button className="btn btn-primary" type="button" onClick={loadAll}>
          Intentar de nuevo
        </button>
      </section>
    )
  }

  return (
    <section className="section admin-section">
      <BrandBanner image="/images/BienvenidosaChiapasdeOrigen.png" title="Panel administrativo" description="Panel institucional para la revisión de solicitudes y suscripciones." className="brand-banner-compact" />
      <div className="admin-head">
        <div>
          <p className="eyebrow">Administración</p>
          <h2>Panel administrador</h2>
          <p className="muted">
            Hola, {user?.name}. Revisa verificaciones, cuentas, suscripciones y pagos.
          </p>
        </div>
        <button className="btn btn-outline" type="button" onClick={loadAll}>
          Actualizar datos
        </button>
      </div>

      {overview?.notice && <p className="demo-note">{overview.notice}</p>}
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <div className="tabs" role="tablist" aria-label="Secciones del panel">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={section === item.id}
            className={`tab${section === item.id ? ' is-active' : ''}`}
            onClick={() => setSection(item.id)}
          >
            {item.label}
            {item.id === 'verifications' && pendingVerifications.length > 0 && (
              <span className="tab-count">{pendingVerifications.length}</span>
            )}
          </button>
        ))}
      </div>

      {section === 'overview' && overview && (
        <>
          <div className="stats-grid">
            <Stat
              label="Usuarios"
              value={overview.users.total}
              note={`${overview.users.producers} productores ${overview.users.advisors} asesores`}
            />
            <Stat
              label="Suscripciones activas"
              value={overview.subscriptions.active}
              note={`${overview.subscriptions.expired} vencidas`}
            />
            <Stat
              label="Verificaciones pendientes"
              value={overview.verifications.pending}
              note={`${overview.verifications.approved} aprobadas`}
            />
            <Stat
              label="Simulaciones aprobadas"
              value={formatCurrency(overview.payments.approvedAmountMxn)}
              note={`${overview.payments.approved} operaciones de demostración`}
            />
          </div>

          <div className="panel-grid admin-overview-grid">
            <div>
              <h3 className="panel-subtitle">Verificaciones por revisar</h3>
              {pendingVerifications.length === 0 ? (
                <p className="muted">No hay verificaciones pendientes.</p>
              ) : (
                <ul className="compact-list">
                  {pendingVerifications.slice(0, 5).map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.advisor.name}</strong>
                        <span className="muted">{item.advisor.municipality}, {item.advisor.state}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-small"
                        type="button"
                        onClick={() => setSection('verifications')}
                      >
                        Revisar
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className="panel-subtitle">Últimos pagos</h3>
              {payments.length === 0 ? (
                <p className="muted">Todavía no hay pagos registrados.</p>
              ) : (
                <ul className="compact-list">
                  {payments.slice(0, 5).map((payment) => {
                    const paymentStatus = statusInfo(paymentStatusInfo, payment.status)
                    return (
                      <li key={payment.id}>
                        <div>
                          <strong>{payment.user.name}</strong>
                          <span className="muted">
                            {formatCurrency(payment.amountMxn)} {paymentTypeInfo[payment.type]}
                          </span>
                        </div>
                        <span className={`status ${paymentStatus.className}`}>
                          {paymentStatus.label}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {section === 'verifications' && (
        <div>
          <div className="toolbar">
            <label className="field">
              <span>Estado</span>
              <select
                value={verificationFilter}
                onChange={(event) => setVerificationFilter(event.target.value)}
              >
                <option value="">Todas</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobadas</option>
                <option value="REJECTED">Rechazadas</option>
                <option value="NOT_SUBMITTED">Sin enviar</option>
              </select>
            </label>
          </div>

          {filteredVerifications.length === 0 ? (
            <p className="muted">No hay verificaciones con ese estado.</p>
          ) : (
            <div className="admin-list">
              {filteredVerifications.map((item) => {
                const verificationStatus = statusInfo(verificationStatusInfo, item.status)
                return (
                  <article className="card admin-card" key={item.id}>
                    <div className="request-head">
                      <div>
                        <h3>{item.advisor.name}</h3>
                        <p className="card-meta">
                          {item.advisor.email} {item.advisor.municipality},{' '}
                          {item.advisor.state}
                        </p>
                      </div>
                      <span className={`status ${verificationStatus.className}`}>
                        {verificationStatus.label}
                      </span>
                    </div>

                    <p>{item.advisor.description}</p>
                    <p className="muted">{item.advisor.experience}</p>

                    <ul className="tag-list">
                      {item.advisor.specialties.map((specialty) => (
                        <li className="tag" key={specialty.id}>
                          {specialty.name}
                        </li>
                      ))}
                    </ul>

                    <div className="detail-block">
                      <h4>Documentos</h4>
                      {item.documents.length === 0 ? (
                        <p className="muted">Sin documentos.</p>
                      ) : (
                        <ul className="document-list">
                          {item.documents.map((document) => (
                            <li key={document.id}>
                              <div>
                                <strong>{document.originalName}</strong>
                                <span className="muted">
                                  {formatFileSize(document.sizeBytes)} {' '}
                                  {formatDate(document.createdAt)}
                                </span>
                              </div>
                              <button
                                className="btn btn-outline btn-small"
                                type="button"
                                onClick={() => handleDownload(document)}
                              >
                                Descargar
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {item.rejectionReason && (
                      <p className="error">Motivo de rechazo: {item.rejectionReason}</p>
                    )}

                    {item.status === 'PENDING' && (
                      <div className="admin-actions">
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => approveVerification(item.id)}
                          disabled={actionId === item.id}
                        >
                          {actionId === item.id ? 'Procesando...' : 'Aprobar'}
                        </button>
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => {
                            setRejectingId(rejectingId === item.id ? '' : item.id)
                            setRejectReason('')
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    )}

                    {rejectingId === item.id && (
                      <form
                        className="reject-form"
                        onSubmit={(event) => rejectVerification(event, item.id)}
                      >
                        <label className="field">
                          <span>Motivo del rechazo</span>
                          <textarea
                            value={rejectReason}
                            onChange={(event) => setRejectReason(event.target.value)}
                            rows={3}
                            minLength={5}
                            maxLength={500}
                            required
                          />
                        </label>
                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={actionId === item.id}
                        >
                          {actionId === item.id ? 'Guardando...' : 'Confirmar rechazo'}
                        </button>
                      </form>
                    )}

                    {item.reviews.length > 0 && (
                      <div className="detail-block">
                        <h4>Historial de revisión</h4>
                        <ul className="compact-list">
                          {item.reviews.map((review) => (
                            <li key={review.id}>
                              <div>
                                <strong>
                                  {review.decision === 'APPROVED' ? 'Aprobada' : 'Rechazada'} por{' '}
                                  {review.reviewer?.name || 'Administrador'}
                                </strong>
                                <span className="muted">
                                  {formatDateTime(review.createdAt)}
                                  {review.reason ? ` ${review.reason}` : ''}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      )}

      {section === 'users' && (
        <div>
          <div className="toolbar">
            <label className="field">
              <span>Buscar</span>
              <input
                value={userQuery}
                onChange={(event) => setUserQuery(event.target.value)}
                placeholder="Nombre o correo"
              />
            </label>
            <label className="field">
              <span>Rol</span>
              <select value={userRole} onChange={(event) => setUserRole(event.target.value)}>
                <option value="">Todos</option>
                <option value="PRODUCER">Productor</option>
                <option value="ADVISOR">Asesor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Suscripción</th>
                  <th>Verificación</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((item) => {
                  const subscriptionStatus = item.subscription
                    ? statusInfo(subscriptionStatusInfo, item.subscription.status)
                    : null
                  const verificationStatus = item.advisorProfile
                    ? statusInfo(
                        verificationStatusInfo,
                        item.advisorProfile.verificationStatus,
                      )
                    : null

                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <span className="cell-note">{item.email}</span>
                      </td>
                      <td>{item.role}</td>
                      <td>
                        {subscriptionStatus ? (
                          <>
                            <span className={`status ${subscriptionStatus.className}`}>
                              {subscriptionStatus.label}
                            </span>
                            <span className="cell-note">
                              {item.subscription.isTrial ? 'Prueba' : 'Plan'} {item.subscription.daysRemaining} días
                            </span>
                          </>
                        ) : (
                          <span className="muted">Sin suscripción</span>
                        )}
                      </td>
                      <td>
                        {verificationStatus ? (
                          <span className={`status ${verificationStatus.className}`}>
                            {verificationStatus.label}
                          </span>
                        ) : (
                          <span className="muted">No aplica</span>
                        )}
                      </td>
                      <td>{formatDate(item.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'subscriptions' && (
        <div>
          <div className="toolbar">
            <label className="field">
              <span>Estado</span>
              <select
                value={subscriptionFilter}
                onChange={(event) => setSubscriptionFilter(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Activas</option>
                <option value="EXPIRED">Vencidas</option>
                <option value="CANCELLED">Canceladas</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Plan</th>
                  <th>Estado</th>
                  <th>Periodo</th>
                  <th>Precio</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((item) => {
                  const subscriptionStatus = statusInfo(
                    subscriptionStatusInfo,
                    item.status,
                  )
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.user.name}</strong>
                        <span className="cell-note">
                          {item.user.email} {item.user.role}
                        </span>
                      </td>
                      <td>
                        {item.planName}
                        <span className="cell-note">
                          {item.isTrial ? 'Periodo de prueba' : 'Plan mensual'}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${subscriptionStatus.className}`}>
                          {subscriptionStatus.label}
                        </span>
                      </td>
                      <td>
                        {formatDate(item.currentPeriodStart)} -{' '}
                        {formatDate(item.currentPeriodEnd)}
                        <span className="cell-note">{item.daysRemaining} días restantes</span>
                      </td>
                      <td>{formatCurrency(item.priceMxn, item.currency)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === 'payments' && (
        <div>
          <div className="toolbar">
            <label className="field">
              <span>Estado</span>
              <select
                value={paymentFilter}
                onChange={(event) => setPaymentFilter(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendientes</option>
                <option value="APPROVED">Aprobados</option>
                <option value="REJECTED">Rechazados</option>
              </select>
            </label>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Usuario</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item) => {
                  const paymentStatus = statusInfo(paymentStatusInfo, item.status)
                  return (
                    <tr key={item.id}>
                      <td>
                        <code>{item.reference}</code>
                      </td>
                      <td>
                        <strong>{item.user.name}</strong>
                        <span className="cell-note">{item.user.email}</span>
                      </td>
                      <td>{paymentTypeInfo[item.type] || item.type}</td>
                      <td>{formatCurrency(item.amountMxn, item.currency)}</td>
                      <td>
                        <span className={`status ${paymentStatus.className}`}>
                          {paymentStatus.label}
                        </span>
                      </td>
                      <td>{formatDateTime(item.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export default AdminPanel
