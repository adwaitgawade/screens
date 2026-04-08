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

        // Get product ID from query parameters
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('product_id');

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        // Create or get customer
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

        // Create checkout session
        const checkout = await polar.checkouts.create({
            products: [productId],
            successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}?checkout_success=true`,
            customerId: customer.id,
        });

        return NextResponse.redirect(checkout.url);

    } catch (error) {
        console.error('Checkout creation failed:', error);
        return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }
}

export const POST = GET;