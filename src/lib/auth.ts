import { createNeonAuth } from '@neondatabase/auth/next/server';
// to use in react server components, server actions, and API routes
export const auth = createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: {
        secret: process.env.NEON_AUTH_COOKIE_SECRET!,
    },
});