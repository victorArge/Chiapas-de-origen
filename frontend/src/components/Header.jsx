import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PlantIcon } from './Icons.jsx'

function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const panelPath =
    user?.role === 'ADMIN'
      ? '/panel/admin'
      : user?.role === 'ADVISOR'
        ? '/panel/asesor'
        : '/panel/productor'

  function closeMenu() {
    setOpen(false)
  }

  function handleLogout() {
    logout()
    closeMenu()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <PlantIcon />
          </span>
          Chiapas de origen
        </Link>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((current) => !current)}
        >
          <span className="sr-only">Abrir menú de navegación</span>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            {open ? (
              <path d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>

        <nav id="site-nav" className={`site-nav${open ? ' is-open' : ''}`}>
          <NavLink to="/especialidades" onClick={closeMenu}>
            Especialidades
          </NavLink>
          <NavLink to="/asesores" onClick={closeMenu}>
            Asesores
          </NavLink>
          <NavLink to="/precios" onClick={closeMenu}>
            Precios
          </NavLink>
          {user ? (
            <>
              <NavLink to={panelPath} onClick={closeMenu}>
                {user.role === 'ADMIN' ? 'Panel admin' : 'Mi panel'}
              </NavLink>
              {user.role !== 'ADMIN' && (
                <NavLink to="/suscripcion" onClick={closeMenu}>
                  Suscripción
                </NavLink>
              )}
              <span className="nav-user">Hola, {user.name}</span>
              <button className="nav-button" type="button" onClick={handleLogout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={closeMenu}>
                Iniciar sesión
              </NavLink>
              <NavLink className="nav-cta" to="/registro" onClick={closeMenu}>
                Registrarse
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
