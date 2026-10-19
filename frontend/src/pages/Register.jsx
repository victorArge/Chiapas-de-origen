import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'PRODUCER' })
  const [error, setError] = useState('')
  const [details, setDetails] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setDetails([])
    setSubmitting(true)

    try {
      const user = await register(form)
      const fallback = user.role === 'ADVISOR' ? '/panel/asesor' : '/panel/productor'
      navigate(fallback, { replace: true })
    } catch (err) {
      setError(err.message)
      if (err.details?.length) setDetails(err.details)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="section narrow">
      <h2>Crear cuenta</h2>
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
          <span>Nombre</span>
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label className="field">
          <span>Correo electrónico</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="field">
          <span>Contraseña (mínimo 8 caracteres)</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>
        <label className="field">
          <span>Tipo de cuenta</span>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="PRODUCER">Productor o solicitante</option>
            <option value="ADVISOR">Asesor agronómico</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  )
}

export default Register
