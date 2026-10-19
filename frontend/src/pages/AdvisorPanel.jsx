import { useEffect, useState } from 'react'
import { api } from '../services/api.js'
import { useAuth } from '../hooks/useAuth.js'

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
  const [types, setTypes] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [hasProfile, setHasProfile] = useState(false)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [details, setDetails] = useState([])
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([api.get('/advisory-types'), api.get('/advisors/me')])
      .then(([advisoryTypes, me]) => {
        if (!active) return
        setTypes(advisoryTypes)
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
      const method = hasProfile ? api.put : api.post
      const data = await method('/advisors/me', form)
      setHasProfile(true)
      setForm((current) => ({
        ...current,
        specialtyIds: data.profile.specialties.map((s) => s.id),
      }))
      setSuccess('Perfil guardado correctamente.')
    } catch (err) {
      setError(err.message)
      if (err.details?.length) setDetails(err.details)
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading') return <p className="section muted">Cargando perfil...</p>
  if (status === 'error') return <p className="section error">No se pudo cargar el perfil: {error}</p>

  return (
    <section className="section narrow">
      <h2>Panel del asesor</h2>
      <p className="muted">
        {hasProfile
          ? `Edita tu perfil profesional, ${user?.name}.`
          : `Completa tu perfil profesional para aparecer en el directorio, ${user?.name}.`}
      </p>

      {success && <p className="success">{success}</p>}
      {error && <p className="error">{error}</p>}
      {details.length > 0 && (
        <ul className="error-list">
          {details.map((detail) => (
            <li key={detail.field}>{detail.message}</li>
          ))}
        </ul>
      )}

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
          <input name="municipality" value={form.municipality} onChange={handleChange} required />
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
    </section>
  )
}

export default AdvisorPanel
