export const PLAN_DURATION_DAYS = 30
export const TRIAL_DURATION_DAYS = 30

export const PAYMENT_NOTICE =
  'Simulación académica: no se realiza ningún cargo real.'

export const PLANS = {
  PRODUCER_MONTHLY: {
    code: 'PRODUCER_MONTHLY',
    name: 'Plan agricultor',
    role: 'PRODUCER',
    priceMxn: 300,
    currency: 'MXN',
    durationDays: PLAN_DURATION_DAYS,
    description: 'Acceso completo a especialidades, búsqueda y solicitudes de asesoría.',
  },
  ADVISOR_MONTHLY: {
    code: 'ADVISOR_MONTHLY',
    name: 'Plan asesor agronómico',
    role: 'ADVISOR',
    priceMxn: 600,
    currency: 'MXN',
    durationDays: PLAN_DURATION_DAYS,
    description: 'Publicación del perfil profesional y recepción de solicitudes.',
  },
}

export function planForRole(role) {
  if (role === 'PRODUCER') return PLANS.PRODUCER_MONTHLY
  if (role === 'ADVISOR') return PLANS.ADVISOR_MONTHLY
  return null
}

export function planByCode(code) {
  return PLANS[code] || null
}

export function planList() {
  return Object.values(PLANS)
}
