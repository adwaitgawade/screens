import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get the authenticated user from Supabase
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // Return unlimited access since subscription is removed
        return NextResponse.json({
            credits: 999999,
            plan: 'unlimited',
            hasSubscription: true,
        });

    } catch (error) {
        console.error('Credit status error:', error);
        return NextResponse.json({
            error: 'Failed to get credit status',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
} 