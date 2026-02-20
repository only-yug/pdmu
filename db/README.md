# Database Setup

This directory contains the database schema and migration files for the PDUMC Alumni Platform.

## Local Development

For local development with Cloudflare D1:

```bash
# Install wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create a local D1 database
wrangler d1 create pdumc-alumni-db

# Copy the database_id from the output and update wrangler.toml

# Run migrations locally
wrangler d1 execute pdumc-alumni-db --local --file=./db/migrations/001_initial_schema.sql

# Start development server
npm run dev
```

## Production Deployment

```bash
# Create production D1 database
wrangler d1 create pdumc-alumni-db --env production

# Run migrations on production
wrangler d1 execute pdumc-alumni-db --file=./db/migrations/001_initial_schema.sql

# Deploy to Cloudflare Pages
npm run build
wrangler pages deploy
```

## Database Schema

The database consists of the following tables:

- **users**: Authentication and user accounts
- **alumni_profiles**: Alumni information (pre-imported or self-registered)
- **events**: Reunion events
- **event_registrations**: Event sign-ups
- **memories**: Photo gallery
- **announcements**: Platform announcements
- **activity_logs**: Admin monitoring logs

## Adding New Migrations

1. Create a new file in `db/migrations/` with format `002_description.sql`
2. Write your SQL migration
3. Apply it using wrangler:
   ```bash
   wrangler d1 execute pdumc-alumni-db --file=./db/migrations/002_description.sql
   ```
