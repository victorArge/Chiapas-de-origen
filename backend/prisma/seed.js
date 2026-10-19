import { prisma } from '../src/lib/prisma.js'

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
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
