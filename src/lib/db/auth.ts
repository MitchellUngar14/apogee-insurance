// src/lib/db/auth.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as authSchema from "../schema/auth";

const sql = neon(process.env.USERS_URL!);
export const db = drizzle({ client: sql, schema: authSchema });
