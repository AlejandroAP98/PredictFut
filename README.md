# PredictFut - World Cup 2026 Predictor

A web app to predict FIFA World Cup 2026 match results and compete with friends. Built with Vite + React, Supabase, and Tailwind CSS.

## Features

- User authentication with Supabase (sign up / sign in)
- Predict match scores before kickoff for any group stage match
- **Auto-save**: predictions save automatically 1.5s after you stop typing (debounced)
- **Auto-scoring**: scores calculate automatically on page load + every 5 minutes
- **Date filter**: navigate matchdays with scroll-into-view, today badge
- **Leaderboard**: compare scores with other users, progress bars, current-user highlight
- **Team flags**: displayed via flagcdn.com (ISO 2-letter codes)
- **Stadium names**: shown per match with timezone-aware kickoff times (UTC-5 Colombia)
- **Led digital font** for score inputs and finished results
- **LocalStorage caching**: match data cached 12h to reduce API calls
- Light theme (white bg, emerald green accents)

## Scoring System

Maximum **10 points** per match:

| Condition | Points |
|---|---|
| Correct outcome (win/draw/loss) | +5 (tendencia) |
| Exact home goals | +1 (goles local) |
| Exact away goals | +1 (goles visita) |
| Exact goal difference | +1 (diferencia) |
| Perfect score (all of the above) | +2 (bono pleno) |

- Scores are calculated client-side using `calculatePredictionScore` in `src/lib/api.js`
- The same logic powers the optional `/api/update-scores` endpoint

## Tech Stack

- **Vite + React** (JavaScript)
- **Tailwind CSS v4** with Vite plugin
- **Supabase** (Auth + PostgreSQL)
- **World Cup 2026 API** (https://worldcup26.ir)
- **Vercel** (deployment)
- **react-router-dom**, **date-fns**
- **LedDotMatrix** digital font

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project and run the migration in `supabase/migrations/001_initial_schema.sql` (creates `profiles`, `predictions`, `scores` tables with RLS policies)
4. Create `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (only needed if you trigger the update-scores endpoint externally)
4. Deploy

**Note:** There is no Vercel cron job configured (Hobby plan limitation). Scoring runs on every page load and every 5 minutes via the `useMatches` polling interval. If you want manual score recalculation, hit `GET /api/update-scores` with a `SUPABASE_SERVICE_ROLE_KEY` header.

## Project Structure

```
src/
├── assets/
│   ├── fonts/LedDotMatrix.ttf
│   ├── Logo.svg
│   └── icons/LoaderIcon.tsx
├── components/
│   ├── DateFilter.jsx
│   ├── Leaderboard.jsx
│   ├── MatchCard.jsx
│   └── ScoreRulesTooltip.jsx
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useAutoSavePredictions.js
│   ├── useMatches.js
│   └── useTeams.js
├── lib/
│   ├── api.js          # API client, scoring logic, timezone helpers
│   └── supabase.js     # Supabase client config
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   └── Register.jsx
├── index.css
└── main.jsx
api/
└── update-scores.js    # Serverless function (same scoring logic)
supabase/migrations/
└── 001_initial_schema.sql
```

## Key Decisions

- Match data cached in localStorage (12h TTL) to reduce API calls to worldcup26.ir
- API polled every 5 min instead of 60s to reduce bandwidth on Hobby plan
- Scores written to Supabase only when actual values change (tracked via useRef)
- Timezone conversion via stadium `region` field mapped to IANA zones
- Team flags from `https://flagcdn.com/w80/{iso2}.png`
- No emojis used anywhere in the UI
