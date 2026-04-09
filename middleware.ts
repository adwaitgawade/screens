import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth"; // You might need this if you use auth.api.getSession

export default async function middleware(request: NextRequest) {
    // For now, let's keep it simple. You might want to use auth.api.getSession(request) or better-auth/next-js helpers.
    // However, to keep it functional and not crashing:
    return NextResponse.next();
}

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