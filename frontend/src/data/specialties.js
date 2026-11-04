const establecimientoImage = '/images/Establecimiento.jpeg'
const plagasEnfermedadesImage = '/images/plagas y enfermedades.jpeg'
const aguaRiegoImage = '/images/Agua y riego.jpeg'
const nutricionFertilizacionImage = '/images/Nutrición y fertilización.jpeg'

export const specialties = [
  {
    slug: 'establecimiento',
    name: 'Establecimiento de la plantación',
    image: establecimientoImage,
    blurb:
      'Planificación, siembra y densidad adecuada para un cultivo uniforme y productivo desde el inicio.',
    description:
      'Planificación e inicio del cultivo de plátano, siembra, densidad de plantas y condiciones iniciales para conseguir un desarrollo uniforme y productivo.',
  },
  {
    slug: 'plagas-enfermedades',
    name: 'Control de plagas y enfermedades',
    image: plagasEnfermedadesImage,
    blurb:
      'Diagnóstico, prevención y manejo de insectos, hongos, bacterias y malezas que afectan al cultivo.',
    description:
      'Diagnóstico, prevención y control de insectos, hongos, bacterias y malezas que afectan la salud y productividad del cultivo.',
  },
  {
    slug: 'agua-riego',
    name: 'Gestión del agua y riego',
    image: aguaRiegoImage,
    blurb:
      'Uso eficiente del agua y diseño de sistemas de riego según las necesidades del cultivo.',
    description:
      'Administración eficiente del agua, diseño y operación de sistemas de riego y programación del suministro hídrico según las necesidades del cultivo.',
  },
  {
    slug: 'nutricion-fertilizacion',
    name: 'Nutrición y fertilización',
    image: nutricionFertilizacionImage,
    blurb:
      'Programas de fertilización e interpretación de análisis de suelo y foliares para nutrir el cultivo.',
    description:
      'Diseño de programas de fertilización, interpretación de análisis de suelo y foliares y aplicación adecuada de macro y micronutrientes.',
  },
]