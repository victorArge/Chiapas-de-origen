import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import advisoryTypesRouter from './routes/advisoryTypes.js';
import authRouter from './routes/auth.js';
import advisorsRouter from './routes/advisors.js';
import advisorVerificationRouter from './routes/advisorVerification.js';
import adminRouter from './routes/admin.js';
import requestsRouter from './routes/requests.js';
import subscriptionsRouter from './routes/subscriptions.js';

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = [
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173']),
  ...configuredOrigins,
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chiapas-de-origen-api' });
});

app.use('/api/advisory-types', advisoryTypesRouter);
app.use('/api/auth', authRouter);
app.use('/api/advisors/me/verification', advisorVerificationRouter);
app.use('/api/advisors', advisorsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/requests', requestsRouter);
app.use('/api/subscriptions', subscriptionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
