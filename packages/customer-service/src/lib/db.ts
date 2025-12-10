import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as dotenv from 'dotenv';

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.CUSTOMER_SERVICE_URL!);
export const db = drizzle({ client: sql });

export async function getHealthCheck() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('Database health check successful:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { success: false, error: (error as Error).message };
  }
}
