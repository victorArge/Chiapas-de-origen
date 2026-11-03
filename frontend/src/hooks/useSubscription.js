import { useContext } from 'react'
import { SubscriptionContext } from '../context/subscriptionContext.js'

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription debe usarse dentro de SubscriptionProvider')
  }
  return context
}
