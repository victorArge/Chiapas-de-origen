import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api.js'

function RequestAdvisory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [advisor, setAdvisor] = useState(null)
  const [form, setForm] = useState({ advisoryTypeId: '', problemDescription: '' })
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    api
      .get(`/advisors/${id}`)
      .then((data) => {
        if (!active) return
        setAdvisor(data.profile)
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
  }, [id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await api.post('/requests', {
        advisorProfileId: id,
        advisoryTypeId: form.advisoryTypeId,
        problemDescription: form.problemDescription,
      })
      navigate('/panel/productor')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <p className="section muted">Cargando...</p>
  if (status === 'error') return <p className="section error">{error}</p>

  return (
    <section className="section narrow">
      <h2>Solicitar asesoría</h2>
      <p className="muted">Asesor: {advisor.name}</p>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Especialidad</span>
          <select
            name="advisoryTypeId"
            value={form.advisoryTypeId}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una especialidad</option>
            {advisor.specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Descripción del problema</span>
          <textarea
            name="problemDescription"
            value={form.problemDescription}
            onChange={handleChange}
            rows={5}
            required
          />
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </section>
  )
}

export default RequestAdvisory
