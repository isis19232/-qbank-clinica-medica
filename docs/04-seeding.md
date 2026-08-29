# Database Seeding Guide

## Overview

The QBank database needs to be populated with:
- **Taxonomy**: 16 specialties, 74 topics, 59 subtopics
- **Questions**: 27 original clinical questions
- **Profiles**: Exam profiles for calibration
- **Tags**: Categorization tags

This guide covers three methods to seed the database.

---

## Method 1: Automatic Seeding (Recommended for Vercel)

The build command includes automatic seeding:

```bash
prisma migrate deploy && npm run build && npx prisma db seed
```

**When**: Runs automatically during Vercel deployment (if `npx prisma db seed` succeeds)

**If it fails**: Use Method 2 or 3 below

---

## Method 2: Manual Seed via API Endpoint

### Development

Access the seed page locally:

```
http://localhost:3000/admin/seed
```

Click "Iniciar Seed" button. The page will populate the database and show statistics.

### Production (Vercel)

Call the seed endpoint directly:

```bash
# Without authentication (if no SEED_TOKEN set)
curl -X POST https://your-deployment.vercel.app/api/admin/seed

# With authentication (if SEED_TOKEN is set)
curl -X POST https://your-deployment.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN"
```

Or use the admin page:
```
https://your-deployment.vercel.app/admin/seed
```

### Adding Security Token (Optional)

For production deployments, add a `SEED_TOKEN` environment variable in Vercel:

1. Go to Vercel project settings → Environment Variables
2. Add `SEED_TOKEN` with a secure random value
3. The endpoint will now require:
   ```
   Authorization: Bearer <SEED_TOKEN>
   ```

---

## Method 3: Command Line Seed (Local)

Requires direct database access:

```bash
# Development (SQLite)
npm run db:seed

# Production (PostgreSQL)
# Set your production DATABASE_URL, then:
DATABASE_URL="postgresql://..." npx prisma db seed
```

---

## What Gets Seeded

### Taxonomy (Idempotent)
- **Areas**: Clínica Médica
- **Specialties**: 16 (Cardiology, Pneumology, Neurology, etc.)
- **Topics**: 74 across all specialties
- **Subtopics**: 59 for detailed categorization

### Questions (Idempotent)
All questions are upserted by code (CM-CARD-0001, etc.), so:
- Running seed multiple times is safe
- Updated questions are refreshed
- No duplicates created

**Question Distribution**:
- Cardiology/Pneumology: 8 questions
- Neurology/Nephrology/Endocrinology: 8 questions
- Infectious/Hematology/Oncology: 6 questions
- Emergency/Geriatrics: 4 questions
- Discursive: 1 question
- **Total: 27 questions** across all difficulty levels and reasoning types

### Exam Profiles
- Default profile: "internato-clinica-medica"
- Calibrated statistics for question generation
- Blueprint for simulated exams

### Tags
Categorization tags for questions (themes, guidelines, skills)

---

## Verifying Success

After seeding, check:

1. **App filters show data**:
   - "Especialidade" dropdown lists specialties
   - "Perfil" dropdown shows "Internato de Clínica Médica"

2. **Questions visible**:
   - Navigate to /questoes
   - See 27 questions in the bank

3. **Database directly**:
   ```bash
   # Count questions
   SELECT COUNT(*) FROM "Question";  -- Should be 27
   
   # Count specialties
   SELECT COUNT(*) FROM "Specialty";  -- Should be 16
   ```

---

## Troubleshooting

### Seed Endpoint Returns 401

**Cause**: SEED_TOKEN is set in Vercel but Authorization header is missing

**Solution**:
```bash
curl -X POST https://your-deployment.vercel.app/api/admin/seed \
  -H "Authorization: Bearer YOUR_SEED_TOKEN"
```

Or remove SEED_TOKEN from Vercel environment if security isn't needed.

### Seed Endpoint Returns 500

**Cause**: Database connection failed or seed data validation error

**Solution**:
1. Verify `DATABASE_URL` is correct in Vercel
2. Check Vercel logs: `vercel logs --follow`
3. Ensure migrations were applied: `prisma migrate deploy`
4. Try seed again

### Questions Not Appearing in Filters

**Cause**: Seed didn't complete or foreign key constraint failed

**Solution**:
1. Check that specialties exist: `SELECT * FROM "Specialty" LIMIT 5;`
2. Re-run seed via `/admin/seed` or API
3. If still failing, check Vercel logs for specific error

### "Seed command failed" During Vercel Build

**Cause**: Seed validation error (usually missing dependencies or bad data)

**Solution**:
1. Build will still succeed (seed is post-build)
2. Use Method 2 to seed manually after deployment
3. Check logs with `vercel logs --follow`

---

## Idempotency & Safety

All seed operations use **upsert** (update or insert):
- Running seed multiple times is safe
- No data loss
- Questions are updated if they change
- Perfect for development iterations

---

## For Developers

### Adding New Questions

Edit one of these files:
- `prisma/seed/questions-*.ts`

Then re-run seed:
```bash
npm run db:seed
```

### Modifying Taxonomy

Edit `prisma/seed/taxonomy.ts`, then:
```bash
npm run db:seed
```

### Clearing & Reseeding

```bash
# Development only
npm run db:reset  # Drops DB, recreates schema, seeds

# Production: NOT recommended (data loss)
# Instead, create a new migration and deploy
```

---

## Next Steps

After successful seeding:
1. ✅ Log in with demo account
2. ✅ Browse /questoes - should show 27 questions
3. ✅ Solve questions - motor features work
4. ✅ Check /raio-x - exam analysis available
5. ✅ Test /estudar - adaptive learning blocks work

See [docs/03-deployment.md](./03-deployment.md) for next production steps.
