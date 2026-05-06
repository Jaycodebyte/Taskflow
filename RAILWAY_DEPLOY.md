# Railway Deployment

## Railway Project Settings

- Root directory: `build/apps/web`
- Build command: `npm ci && npm run build`
- Start command: `npm run start`

These are also defined in `railway.json`.

## Required Variables

Set these variables on the Railway web service:

```env
AUTH_SECRET=replace-with-a-long-random-secret
AUTH_URL=https://your-railway-domain.up.railway.app
NODE_ENV=production
```

Attach a Railway Postgres database to the project. Railway will provide:

```env
DATABASE_URL=...
```

## Database Setup

Open the Railway Postgres query console and run the SQL from:

```text
database.schema.sql
```

Run it once before using signup/login on the live URL.

## Notes

- Local development can use the in-memory fallback.
- Production must use `DATABASE_URL`; otherwise data will not persist.
- After Railway gives you a domain, update `AUTH_URL` to exactly that URL.
