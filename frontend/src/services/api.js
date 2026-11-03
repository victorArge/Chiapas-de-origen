const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'chiapas_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const headers = { ...authHeaders(), ...(options.headers || {}) }

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.error || `Error ${response.status}`
    const error = new Error(message)
    error.details = data?.details || []
    error.status = response.status
    throw error
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, formData) => request(path, { method: 'POST', body: formData }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  async download(path, filename) {
    const response = await fetch(`${API_URL}${path}`, { headers: authHeaders() })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || `Error ${response.status}`)
    }

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'documento'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}

export { API_URL }
