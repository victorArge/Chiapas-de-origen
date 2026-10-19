import { useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { api, getToken, setToken } from '../services/api.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    let active = true

    if (!getToken()) {
      return () => {
        active = false
      }
    }

    api
      .get('/auth/me')
      .then((data) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        setToken(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  async function login(email, password) {
    const data = await api.post('/auth/login', { email, password })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  async function register(payload) {
    const data = await api.post('/auth/register', payload)
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
