import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

if (!process.env.CUSTOMER_SERVICE_URL) {
  throw new Error('CUSTOMER_SERVICE_URL is not set');
}

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CUSTOMER_SERVICE_URL,
  },
  verbose: true,
  strict: true,
} satisfies Config;
