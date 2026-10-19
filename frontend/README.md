# Frontend — Chiapas de origen

SPA en React 19 + Vite (JavaScript) con React Router. Consulta la [documentación principal](../README.md) para la puesta en marcha completa.

## Comandos

```bash
npm install
npm run dev      # servidor de desarrollo (http://localhost:5173)
npm run build    # build de producción en dist/
npm run preview  # previsualiza el build
npm run lint     # oxlint
```

## Variables de entorno

Crea un archivo `.env` (opcional) para cambiar la URL de la API:

```env
VITE_API_URL=http://localhost:4000/api
```

## Estructura

```
src/
├── components/   Layout, Header, Footer, ProtectedRoute, RequestCard
├── context/      authContext y AuthProvider
├── data/         especialidades y estados de solicitud
├── hooks/        useAuth
├── pages/        páginas de la aplicación
└── services/     cliente de la API
```
