import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  tenantId?: string;
}

export const tenantAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  const tenantId = process.env[`TENANT_${apiKey}`];

  if (!tenantId) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }

  req.tenantId = tenantId;
  next();
};
