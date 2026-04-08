import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env' });

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
    // Only manage our custom tables — exclude Neon Auth (Better Auth) managed tables
    tablesFilter: [
        'projects',
        'screens',
        'html_contents',
        'screen_versions',
        'subscriptions',
        'polar_config',
    ],
});
