import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.BENEFIT_DESIGNER_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error('DATABASE_URL is not set');
}

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
  verbose: true,
  strict: true,
} satisfies Config;
