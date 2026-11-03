import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export function useAdvisoryTypes() {
  const [types, setTypes] = useState([])

  useEffect(() => {
    let active = true

    api
      .get('/advisory-types')
      .then((data) => {
        if (active) setTypes(data)
      })
      .catch(() => {
        if (active) setTypes([])
      })

    return () => {
      active = false
    }
  }, [])

  return types
}
