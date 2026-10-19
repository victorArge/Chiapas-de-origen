import { useAuth } from '../hooks/useAuth.js'

function AdvisorPanel() {
  const { user } = useAuth()

  return (
    <section className="section">
      <h2>Panel del asesor</h2>
      <p className="muted">Bienvenido, {user?.name}. Aquí gestionarás tu perfil y solicitudes.</p>
    </section>
  )
}

export default AdvisorPanel
