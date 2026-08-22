# FinBridge - Unified Scholarship & Loan Discovery Portal

FinBridge is a hackathon MVP that helps users discover scholarships and compare loan options across education, home and car financing. It is an information and discovery platform only. It does not approve, sanction, disburse or submit real applications to any government portal, bank or lender.

## Why FinBridge?

Students and families often search across many government portals, state sites and bank websites to understand financial assistance. FinBridge gives them one place to build a basic profile, discover relevant scholarships, compare loan products, and continue through official application sources with clear data transparency.

## Features

- Premium React landing page with scholarship and loan CTAs
- JWT registration, login and protected routes
- User profile for personal, academic, financial and loan preference data
- Scholarship discovery with filters, sorting and rule-based eligibility explanations
- Scholarship details with benefits, documents, deadlines, source, last verified date and official portal links
- Loan categories for education, home and car loans
- Bank comparison table with up to 3 selected products
- Loan detail pages with rate, tenure, subsidy/concession, documents and official links
- Demo application form that saves metadata only and never submits to lenders
- Admin dashboard for totals, sync logs, failed sources and data freshness
- Ingestion architecture: scheduler -> source fetcher -> parser/adapter -> normalizer -> validation/upsert -> MongoDB -> frontend

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Framer Motion, Lucide React
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Auth: JWT, bcrypt
- Data ingestion: Node.js adapters, Cheerio-ready architecture, fetch/Axios
- Deployment targets: Vercel frontend, Render/Railway backend, MongoDB Atlas

## Architecture

```text
frontend/
  src/components
  src/context
  src/pages
  src/lib/api.js

backend/
  src/models
  src/routes
  src/middleware
  src/services/eligibilityEngine.js
  src/services/ingestion
    sources/scholarships/nsp.js
    sources/loans/bankExample.js
    normalize.js
    sync.js
  src/data/seedData.js
```

Frontend consumes normalized API data only. Source adapters are isolated so future official sources can be added without coupling UI code to scraped HTML. The MVP intentionally does not bypass CAPTCHA, authentication, robots.txt, anti-bot systems or access controls. If automated retrieval is unavailable, the adapter records the source as unavailable and falls back to curated demo data.

## Database Schema

Core collections:

- `User`: name, email, passwordHash, phone, userType, profile
- `Scholarship`: provider, criteria, benefits, documents, deadlines, officialUrl, sourceUrl, sourceName, lastUpdated, dataLabel
- `LoanProduct`: bankName, category, rate fields, amount, tenure, fees, documents, subsidy, officialUrl, source metadata, disclaimer
- `Application`: demo-only application metadata and document checklist flags
- `SyncLog`: sync status, new/updated counts, failed sources and timestamps

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `GET /api/scholarships`
- `GET /api/scholarships/:id`
- `POST /api/scholarships/:id/check-eligibility`
- `GET /api/loans`
- `GET /api/loans/:category`
- `GET /api/loans/:category/:id`
- `POST /api/applications`
- `GET /api/applications`
- `POST /api/admin/sync-scholarships`
- `POST /api/admin/sync-loans`
- `GET /api/admin/stats`

## Daily Updates

Set `SYNC_INTERVAL_HOURS=24` and `ENABLE_SCHEDULER=true`. The backend schedules scholarship syncs and the admin can manually run scholarship or loan syncs. In this MVP, source adapters return demo/manual data and record official sources that are unavailable for automated retrieval.

## Installation

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run seed
npm run dev
```

If you do not already have MongoDB running locally, start the included demo database first:

```bash
docker compose up -d mongo
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Demo accounts after seeding:

- Student: `demo@finbridge.dev` / `password123`
- Admin: `admin@finbridge.dev` / `admin123`

## Environment Variables

Backend:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `SYNC_INTERVAL_HOURS`
- `ENABLE_SCHEDULER`

Frontend:

- `VITE_API_URL`

## Deployment

- Deploy `frontend` to Vercel with `VITE_API_URL` set to the backend URL.
- Deploy `backend` to Render/Railway with MongoDB Atlas `MONGODB_URI`, `JWT_SECRET` and `CLIENT_ORIGIN`.
- Run `npm run seed` once against the target database for demo data.

## Limitations

- Financial data is demo/curated unless explicitly verified.
- Rates, eligibility, deadlines and policies can change.
- Demo application flow does not submit to official portals or lenders.
- No real KYC, Aadhaar, payment or document verification is implemented.

## Future Improvements

- Add verified source adapters where allowed by official sites
- Add change detection and review queues for admins
- Add richer match scoring and user notifications
- Add source screenshots or audit history for compliance review
- Add lender and scholarship partner APIs where officially available
