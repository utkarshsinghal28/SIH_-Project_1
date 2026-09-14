import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import centreRoutes from './centreRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

/** GET /api/health - liveness + database connectivity. */
router.get('/health', (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    data: {
      service: 'krishi-procurement-api',
      stage: 'part-2-backend',
      database: connected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

router.use('/auth', authRoutes);
router.use('/centres', centreRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

export default router;
