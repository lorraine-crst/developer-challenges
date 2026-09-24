import rateLimit from 'express-rate-limit';
import { resolveLanguage, translate } from '../lib/i18n';

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const language = resolveLanguage(req.headers['x-language']);

    res.status(429).json({ error: translate('auth.tooManyAttempts', language) });
  },
});