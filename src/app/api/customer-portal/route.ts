import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import polar from '@/lib/actions/get-polar';

export async function GET(request: NextRequest) {
    try {
        const { data: session } = await auth.getSession();
        if (!session?.user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        const user = session.user;

        let customer;
        try {
            customer = await polar.customers.getExternal({ externalId: user.id });
        } catch {
            // Customer doesn't exist, create one
            customer = await polar.customers.create({
                email: user.email!,
                externalId: user.id,
                name: user.name || user.email?.split('@')[0] || 'User',
            });
        }

        const portalSession = await polar.customerSessions.create({
            customerId: customer.id,
        });

        return NextResponse.redirect(portalSession.customerPortalUrl);

    } catch (error) {
        console.error('Customer portal creation failed:', error);
        return NextResponse.json({ error: 'Failed to create customer portal' }, { status: 500 });
    }
}

export const POST = GET;