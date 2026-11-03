import { z } from 'zod'

const ROLE_VALUES = ['PRODUCER', 'ADVISOR', 'ADMIN']
const SUBSCRIPTION_STATUS_VALUES = ['ACTIVE', 'EXPIRED', 'CANCELLED']
const PAYMENT_STATUS_VALUES = ['PENDING', 'APPROVED', 'REJECTED']
const PAYMENT_TYPE_VALUES = ['INITIAL', 'RENEWAL']

export const adminUserQuerySchema = z.object({
  role: z
    .enum(ROLE_VALUES, { errorMap: () => ({ message: 'Rol inválido' }) })
    .optional(),
  q: z.string().trim().max(100, 'La búsqueda es demasiado larga').optional(),
})

export const adminSubscriptionQuerySchema = z.object({
  status: z
    .enum(SUBSCRIPTION_STATUS_VALUES, { errorMap: () => ({ message: 'Estado de suscripción inválido' }) })
    .optional(),
  role: z
    .enum(ROLE_VALUES, { errorMap: () => ({ message: 'Rol inválido' }) })
    .optional(),
})

export const adminPaymentQuerySchema = z.object({
  status: z
    .enum(PAYMENT_STATUS_VALUES, { errorMap: () => ({ message: 'Estado de pago inválido' }) })
    .optional(),
  type: z
    .enum(PAYMENT_TYPE_VALUES, { errorMap: () => ({ message: 'Tipo de pago inválido' }) })
    .optional(),
})
