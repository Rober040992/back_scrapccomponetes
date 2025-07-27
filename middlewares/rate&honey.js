import rateLimit from 'express-rate-limit';
import createError  from 'http-errors';

// RATE LIMITER POR IP (2 cada 1 minuto)
export const limitProductSearch = rateLimit({
  windowMs: 30 * 1000, // 1 minuto
  max: 2,
  message: {
    error: 'Demasiadas peticiones. Intenta de nuevo en un momento.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// HONEYPOT: Campo oculto como trampa para bots
export function honeypotProtection(req, res, next) {
  const honeypot = req.body?.honeypot || req.query?.honeypot;
  if (honeypot && honeypot.trim() !== '') {
    return next(createError(403, 'Acceso denegado (bot detectado)'));
  }
  next();
}
