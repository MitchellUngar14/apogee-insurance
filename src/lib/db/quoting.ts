// src/lib/db/quoting.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

const connectionString = process.env.QUOTING_URL;

if (!connectionString) {
  throw new Error("FATAL ERROR: QUOTING_URL environment variable is not set. Please check your .env.local file.");
}

// This file now only knows about the Quoting Service database.
const sql = neon(connectionString);

export const db = drizzle(sql);