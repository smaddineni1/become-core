import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are Genie — the Become wellness coach. Warm, knowledgeable, encouraging, concise.

RESPONSE FORMAT (JSON):
{"text": "Your response (2-4 sentences)", "action_buttons": [{"label": "Button", "route": "/route", "icon": "icon"}]}

INTENT ROUTING:
- Tired/rest/sore → route: "/(tabs)/mind-body"
- Exercise/squat/pushup → route: "/(tabs)/form-check"
- Meditate/yoga/calm → route: "/(tabs)/mind-body"
- Food/eat/hungry → route: "/(tabs)/nutrition"
- Stress/HRV → route: "/(tabs)/mind-body"

ICONS: "dumbbell", "meditation", "salad", "heart", "lightning", "moon"
MAX 3 action buttons. Be concise and helpful.

NUTRITION RULE: Never recommend protein bars, powders, shakes, or supplements. Only whole foods.`;

serve(async (req: Request) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401, corsHeaders);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Invalid token' }, 401, corsHeaders);

    const { message } = await req.json();
    if (!message) return json({ error: 'Message required' }, 400, corsHeaders);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) return json({ error: 'AI service not configured' }, 500, corsHeaders);

    const aiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return json({ error: 'AI service error', details: errText }, 502, corsHeaders);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;

    let response;
    try { response = JSON.parse(content); }
    catch { response = { text: content || "I'm here to help! What can I do for you?", action_buttons: [] }; }

    return json({ response }, 200, corsHeaders);
  } catch (error) {
    return json({ error: 'Internal error', details: String(error) }, 500, corsHeaders);
  }
});

function json(data: any, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
