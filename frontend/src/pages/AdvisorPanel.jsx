import { useEffect, useRef, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'
import { useSubscription } from '../hooks/useSubscription.js'
import BrandBanner from '../components/BrandBanner.jsx'
import RequestCard from '../components/RequestCard.jsx'
import SubscriptionBanner from '../components/SubscriptionBanner.jsx'
import {
  documentTypeLabel,
  documentTypeOptions,
  statusInfo,
  verificationStatusInfo,
} from '../data/subscriptions.js'
import { formatDateTime, formatFileSize } from '../utils/format.js'

const EMPTY_FORM = {
  description: '',
  experience: '',
  state: '',
  municipality: '',
  contactInformation: '',
  specialtyIds: [],
}

function AdvisorPanel() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [types, setTypes] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [hasProfile, setHasProfile] = useState(false)
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [details, setDetails] = useState([])
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verificationData, setVerificationData] = useState(null)
  const [verificationError, setVerificationError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [verificationBusy, setVerificationBusy] = useState(false)
  const [uploadType, setUploadType] = useState('PROFESSIONAL_LICENSE')
  const [uploadFile, setUploadFile] = useState(null)
  const fileInputRef = useRef(null)

  async function loadVerification() {
    const data = await api.get('/advisors/me/verification')
    setVerificationData(data)
  }

  useEffect(() => {
    let active = true

    Promise.all([
      api.get('/advisory-types'),
      api.get('/advisors/me'),
      api.get('/requests/me'),
      api.get('/advisors/me/verification'),
    ])
      .then(([advisoryTypes, me, requestList, verification]) => {
        if (!active) return
        setTypes(advisoryTypes)
        setRequests(requestList.items)
        setVerificationData(verification)
        if (me.profile) {
          setHasProfile(true)
          setForm({
            description: me.profile.description,
            experience: me.profile.experience,
            state: me.profile.state,
            municipality: me.profile.municipality,
            contactInformation: me.profile.contactInformation,
            specialtyIds: me.profile.specialties.map((s) => s.id),
          })
        }
        setStatus('ready')
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      active = false
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const toggleSpecialty = (id) => {
    setForm((current) => {
      const selected = current.specialtyIds.includes(id)
      return {
        ...current,
        specialtyIds: selected
          ? current.specialtyIds.filter((item) => item !== id)
          : [...current.specialtyIds, id],
      }
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setDetails([])
    setSuccess('')
    setSubmitting(true)

    try {
      const data = hasProfile
        ? await api.put('/advisors/me', form)
        : await api.post('/advisors', form)
      setHasProfile(true)
      setForm((current) => ({
        ...current,
        specialtyIds: data.profile.specialties.map((s) => s.id),
      }))
      await loadVerification()
      setSuccess('Perfil guardado correctamente.')
    } catch (err) {
      setError(err.message)
      if (err.details?.length) setDetails(err.details)
    } finally {
      setSubmitting(false)
    }
  }

  async function updateStatus(requestId, newStatus) {
    setError('')
    try {
      const data = await api.patch(`/requests/${requestId}/status`, { status: newStatus })
      setRequests((current) =>
        current.map((request) => (request.id === requestId ? data.request : request)),
      )
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleUpload(event) {
    event.preventDefault()
    setVerificationError('')
    setVerificationMessage('')

    if (!uploadFile) {
      setVerificationError('Selecciona un archivo PDF, JPG o PNG.')
      return
    }

    const formData = new FormData()
    formData.append('type', uploadType)
    formData.append('file', uploadFile)

    setVerificationBusy(true)

    try {
      await api.postForm('/advisors/me/verification/documents', formData)
      setUploadFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await loadVerification()
      setVerificationMessage('Documento subido correctamente.')
    } catch (err) {
      setVerificationError(err.message)
    } finally {
      setVerificationBusy(false)
    }
  }

  async function handleDeleteDocument(documentId) {
    setVerificationError('')
    setVerificationMessage('')
    setVerificationBusy(true)

    try {
      await api.delete(`/advisors/me/verification/documents/${documentId}`)
      await loadVerification()
      setVerificationMessage('Documento eliminado.')
    } catch (err) {
      setVerificationError(err.message)
    } finally {
      setVerificationBusy(false)
    }
  }

  async function handleSubmitVerification() {
    setVerificationError('')
    setVerificationMessage('')
    setVerificationBusy(true)

    try {
      await api.post('/advisors/me/verification/submit', {})
      await loadVerification()
      setVerificationMessage('Documentos enviados. Tu verificación está en revisión.')
    } catch (err) {
      setVerificationError(err.message)
    } finally {
      setVerificationBusy(false)
    }
  }

  if (status === 'loading') return <p className="section muted">Cargando panel...</p>
  if (status === 'error') return <p className="section error">No se pudo cargar el panel: {error}</p>

  const verification = verificationData?.verification
  const documents = verificationData?.documents || []
  const reviews = verificationData?.reviews || []
  const verificationStatus = statusInfo(
    verificationStatusInfo,
    verification?.status || 'NOT_SUBMITTED',
  )
  const canEditDocuments =
    verification?.status !== 'PENDING' && verification?.status !== 'APPROVED'

  if (
    user?.role === 'ADVISOR' &&
    Boolean(subscription?.isActive) &&
    !subscription?.isTrial &&
    verification?.status === 'PENDING'
  ) {
    return (
      <section className="section">
        <div className="advisor-grid">
          <div className="advisor-copy">
            <p className="eyebrow">Asesor agronómico</p>
            <h2>Estás dentro del proceso de activación</h2>
            <p>
              La simulación académica quedó registrada. Estamos esperando la revisión de tu
              documentación profesional para habilitar el panel profesional.
            </p>
            <p className="advisor-lock-message">Contenido exclusivo para agricultores suscritos</p>
            {verification?.rejectionReason && (
              <p className="error">Motivo de rechazo: {verification.rejectionReason}</p>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section">
      <BrandBanner
        title="Panel del asesor"
        description="Panel profesional para la revisión y gestión de solicitudes de asesoría."
        className="brand-banner-compact"
      />
      <h2>Panel del asesor</h2>
      <p className="muted">
        {hasProfile
          ? `Gestiona tu perfil y solicitudes, ${user?.name}.`
          : `Completa tu perfil profesional para aparecer en el directorio, ${user?.name}.`}
      </p>

      <SubscriptionBanner />

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      {details.length > 0 && (
        <ul className="error-list">
          {details.map((detail) => (
            <li key={detail.field}>{detail.message}</li>
          ))}
        </ul>
      )}

      <div className="verification-card">
        <div className="verification-head">
          <div>
            <h3 className="panel-subtitle">Verificación profesional</h3>
            <p className="muted">
              Sube tu documentación para que un administrador revise tu perfil. La
              verificación es independiente de tu pago y suscripción.
            </p>
          </div>
          <span className={`status ${verificationStatus.className}`}>
            {verificationStatus.label}
          </span>
        </div>

        {verification?.rejectionReason && (
          <p className="error">Motivo de rechazo: {verification.rejectionReason}</p>
        )}
        {verificationMessage && <p className="success">{verificationMessage}</p>}
        {verificationError && <p className="error">{verificationError}</p>}

        {!verificationData?.profileComplete ? (
          <p className="muted">
            Guarda tu perfil profesional y selecciona al menos una especialidad antes de
            subir documentos.
          </p>
        ) : (
          <>
            {documents.length > 0 && (
              <ul className="document-list">
                {documents.map((document) => (
                  <li key={document.id}>
                    <div>
                      <strong>{document.originalName}</strong>
                      <span className="muted">
                        {documentTypeLabel(document.type)} ·{' '}
                        {formatFileSize(document.sizeBytes)} ·{' '}
                        {formatDateTime(document.createdAt)}
                      </span>
                    </div>
                    {canEditDocuments && (
                      <button
                        className="btn btn-outline btn-small"
                        type="button"
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={verificationBusy}
                      >
                        Eliminar
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {canEditDocuments && (
              <form className="upload-form" onSubmit={handleUpload}>
                <label className="field">
                  <span>Tipo de documento</span>
                  <select
                    value={uploadType}
                    onChange={(event) => setUploadType(event.target.value)}
                  >
                    {documentTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Archivo (PDF, JPG o PNG, máximo 5 MB)</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  />
                </label>

                <button className="btn btn-outline" type="submit" disabled={verificationBusy}>
                  {verificationBusy ? 'Subiendo...' : 'Subir documento'}
                </button>
              </form>
            )}

            {verification?.status === 'PENDING' && (
              <p className="muted">
                Tu documentación está en revisión. No puedes modificarla mientras esperas
                la decisión del administrador.
              </p>
            )}

            {verification?.status === 'APPROVED' && (
              <p className="success">
                Tu verificación fue aprobada. Tu perfil puede mostrarse como verificado
                cuando tu suscripción esté activa.
              </p>
            )}

            {documents.length > 0 &&
              verification?.status !== 'PENDING' &&
              verification?.status !== 'APPROVED' && (
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleSubmitVerification}
                  disabled={verificationBusy}
                >
                  {verificationBusy ? 'Enviando...' : 'Enviar a revisión'}
                </button>
              )}
          </>
        )}

        {reviews.length > 0 && (
          <div className="detail-block">
            <h4>Historial de revisión</h4>
            <ul className="compact-list">
              {reviews.map((review) => (
                <li key={review.id}>
                  <div>
                    <strong>
                      {review.decision === 'APPROVED' ? 'Aprobada' : 'Rechazada'} por{' '}
                      {review.reviewer?.name || 'Administrador'}
                    </strong>
                    <span className="muted">
                      {formatDateTime(review.createdAt)}
                      {review.reason ? ` · ${review.reason}` : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="panel-grid">
        <div>
          <h3 className="panel-subtitle">Perfil profesional</h3>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Descripción profesional</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </label>

            <label className="field">
              <span>Experiencia</span>
              <textarea
                name="experience"
                value={form.experience}
                onChange={handleChange}
                rows={3}
                required
              />
            </label>

            <label className="field">
              <span>Estado</span>
              <input name="state" value={form.state} onChange={handleChange} required />
            </label>

            <label className="field">
              <span>Municipio</span>
              <input
                name="municipality"
                value={form.municipality}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span>Información de contacto</span>
              <input
                name="contactInformation"
                value={form.contactInformation}
                onChange={handleChange}
                required
              />
            </label>

            <fieldset className="field checkpoint">
              <legend>Especialidades</legend>
              {types.map((type) => (
                <label className="check" key={type.id}>
                  <input
                    type="checkbox"
                    checked={form.specialtyIds.includes(type.id)}
                    onChange={() => toggleSpecialty(type.id)}
                  />
                  <span>{type.name}</span>
                </label>
              ))}
            </fieldset>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : hasProfile ? 'Guardar cambios' : 'Crear perfil'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="panel-subtitle">Solicitudes recibidas</h3>
          {requests.length === 0 ? (
            <p className="muted">Aún no has recibido solicitudes.</p>
          ) : (
            <div className="request-list">
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} perspective="advisor">
                  <div className="request-actions">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          className="btn btn-primary"
                          type="button"
                          onClick={() => updateStatus(request.id, 'ACCEPTED')}
                        >
                          Aceptar
                        </button>
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={() => updateStatus(request.id, 'REJECTED')}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                    {request.status === 'ACCEPTED' && (
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => updateStatus(request.id, 'FINISHED')}
                      >
                        Marcar como finalizada
                      </button>
                    )}
                  </div>
                </RequestCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AdvisorPanel
