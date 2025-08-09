import { rateLimit } from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 60 * 1000, //* 1 min
  limit: 5,
  message: { error: 'Has alcanzado el límite de peticiones' },
});
