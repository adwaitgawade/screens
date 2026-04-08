import { Webhooks } from '@polar-sh/nextjs';
import { db } from '@/db/drizzle';
import { subscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

    // Catch-all handler for all webhook events
    onPayload: async (payload) => {

        console.log(payload);

        try {
            // Handle subscription events
            if (payload.type.startsWith('subscription.')) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = payload.data as any;

                if (payload.type === 'subscription.created' || payload.type === 'subscription.updated') {
                    const userId = data.customer?.externalId || data.customer?.external_id;
                    const polarSubId = data.id;
                    console.log(userId);
                    console.log(polarSubId);

                    if (userId && polarSubId) {
                        // Upsert subscription using Drizzle
                        await db
                            .insert(subscriptions)
                            .values({
                                userId,
                                planName: data.product?.name || 'unknown',
                                polarSubscriptionId: polarSubId,
                                polarCustomerId: data.customer?.id,
                                status: data.status,
                                currentPeriodStart: data.currentPeriodStart || data.current_period_start,
                                currentPeriodEnd: data.currentPeriodEnd || data.current_period_end,
                            })
                            .onConflictDoUpdate({
                                target: subscriptions.polarSubscriptionId,
                                set: {
                                    status: data.status,
                                    currentPeriodStart: data.currentPeriodStart || data.current_period_start,
                                    currentPeriodEnd: data.currentPeriodEnd || data.current_period_end,
                                    updatedAt: new Date().toISOString(),
                                },
                            });
                    }
                }

                if (payload.type === 'subscription.canceled' || payload.type === 'subscription.revoked') {
                    const newStatus = payload.type === 'subscription.canceled' ? 'canceled' : 'revoked';
                    await db
                        .update(subscriptions)
                        .set({
                            status: newStatus,
                            updatedAt: new Date().toISOString(),
                        })
                        .where(eq(subscriptions.polarSubscriptionId, data.id));
                }
            }

            // Handle customer state changes (for credit updates)
            if (payload.type === 'customer.updated' || payload.type === 'customer.state_changed') {
                // Polar automatically manages credits, so we just acknowledge this
            }

            // Handle benefit grants (when credits are given)
            if (payload.type.startsWith('benefit_grant.')) {
                // Credits are automatically managed by Polar
            }

            // Handle orders (one-time purchases)
            if (payload.type.startsWith('order.')) {
                // Handle order-related events if needed
            }

        } catch (error) {
            console.error('Webhook processing failed:', error);
            // Don't throw - return 200 to acknowledge receipt
        }
    },
});