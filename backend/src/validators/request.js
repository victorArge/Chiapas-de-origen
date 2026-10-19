import { z } from 'zod';

export const createRequestSchema = z.object({
  advisorProfileId: z.string().trim().min(1, 'El asesor es obligatorio'),
  advisoryTypeId: z.string().trim().min(1, 'La especialidad es obligatoria'),
  problemDescription: z
    .string()
    .trim()
    .min(10, 'Describe tu problema con al menos 10 caracteres'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'FINISHED'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
});

export const ALLOWED_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['FINISHED'],
  REJECTED: [],
  FINISHED: [],
};
