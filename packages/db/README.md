# @sandboox/db

Database package for Sandboox using Prisma ORM with PostgreSQL.

## Setup

### 1. Start PostgreSQL

```bash
docker run -d \
  --name sandboox-db \
  -e POSTGRES_USER=sandboox \
  -e POSTGRES_PASSWORD=sandboox123 \
  -e POSTGRES_DB=sandboox \
  -p 5432:5432 \
  postgres
```

### 2. Configure Environment

Create a `.env` file:

```env
DATABASE_URL="postgresql://sandboox:sandboox123@localhost:5432/sandboox"
```

### 3. Push Schema & Generate Client

```bash
pnpm dlx prisma db push      # Push schema to database
pnpm dlx prisma generate     # Generate Prisma client
```

## Schema Overview

This schema supports [better-auth](https://www.better-auth.com/) authentication.

| Model | Purpose |
|-------|---------|
| **User** | Core user profile (name, email, image) |
| **Session** | Active login sessions with tokens |
| **Account** | OAuth/social provider connections |
| **Verification** | Email verification tokens |

```
User ──1:N──> Session (active logins)
  │
  └──1:N──> Account (GitHub, Google, etc.)
```

## Commands

| Command | Description |
|---------|-------------|
| `prisma generate` | Generate Prisma Client |
| `prisma db push` | Push schema changes (dev) |
| `prisma migrate dev` | Create migration (production) |
| `prisma studio` | Open database GUI |
