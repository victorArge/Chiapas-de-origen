import { useEffect, useState } from 'react'
import { api } from '../services/api.js'

export function usePlans() {
  const [data, setData] = useState({ items: [], trialDays: 0, notice: '', demo: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get('/subscriptions/plans')
      .then((response) => {
        if (!active) return
        setData(response)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        setError(err.message)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return { ...data, loading, error }
}
