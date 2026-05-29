/**
 * Next.js API Route: /api/revenuecat
 *
 * Alternative webhook endpoint for RevenueCat (web dashboard).
 * Forwards to Supabase Edge Function or processes directly.
 *
 * This enables subscription management from the web admin portal.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret
    const authHeader = req.headers.get('authorization');
    const expectedSecret = process.env.RC_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // Forward to Supabase Edge Function
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Not configured' }, { status: 500 });
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/revenuecat-webhook`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${expectedSecret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
