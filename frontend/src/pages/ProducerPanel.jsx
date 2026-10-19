import { useAuth } from '../hooks/useAuth.js'

function ProducerPanel() {
  const { user } = useAuth()

  return (
    <section className="section">
      <h2>Panel del productor</h2>
      <p className="muted">Bienvenido, {user?.name}. Aquí aparecerán tus solicitudes de asesoría.</p>
    </section>
  )
}

export default ProducerPanel
