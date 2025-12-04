# Apogee Insurance Quoting Platform

This is a Next.js application for an insurance quoting platform, designed to be deployed on Vercel. It supports both individual and group quoting processes and includes a backend API for data handling and integration with a PostgreSQL database (Vercel Postgres).

## Table of Contents

1.  [Getting Started](#getting-started)
2.  [Project Structure](#project-structure)
3.  [Vercel Deployment](#vercel-deployment)
4.  [Database Setup (Vercel Postgres)](#database-setup-vercel-postgres)
5.  [API Endpoints](#api-endpoints)

## 1. Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 2. Project Structure

-   `src/app/`: Contains the Next.js App Router for pages and API routes.
    -   `api/`: Backend API routes.
    -   `page.tsx`: The main page of the application.
    -   `layout.tsx`: The root layout of the application.
-   `src/components/`: Reusable React components.
-   `src/lib/`: Utility functions, database connections, and business logic.
    -   `db.ts`: Placeholder for Vercel Postgres database connection.
-   `public/`: Static assets.

## 3. Vercel Deployment

This project is configured for seamless deployment on [Vercel](https://vercel.com).
After pushing your changes to a Git repository, you can import your project into Vercel and deploy it.

## 4. Database Setup (Vercel Postgres)

This project is designed to use [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) as its database.

To set up your Vercel Postgres database:

1.  **Create a new Vercel Project:** If you haven't already, create a new project on Vercel.
2.  **Add a Postgres Database:** In your Vercel project dashboard, navigate to the "Storage" tab and add a new Postgres database.
3.  **Connect to your Project:** Follow the instructions to connect your new Postgres database to your project. This will automatically set up the necessary environment variables in your Vercel project.
4.  **Local Environment Variables:** For local development, you will need to copy the environment variables provided by Vercel Postgres (e.g., `POSTGRES_URL`, `POSTGRES_PRISMA_URL`) into a `.env.local` file at the root of this project.

## 5. API Endpoints

The backend API is implemented using Next.js API Routes within `src/app/api/`.

-   A placeholder endpoint `src/app/api/hello/route.ts` is provided as an example.

---
Created by Gemini.