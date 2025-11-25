# Database Setup Guide

## Overview

The Resurrection Platform uses PostgreSQL as its primary database with Prisma ORM for type-safe database access.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- npm or yarn package manager

## Quick Start

### 1. Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE resurrection_platform;

# Create user (optional, for better security)
CREATE USER resurrection_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE resurrection_platform TO resurrection_user;

# Exit psql
\q
```

### 3. Configure Environment Variables

Update `.env` file with your database credentials:

```env
DATABASE_URL="postgresql://resurrection_user:your_secure_password@localhost:5432/resurrection_platform"
```

**Format:** `postgresql://[user]:[password]@[host]:[port]/[database]`

### 4. Run Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate dev

# Or if migrations already exist, just apply them
npx prisma migrate deploy
```

### 5. Verify Connection

```bash
# Test database connection
node test-db-connection.js

# Or use Prisma Studio to browse data
npx prisma studio
```

## Database Schema

The platform uses the following main tables:

- **User** - Platform users with GitHub/Slack integration
- **ABAPObject** - Uploaded ABAP code objects
- **Resurrection** - Transformation projects (ABAP → CAP)
- **TransformationLog** - Workflow step logs (5-step process)
- **QualityReport** - Validation results
- **HookExecution** - Kiro hook execution logs
- **SlackNotification** - Slack message tracking
- **GitHubActivity** - GitHub integration events
- **Redundancy** - Duplicate code detection
- **FitToStandardRecommendation** - SAP standard alternatives

## Common Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

## Using Supabase (Cloud PostgreSQL)

For easier setup, you can use Supabase's free PostgreSQL hosting:

1. Sign up at https://supabase.com
2. Create a new project
3. Get connection string from Settings → Database
4. Update `.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Using Docker (Alternative)

Run PostgreSQL in a container:

```bash
# Start PostgreSQL container
docker run --name resurrection-postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=resurrection_platform \
  -p 5432:5432 \
  -d postgres:14

# Update .env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/resurrection_platform"
```

## Troubleshooting

### Connection Refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:** PostgreSQL is not running. Start it:
- Windows: Check Services → PostgreSQL
- macOS: `brew services start postgresql@14`
- Linux: `sudo systemctl start postgresql`

### Authentication Failed

```
Error: Authentication failed for user
```

**Solution:** Check credentials in `.env` match your PostgreSQL user/password

### Database Does Not Exist

```
Error: database "resurrection_platform" does not exist
```

**Solution:** Create the database:
```bash
psql -U postgres -c "CREATE DATABASE resurrection_platform;"
```

### Migration Conflicts

```
Error: Migration failed to apply
```

**Solution:** Reset and reapply:
```bash
npx prisma migrate reset
npx prisma migrate dev
```

## Production Deployment

For production, use a managed PostgreSQL service:

- **Supabase** - Free tier available, easy setup
- **AWS RDS** - Scalable, enterprise-grade
- **Heroku Postgres** - Simple deployment
- **DigitalOcean Managed Databases** - Cost-effective
- **Azure Database for PostgreSQL** - Microsoft cloud

Update `DATABASE_URL` with production credentials and run:

```bash
npx prisma migrate deploy
```

## Security Best Practices

1. **Never commit `.env`** - It's in `.gitignore`
2. **Use strong passwords** - Generate with password manager
3. **Limit database user permissions** - Don't use superuser in production
4. **Enable SSL** - Add `?sslmode=require` to connection string
5. **Rotate credentials** - Change passwords periodically
6. **Use connection pooling** - For production (PgBouncer, Prisma Data Proxy)

## Next Steps

After database setup:

1. ✅ Prisma is configured
2. ✅ Database is created
3. ✅ Migrations are applied
4. ✅ Connection is verified

Now you can:
- Start the development server: `npm run dev`
- Run tests: `npm test`
- Open Prisma Studio: `npx prisma studio`
- Begin implementing features!

## Support

For issues:
- Check Prisma docs: https://www.prisma.io/docs
- PostgreSQL docs: https://www.postgresql.org/docs/
- Project issues: [GitHub Issues]
