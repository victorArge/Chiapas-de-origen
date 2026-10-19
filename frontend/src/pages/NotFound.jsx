import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="section narrow">
      <h2>Página no encontrada</h2>
      <p className="muted">La ruta solicitada no existe.</p>
      <Link className="btn btn-primary" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFound
