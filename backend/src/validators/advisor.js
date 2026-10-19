import { z } from 'zod';

export const advisorProfileSchema = z.object({
  description: z.string().trim().min(20, 'La descripción debe tener al menos 20 caracteres'),
  experience: z.string().trim().min(10, 'Describe tu experiencia (mínimo 10 caracteres)'),
  state: z.string().trim().min(1, 'El estado es obligatorio'),
  municipality: z.string().trim().min(1, 'El municipio es obligatorio'),
  contactInformation: z.string().trim().min(5, 'Agrega información de contacto'),
  specialtyIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Selecciona al menos una especialidad')
    .max(4, 'Solo hay 4 especialidades disponibles'),
});

export const advisorQuerySchema = z.object({
  specialty: z.string().trim().optional(),
  state: z.string().trim().optional(),
  municipality: z.string().trim().optional(),
  q: z.string().trim().optional(),
});
