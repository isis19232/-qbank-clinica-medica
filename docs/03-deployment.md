# Deployment Guide

## Overview

QBank Clínica Médica is designed to run on Vercel with PostgreSQL as the production database. This guide covers the setup and deployment process.

## Architecture

- **Development**: Next.js with SQLite (local file-based database)
- **Production**: Next.js on Vercel with Vercel Postgres (PostgreSQL)
- **Database Migrations**: Prisma Migrate for version control and safe schema updates
- **Authentication**: Opaque session tokens with HttpOnly cookies and scrypt password hashing
- **AI Features**: Optional Anthropic API integration (application works without it)

## Prerequisites

1. **Vercel Account**: https://vercel.com
2. **Vercel Postgres Setup**: Create a PostgreSQL database through Vercel's dashboard
3. **Environment Variables**: Prepare all required settings (see section below)
4. **GitHub Repository**: Code must be pushed to a GitHub repository connected to Vercel

## Environment Variables

### Required (Production)

```env
# PostgreSQL connection string from Vercel Postgres
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Secure authentication secret (generate with: openssl rand -base64 32)
AUTH_SECRET="your-32-byte-random-secret-here"

# Next.js environment
NODE_ENV="production"
```

### Optional

```env
# Anthropic API key for AI features (e.g., question generation, tutor)
# Application functions normally without this key using offline fallback
ANTHROPIC_API_KEY="sk-ant-..."

# AI model to use (default: claude-opus-5)
AI_MODEL="claude-opus-5"
```

## Local Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Local Database

```bash
npm run setup
```

This runs:
- `prisma generate` — Generate Prisma Client
- `prisma db push` — Create/update SQLite schema
- `npm run db:seed` — Populate with clinical questions and taxonomy

### 3. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

### 4. Database Commands

```bash
# View/edit database (Prisma Studio)
npx prisma studio

# Reset development database
npm run db:reset

# Generate Prisma Client only
npm run db:generate

# Push schema changes (dev only, not for production)
npm run db:push
```

## Testing Production Build Locally

### 1. Build Production Bundle

```bash
npm run build
```

Verify that "Compiled successfully" appears with no errors.

### 2. Run Production Build

```bash
npm start
```

Server runs at `http://localhost:3000` with production optimizations.

### 3. Test Features

- **Login/Register**: Create an account and authenticate
- **Clinical Content**: Browse questions across specialties
- **Spaced Repetition**: Answer questions and verify SM-2 scheduling
- **Error Notebook**: Generate errors and review classification
- **X-Ray Analysis** (if applicable): Exam performance analytics
- **AI Features** (if ANTHROPIC_API_KEY set): Question generation and tutoring

## Vercel Deployment

### Step 1: Connect Repository

1. Go to https://vercel.com/new
2. Select GitHub and authorize Vercel
3. Select this repository
4. Configure settings (defaults usually work)

### Step 2: Set Environment Variables

In Vercel project settings:

1. Go to **Settings → Environment Variables**
2. Add each variable:
   - `DATABASE_URL` (Vercel Postgres connection string)
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `ANTHROPIC_API_KEY` (optional, for AI features)
   - `AI_MODEL` (optional, defaults to "claude-opus-5")

### Step 3: Database Setup

1. Create Vercel Postgres database in your Vercel project
2. Copy the connection string to `DATABASE_URL` environment variable
3. Vercel's build will automatically run migrations

### Step 4: Deploy

Push to your connected GitHub branch. Vercel will:

1. Run `prisma migrate deploy` — Apply any pending migrations
2. Run `npm run build` — Build Next.js application
3. Deploy to Vercel's global edge network

## Database Migrations

### Development

For local schema changes during development:

```bash
# Make changes to prisma/schema.prisma
# Then push to SQLite:
npm run db:push

# Or reset and reseed:
npm run db:reset
```

### Production

Migrations are handled automatically:

1. Update `prisma/schema.prisma`
2. Create a migration: `npx prisma migrate dev --name your_migration_name`
3. Commit the migration file
4. Push to GitHub
5. Vercel automatically runs `prisma migrate deploy` during build

For manual migration creation (if needed):

```bash
# Create migration without applying it
npx prisma migrate dev --name your_migration_name

# Later, deploy manually:
# npx prisma migrate deploy
```

## Seed Data

Clinical questions are seeded from `prisma/seed/` files:

- `taxonomy.ts` — Specialty/topic hierarchy (16 specialties, 74 topics)
- `questions-cardio-pneumo.ts` — Cardiology/Pneumology questions
- `questions-neuro-nefro-endo.ts` — Neurology/Nephrology/Endocrinology
- `questions-infecto-hemato-onco.ts` — Infectious/Hematology/Oncology
- `questions-emergencia-geriatria.ts` — Emergency/Geriatrics
- `questions-discursivas.ts` — Discursive-type questions

The seed is run automatically by Vercel's build process (via `prisma/seed.ts`).

To reseed in production (⚠️ warning: clears existing data):

```bash
# In Vercel terminal or locally with production database:
npx prisma db seed
```

## Troubleshooting

### Build Fails with "DATABASE_URL not set"

**Cause**: Environment variable not configured in Vercel

**Solution**: 
1. Go to Vercel project settings
2. Add `DATABASE_URL` to Environment Variables
3. Redeploy

### Build Fails with Migration Errors

**Cause**: Pending migrations not deployed

**Solution**:
1. Ensure `DATABASE_URL` points to a valid PostgreSQL database
2. Check that `prisma/migrations/` directory contains all migration files
3. Commit all migration files to Git
4. Redeploy

### Application Crashes After Deploy

**Cause**: Database connection issues

**Solution**:
1. Verify `DATABASE_URL` connection string in Vercel environment
2. Ensure PostgreSQL database is running and accessible
3. Check Vercel logs: `vercel logs <project>`
4. Verify auth credentials in connection string

### AI Features Not Working

**Cause**: `ANTHROPIC_API_KEY` not set or invalid

**Solution**:
- Application works without this key using offline fallback
- To enable AI features: Set `ANTHROPIC_API_KEY` in Vercel environment
- Verify key has appropriate permissions

## Performance Monitoring

After deployment, monitor:

1. **Vercel Analytics**: https://vercel.com/analytics
2. **Build Times**: Typically 2-3 minutes
3. **Database Connections**: Vercel Postgres dashboard
4. **Error Logs**: `vercel logs <project> --error`

## Security Considerations

1. **AUTH_SECRET**: Generate a new 32-byte random secret for production
2. **DATABASE_URL**: Use connection strings with SSL (`sslmode=require`)
3. **API Keys**: Never commit secrets to Git; use environment variables only
4. **Session Tokens**: Stored as HttpOnly cookies, scrypt-hashed

## Rollback

To rollback to a previous deployment:

1. Go to Vercel project → Deployments
2. Find the deployment to restore
3. Click "..." → Promote to Production
4. Or revert your Git branch and push

## Support

For issues:
1. Check Vercel logs: `vercel logs --follow`
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check Next.js deployment docs: https://nextjs.org/docs/app/building-your-application/deploying

## Next Steps

After successful deployment:
1. Verify all features work in production
2. Monitor error logs for 24 hours
3. Set up automated backups for PostgreSQL
4. Consider adding analytics/monitoring tools
