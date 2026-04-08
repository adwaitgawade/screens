import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserSubscriptionStatus } from '@/lib/actions/polar-subscription';

export async function GET(request: NextRequest) {
    try {
        const { data: session } = await auth.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Get subscription status from Polar
        const subscriptionStatus = await getUserSubscriptionStatus(session.user.id);

        return NextResponse.json({
            credits: subscriptionStatus.credits,
            plan: subscriptionStatus.plan,
            hasSubscription: subscriptionStatus.hasSubscription,
        });

    } catch (error) {
        console.error('Credit status error:', error);
        return NextResponse.json({
            error: 'Failed to get credit status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}