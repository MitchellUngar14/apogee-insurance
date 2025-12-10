// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/schema/auth.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.USERS_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
