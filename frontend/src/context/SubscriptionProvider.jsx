import { useCallback, useEffect, useState } from 'react'
import { SubscriptionContext } from './subscriptionContext.js'
import { useAuth } from '../hooks/useAuth.js'
import { api } from '../services/api.js'

export function SubscriptionProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [plan, setPlan] = useState(null)
  const [pendingPayment, setPendingPayment] = useState(null)
  const [demoNotice, setDemoNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    if (!user || user.role === 'ADMIN') {
      setSubscription(null)
      setPlan(null)
      setPendingPayment(null)
      setDemoNotice('')
      setError('')
      return null
    }

    setLoading(true)
    setError('')

    try {
      const data = await api.get('/subscriptions/me')
      setSubscription(data.subscription)
      setPlan(data.plan)
      setPendingPayment(data.pendingPayment)
      setDemoNotice(data.notice || '')
      return data.subscription
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setSubscription(null)
      setPlan(null)
      setPendingPayment(null)
      setDemoNotice('')
      setError('')
      setLoading(false)
      return
    }

    refresh()
  }, [authLoading, user, refresh])

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plan,
        pendingPayment,
        demoNotice,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}
