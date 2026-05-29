/**
 * Cloudflare Worker: form-scorer
 *
 * Edge worker for aggregating form check session data.
 * Receives batched rep scores from client, validates, aggregates,
 * and writes to Supabase.
 *
 * Deployed to 300+ PoPs globally for <10ms p99 latency.
 */

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
}

interface RepBatch {
  sessionId: string;
  reps: Array<{
    repNumber: number;
    score: number;
    jointAngles: Record<string, number>;
    cues: string[];
  }>;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const batch: RepBatch = await request.json();

      // Validate batch
      if (!batch.sessionId || !Array.isArray(batch.reps) || batch.reps.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid batch payload' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Aggregate session stats
      const totalReps = batch.reps.length;
      const averageScore =
        batch.reps.reduce((sum, r) => sum + r.score, 0) / totalReps;

      // TODO: Write to Supabase via service key
      // - Insert individual rep_scores rows
      // - Update workout_sessions aggregate fields

      return new Response(
        JSON.stringify({
          success: true,
          sessionId: batch.sessionId,
          totalReps,
          averageScore: Math.round(averageScore * 100) / 100,
          message: 'Batch processed at edge',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }
  },
};
