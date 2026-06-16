# World Cup 2026 Predictor

A web app to predict FIFA World Cup 2026 match results and compete with friends.

## Features

- User authentication with Supabase
- Predict match scores before kickoff
- **Auto-save**: predictions save automatically as you type
- **Auto-scoring**: scores update automatically via Vercel cron job
- Date filter to view matches by day (shows today by default)
- Leaderboard to compete with other users
- Real-time data from World Cup 2026 API

## Scoring System

- **10 points**: Exact score prediction
- **5 points**: Correct outcome (win/draw/loss)
- **3 points**: Within 2 goals total difference
- **1 point**: Within 4 goals total difference

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a Supabase project and run the migration in `supabase/migrations/001_initial_schema.sql`
4. Copy `.env.example` to `.env.local` and add your Supabase credentials
5. Run the development server: `npm run dev`

## Deployment on Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (for the cron job)
4. Deploy

The cron job runs every 5 minutes to auto-update scores for all users based on finished matches.

## Auto-save & Auto-scoring

- **Predictions**: Saved automatically 1.5s after you stop typing (debounced)
- **Scores**: Calculated automatically on page load + every 5 minutes via Vercel cron job hitting `/api/update-scores`

## Tech Stack

- Vite + React
- Tailwind CSS
- Supabase (Auth + Database)
- World Cup 2026 API (https://worldcup26.ir)
- Vercel (deployment + cron jobs)
