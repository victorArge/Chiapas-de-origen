import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const advisoryTypes = await prisma.advisoryType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
    res.json(advisoryTypes);
  } catch (error) {
    next(error);
  }
});

export default router;
