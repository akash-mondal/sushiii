import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { policiesRouter } from './routes/policies.js';
import { consentsRouter } from './routes/consents.js';
import { proofBundlesRouter } from './routes/proof-bundles.js';
import { errorHandler } from './middleware/error-handler.js';
import { tenantAuth } from './middleware/tenant-auth.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/policies', tenantAuth, policiesRouter);
app.use('/api/consents', tenantAuth, consentsRouter);
app.use('/api/proof-bundles', tenantAuth, proofBundlesRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Sushiii API server listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
});
