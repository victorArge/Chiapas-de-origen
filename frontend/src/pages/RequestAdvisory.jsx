import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { specialties } from '../data/specialties.js'

function RequestAdvisory() {
  const { id } = useParams()
  const [form, setForm] = useState({ advisoryType: '', problemDescription: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  return (
    <section className="section narrow">
      <h2>Solicitar asesoría</h2>
      <p className="muted">Asesor #{id}</p>
      <form className="form" onSubmit={(event) => event.preventDefault()}>
        <label className="field">
          <span>Especialidad</span>
          <select name="advisoryType" value={form.advisoryType} onChange={handleChange} required>
            <option value="">Selecciona una especialidad</option>
            {specialties.map((specialty) => (
              <option key={specialty.slug} value={specialty.slug}>
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
        <p className="muted">El envío se conectará a la API en la Etapa 6.</p>
        <button className="btn btn-primary" type="submit">
          Enviar solicitud
        </button>
      </form>
    </section>
  )
}

export default RequestAdvisory
