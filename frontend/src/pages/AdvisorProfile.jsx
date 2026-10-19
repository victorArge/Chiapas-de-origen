import { useParams, Link } from 'react-router-dom'

function AdvisorProfile() {
  const { id } = useParams()

  return (
    <section className="section">
      <h2>Perfil del asesor #{id}</h2>
      <p className="muted">
        Los datos del perfil se cargarán desde la API en la siguiente etapa.
      </p>
      <Link className="btn btn-primary" to="/asesores/1/solicitar">
        Solicitar asesoría
      </Link>
    </section>
  )
}

export default AdvisorProfile
