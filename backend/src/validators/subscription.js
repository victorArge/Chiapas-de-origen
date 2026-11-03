import { z } from 'zod'

export const rejectPaymentSchema = z.object({
  reason: z
    .string()
    .trim()
    .max(300, 'El motivo no puede superar los 300 caracteres')
    .optional(),
})
