/**
 * Edge Function: onboarding-scan
 *
 * Manages the Digital Twin biometric scan process.
 * Uses the BiometricScanProvider adapter pattern.
 *
 * Endpoints:
 * POST /init — Start a new scan
 * GET /status/:scanId — Poll scan status
 * GET /results/:scanId — Retrieve completed results
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';

serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    if (req.method === 'POST' && path === 'init') {
      // TODO Phase 2.6: Initialize scan with provider
      const { userId, heightCm, weightKg, sex } = await req.json();
      const scanId = `sim_${userId}_${Date.now()}`;

      return new Response(
        JSON.stringify({ scanId, status: 'processing' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (req.method === 'GET') {
      // Status + results polling
      return new Response(
        JSON.stringify({ status: 'complete', provider: 'simulation' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
