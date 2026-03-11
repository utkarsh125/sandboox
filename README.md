# Sandboox

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)

> **Break your APK before your attackers do. Expose Android app vulnerabilities in minutes.**

Sandboox is a comprehensive platform designed to analyze and expose vulnerabilities in Android applications (APKs) and web applications. It provides developers and security researchers with an automated toolkit to identify security flaws before they can be exploited.

## Architecture & Project Structure

This project is structured as a monorepo using **pnpm workspaces** and **Turborepo**.

### Apps
- **`apps/frontend`**: A Next.js 14 web application providing the user interface, dashboard, and marketing pages. Styled with TailwindCSS and uses React components.
- **`apps/http`**: The core Backend API built with Node.js and Hono. It handles incoming requests, manages user projects, and queues analysis jobs.
- **`apps/worker`**: A Node.js background worker utilizing BullMQ and Redis. It picks up queued APKs, runs static and dynamic analysis (e.g., using Semgrep), and reports back the findings.

### Packages
- **`packages/db`**: Database ORM layer using Prisma to interact with the PostgreSQL database.
- **`packages/auth`**: Authentication layer using Better-Auth, configured for GitHub OAuth integration.
- **`packages/shared-types`**: TypeScript types and interfaces shared across the frontend, backend, and worker.

---

## How It Works (The Flow)

1. **Authentication**: Users log in to the Sandboox dashboard via GitHub OAuth.
2. **Project Creation & Upload**: Users create a new project and upload their Android APK (or specify a website) via the frontend. Files are securely handled by UploadThing.
3. **API Processing**: The Next.js frontend communicates with the Hono API (`apps/http`). The API creates a database record for the project and enqueues a new analysis job onto a Redis queue.
4. **Analysis Execution**: The background Worker (`apps/worker`) continuously listens to the Redis queue. Upon spotting a new job, it fetches the APK, decompiles/processes it, and runs security analysis tools (like Semgrep rules).
5. **Results Delivery**: The worker updates the database with the vulnerabilities found. The frontend polls or receives real-time updates and presents the security report to the user on the dashboard.

---

## Installation & Local Development Guide

Follow these steps to set up Sandboox on your local machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (v9.x)
- [Redis](https://redis.io/) (Running locally or via Docker on port 6379, required for BullMQ)
- **PostgreSQL** (Running locally or via Docker)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd sandboox
```

### 2. Install Dependencies
Run pnpm install from the root directory to install all workspace dependencies.
```bash
pnpm install
```

### 3. Environment Variables
You need to set up environment variables for the frontend, backend, worker, database, and auth packages. `.env.example` files are provided in each respective directory.

Copy them to create your `.env` files:
```bash
cp apps/frontend/.env.example apps/frontend/.env
cp apps/http/.env.example apps/http/.env
cp apps/worker/.env.example apps/worker/.env
cp packages/db/.env.example packages/db/.env
cp packages/auth/.env.example packages/auth/.env
```

**Key configurations you will need to fill in:**
- `DATABASE_URL`: Your PostgreSQL connection string.
- `REDIS_URL`: Your Redis connection string (e.g., `redis://127.0.0.1:6379`).
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`: For OAuth login via Better-Auth.
- `UPLOADTHING_TOKEN`: For secure file uploads.

### 4. Database Setup
Generate the Prisma client and push the schema to your PostgreSQL database.
```bash
# From the root directory
pnpm db:generate

# Push the schema
cd packages/db
pnpm dlx prisma db push
cd ../../
```

### 5. Start the Development Servers
Use Turborepo to start all applications in parallel.
```bash
pnpm dev
```

This will concurrently launch:
- Next.js Frontend on `http://localhost:3000`
- Hono HTTP API on `http://localhost:3001`
- The Background Worker processing the Redis queue.

---

## Scripts Overview (Root)

- `pnpm dev`: Starts the development servers across all apps.
- `pnpm build`: Builds all apps and packages for production.
- `pnpm lint`: Runs ESLint across the workspace.
- `pnpm format`: Formats code using Prettier.
- `pnpm check-types`: Runs TypeScript type checking.
- `pnpm db:generate`: Generates the Prisma client.
