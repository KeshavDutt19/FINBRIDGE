import dns from "dns";


dns.setServers(["8.8.8.8", "1.1.1.1"]);

import nearbyBanksRoutes from './routes/nearbyBanks.js';
import "dotenv/config";
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cron from 'node-cron';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import scholarshipRoutes from './routes/scholarships.js';
import loanRoutes from './routes/loans.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import { syncScholarships } from './services/ingestion/sync.js';
import loanIntelligenceRoutes from './routes/loanIntelligence.js';
import {
  updateAllLoanInsights
} from './services/loanIntelligence/updateInsights.js';

// dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

app.get('/api/health', (req, res) => res.json({ ok: true, name: 'FinBridge API' }));
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/loans', loanRoutes);
app.use(
  '/api/loan-intelligence',
  loanIntelligenceRoutes
);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: 'Server error' });
});
app.use(
  '/api/banks',
  nearbyBanksRoutes
);

await connectDB();

if (process.env.ENABLE_SCHEDULER !== 'false') {
  const hours = Number(process.env.SYNC_INTERVAL_HOURS || 24);
  const expression = hours >= 24 ? '0 2 * * *' : `0 */${hours} * * *`;
  cron.schedule(expression, () => {
    syncScholarships().catch(error => console.error('Scheduled scholarship sync failed', error.message));
  });
}

if (
  process.env.LOAN_INSIGHT_ENABLED === 'true'
) {
  cron.schedule(
    '30 3 * * *',
    () => {
      updateAllLoanInsights({
        limit: 20
      })
        .then((results) => {
          console.log(
            'Loan intelligence update completed:',
            results
          );
        })
        .catch((error) => {
          console.error(
            'Loan intelligence update failed:',
            error.message
          );
        });
    }
  );
}


app.listen(port, () => console.log(`FinBridge API running on http://localhost:${port}`));
