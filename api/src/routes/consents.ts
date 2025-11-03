import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/tenant-auth.js';
import { hgtpClient } from '../services/hgtp-client.js';

const router = Router();

const ConsentEventSchema = z.object({
  subject_id: z.string().length(64),
  policy_ref: z.object({
    policy_id: z.string(),
    version: z.string(),
  }),
  event_type: z.enum(['granted', 'revoked', 'updated']),
  timestamp: z.string().datetime(),
});

router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = ConsentEventSchema.parse(req.body);

    const consentEvent = {
      ...data,
      captured_at: new Date().toISOString(),
    };

    const result = await hgtpClient.submitConsentEvent(consentEvent);

    res.status(201).json({
      success: true,
      data: consentEvent,
      transaction_hash: result.hash,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/subject/:subject_id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { subject_id } = req.params;
    const consents = await hgtpClient.getConsentsBySubject(subject_id);

    res.json({ success: true, data: consents });
  } catch (error) {
    next(error);
  }
});

export { router as consentsRouter };
