import { z } from 'zod'

export const DOCUMENT_TYPES = [
  'IDENTIFICATION',
  'PROOF_OF_STUDIES',
  'PROFESSIONAL_LICENSE',
  'CERTIFICATE',
  'OTHER',
]

export const VERIFICATION_STATUSES = ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED']

export const documentTypeSchema = z.enum(DOCUMENT_TYPES, {
  errorMap: () => ({ message: 'Tipo de documento inválido' }),
})

export const rejectVerificationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'El motivo de rechazo debe tener al menos 5 caracteres')
    .max(500, 'El motivo no puede superar los 500 caracteres'),
})

export const verificationQuerySchema = z.object({
  status: z
    .enum(VERIFICATION_STATUSES, {
      errorMap: () => ({ message: 'Estado de verificación inválido' }),
    })
    .optional(),
})
