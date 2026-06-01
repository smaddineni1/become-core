import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a whole-food nutrition expert. Generate a daily meal plan as JSON.

STRICT RULES:
- NEVER recommend protein bars, powders, shakes, supplements, or branded products
- Only whole, minimally processed foods from a grocery store
- Generate exactly 3 meals + 1 snack

OUTPUT FORMAT:
{"meals":[{"name":"Name","type":"breakfast|lunch|dinner|snack","ingredients":[{"name":"ingredient","quantity":"200","unit":"g"}],"proteinG":30,"carbsG":45,"fatG":12,"calories":410,"prepTimeMinutes":15,"method":"2-3 sentence method"}]}`;

serve(async (req: Request) => {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Unauthorized' }, 401, corsHeaders);

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: 'Invalid token' }, 401, corsHeaders);

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (!profile) return json({ error: 'Profile not found' }, 404, corsHeaders);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) return json({ error: 'AI service not configured' }, 500, corsHeaders);

    const age = profile.age ?? 30;
    const weight = profile.weight_kg ?? 70;
    const height = profile.height_cm ?? 170;
    const sex = profile.sex ?? 'other';
    const goal = profile.fitness_goal ?? 'improve_mobility';
    const activity = profile.activity_level ?? 'moderately_active';

    const userPrompt = `Generate a meal plan for: Age ${age}, Sex ${sex}, Height ${height}cm, Weight ${weight}kg, Goal: ${goal.replace('_',' ')}, Activity: ${activity.replace('_',' ')}. Target ~2000 calories.`;

    const aiRes = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return json({ error: 'AI service error', details: errText }, 502, corsHeaders);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content;
    if (!content) return json({ error: 'Empty AI response' }, 500, corsHeaders);

    let parsed;
    try { parsed = JSON.parse(content); }
    catch { return json({ error: 'Invalid AI response format' }, 500, corsHeaders); }

    if (!parsed.meals || !Array.isArray(parsed.meals)) {
      return json({ error: 'AI did not return meals array' }, 500, corsHeaders);
    }

    const totals = parsed.meals.reduce((acc: any, m: any) => ({
      calories: acc.calories + (m.calories || 0),
      proteinG: acc.proteinG + (m.proteinG || 0),
      carbsG: acc.carbsG + (m.carbsG || 0),
      fatG: acc.fatG + (m.fatG || 0),
    }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });

    const today = new Date().toISOString().split('T')[0];
    const { data: savedPlan, error: saveError } = await supabase.from('nutrition_plans').upsert({
      user_id: user.id, plan_date: today, meals: parsed.meals,
      total_calories: totals.calories, total_protein_g: totals.proteinG,
      total_carbs_g: totals.carbsG, total_fat_g: totals.fatG,
      generated_at: new Date().toISOString(), regeneration_count: 0,
    }, { onConflict: 'user_id,plan_date' }).select().single();

    if (saveError) return json({ error: 'Failed to save', details: saveError.message }, 500, corsHeaders);

    return json({ success: true, plan: savedPlan }, 200, corsHeaders);
  } catch (error) {
    return json({ error: 'Internal error', details: String(error) }, 500, corsHeaders);
  }
});

function json(data: any, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), { status, headers: { ...headers, 'Content-Type': 'application/json' } });
}
