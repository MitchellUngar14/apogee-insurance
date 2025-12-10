# Apogee Insurance Platform

A Next.js 16 monorepo insurance platform with three deployed services for quoting, customer service, and benefit design. Uses Drizzle ORM with Neon PostgreSQL and is deployed on Vercel.

## Live Deployments

| Service | URL |
|---------|-----|
| Quoting Service | https://apogee-insurance-quoting.vercel.app |
| Customer Service | https://apogee-insurance-customer-service.vercel.app |
| Benefit Designer | https://apogee-insurance-benefit-designer.vercel.app |

**GitHub:** https://github.com/MitchellUngar14/apogee-insurance

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Project Structure](#project-structure)
3.  [Vercel Deployment](#vercel-deployment)
4.  [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
5.  [API Endpoints](#api-endpoints)

## 1. Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying \`src/app/page.tsx\`. The page auto-updates as you edit the file.

This project uses [\`next/font\`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 2. Project Structure

This is a monorepo with multiple packages:

-   \`packages/quoting-service/\`: Quoting service application
-   \`packages/customer-service/\`: Customer service application  
-   \`packages/benefit-designer/\`: Benefit designer application
-   \`packages/shared/\`: Shared utilities and types

Each package contains:
-   \`src/app/\`: Next.js App Router for pages and API routes.
-   \`src/components/\`: Reusable React components.
-   \`src/lib/\`: Utility functions, database connections, and business logic.
-   \`public/\`: Static assets.

## 3. Vercel Deployment

This project is configured for deployment on [Vercel](https://vercel.com) as three separate projects, each pointing to a different package root directory.

## 4. Database Setup (Neon PostgreSQL)

This project uses [Neon PostgreSQL](https://neon.tech) with Drizzle ORM.

Environment variables required in \`.env.local\`:
- \`DATABASE_URL\` - Main database connection string
- \`QUOTING_URL\` - Quoting service database connection string

Database commands:
\`\`\`bash
npm run db:generate   # Generate migrations from schema changes
npm run db:push       # Push schema directly to database
\`\`\`

## 5. API Endpoints

The backend API is implemented using Next.js API Routes within each package's \`src/app/api/\`.

- \`/api/quotes\` - Quote management
- \`/api/applicants\` - Applicant management
- \`/api/coverages\` - Coverage management
- \`/api/groups\` - Group management
- \`/api/hello\` - Health check
