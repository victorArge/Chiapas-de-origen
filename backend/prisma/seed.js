import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma.js'

const SALT_ROUNDS = 10
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const advisoryTypes = [
  {
    name: 'Establecimiento de la plantación',
    description:
      'Planificación e inicio del cultivo de plátano, siembra, densidad de plantas y condiciones iniciales para conseguir un desarrollo uniforme y productivo.',
  },
  {
    name: 'Control de plagas y enfermedades',
    description:
      'Diagnóstico, prevención y control de insectos, hongos, bacterias y malezas que afectan la salud y productividad del cultivo.',
  },
  {
    name: 'Gestión del agua y riego',
    description:
      'Administración eficiente del agua, diseño y operación de sistemas de riego y programación del suministro hídrico según las necesidades del cultivo.',
  },
  {
    name: 'Nutrición y fertilización',
    description:
      'Diseño de programas de fertilización, interpretación de análisis de suelo y foliares y aplicación adecuada de macro y micronutrientes.',
  },
]

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  const name = process.env.ADMIN_NAME?.trim() || 'Administrador'

  if (!email && !password) {
    console.log(
      'Admin: no se creó ninguna cuenta. Define ADMIN_EMAIL y ADMIN_PASSWORD para crearla.',
    )
    return
  }

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben definirse juntos')
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('ADMIN_EMAIL no es un correo válido')
  }
  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 8 caracteres')
  }

  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    if (existing.role !== 'ADMIN') {
      console.warn(
        `Admin: ya existe una cuenta con ${email} y no tiene rol ADMIN. No se modificó.`,
      )
      return
    }

    console.log(`Admin: la cuenta ${email} ya existe, sin cambios.`)
    return
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  await prisma.user.create({
    data: { name, email, passwordHash, role: 'ADMIN' },
  })
  console.log(`Admin: cuenta ${email} creada correctamente.`)
}

async function main() {
  for (const type of advisoryTypes) {
    await prisma.advisoryType.upsert({
      where: { name: type.name },
      update: { description: type.description },
      create: type,
    })
  }

  const count = await prisma.advisoryType.count()
  console.log(`Seed completado: ${count} especialidades en la base de datos.`)

  await seedAdmin()
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
