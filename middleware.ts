import { auth } from '@/lib/auth';

export default auth.middleware({
    loginUrl: '/auth/sign-in',
});

export const config = {
    matcher: [
        // Protected routes requiring authentication
        '/project/:path*',
        '/settings/:path*',
        '/api/checkout',
        '/api/customer-portal',
        '/api/user/:path*',
    ],
};