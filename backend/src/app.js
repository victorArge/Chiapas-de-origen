import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import advisoryTypesRouter from './routes/advisoryTypes.js';
import authRouter from './routes/auth.js';
import advisorsRouter from './routes/advisors.js';
import requestsRouter from './routes/requests.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chiapas-de-origen-api' });
});

app.use('/api/advisory-types', advisoryTypesRouter);
app.use('/api/auth', authRouter);
app.use('/api/advisors', advisorsRouter);
app.use('/api/requests', requestsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export default app;
