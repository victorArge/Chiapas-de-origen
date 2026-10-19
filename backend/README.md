# Backend — Chiapas de origen

API REST con Express 5 y Prisma 7 sobre PostgreSQL. Consulta la [documentación principal](../README.md) para la puesta en marcha completa.

## Comandos

```bash
npm install
npm run dev          # servidor con recarga automática
npm start            # servidor en modo normal
npm run db:migrate   # crear/aplicar migraciones
npm run db:seed      # cargar las 4 especialidades
npm run db:generate  # regenerar el cliente de Prisma
npm run db:studio    # abrir Prisma Studio
```

## Variables de entorno

Copia `.env.example` a `.env` y complétalo (ver la documentación principal).

## Estructura

```
prisma/
├── schema.prisma   modelo de datos
├── migrations/     migraciones
└── seed.js         datos iniciales (especialidades)
src/
├── lib/            cliente de Prisma
├── middleware/     autenticación y autorización por rol
├── routes/         rutas de la API
├── validators/     esquemas de validación con Zod
├── app.js          configuración de Express
└── server.js       arranque del servidor
```
