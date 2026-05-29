/**
 * Edge Function: genie-message
 *
 * Genie AI Coach — streaming GPT-4o with structured action buttons.
 *
 * Pipeline:
 * 1. Authenticate user via JWT
 * 2. Get or create conversation
 * 3. Fetch user context (profile, HRV, recent sessions)
 * 4. Build system prompt + user context
 * 5. Call GPT-4o with Structured Outputs (JSON Schema)
 * 6. Store user message + assistant response
 * 7. Return structured response with action_buttons[]
 *
 * Future (P1): Add RAG via pgvector embedding + similarity search
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { verifyPremiumAccess, premiumRequiredResponse } from '../_shared/premium-gate.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Genie System Prompt — personality + routing + guardrails
const GENIE_SYSTEM_PROMPT = `
You are Genie — the Become wellness coach. You are warm, knowledgeable, encouraging, and concise.
You help users navigate their fitness, nutrition, and mindfulness journey.

YOUR CORE BEHAVIORS:
1. UNDERSTAND intent from natural language
2. RESPOND with helpful, personalized guidance (2-4 sentences max)
3. ALWAYS include action_buttons that route to the relevant app section
4. NEVER give medical advice — recommend consulting a professional for health concerns
5. Be encouraging but honest — celebrate progress, gently correct form misconceptions

RESPONSE FORMAT (JSON — Structured Outputs):
{
  "text": "Your conversational response here (2-4 sentences, warm and concise)",
  "action_buttons": [
    { "label": "Button Text", "route": "/app/route", "icon": "icon_name" }
  ]
}

INTENT ROUTING TABLE:
- Fatigue/rest/exhaustion/sore → route: "/(tabs)/mind-body?tab=meditation"
- Exercise form/how to do X → route: "/(tabs)/form-check/[exercise_id]"
- Meditation/yoga/calm/relax → route: "/(tabs)/mind-body?tab=meditation"
- Nutrition/food/eat/hungry → route: "/(tabs)/nutrition"
- Stress/HRV/anxiety → route: "/(tabs)/mind-body/hrv"
- General workout/exercise → route: "/(tabs)/form-check"

EXERCISE IDs: air_squat, push_up, sit_up, kettlebell_swing

ICON OPTIONS: "dumbbell", "meditation", "salad", "heart", "lightning", "moon"

MAX ACTION BUTTONS: 3 per response.

NUTRITION GUARDRAILS (NEVER VIOLATE):
If asked about protein supplements, bars, shakes, or powders — ALWAYS redirect to whole-food
alternatives. Never recommend Quest bars, protein shakes, Huel, or any commercial product.
Recommend: eggs, Greek yogurt, cottage cheese, chicken, fish, legumes, tofu, nuts, seeds.

CONVERSATION STYLE:
- First-person, friendly, like a trusted coach
- Use the user's name when available
- Short sentences, active voice
- If unsure of intent, ask a clarifying question WITH a general action button
`.trim();

// JSON Schema for Structured Outputs
const GENIE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'Conversational response text' },
    action_buttons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          route: { type: 'string' },
          icon: { type: 'string' },
        },
        required: ['label', 'route'],
        additionalProperties: false,
      },
      maxItems: 3,
    },
  },
  required: ['text', 'action_buttons'],
  additionalProperties: false,
};

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Auth + Premium gate
    const authHeader = req.headers.get('Authorization');
    const gateResult = await verifyPremiumAccess(authHeader, 'genie_message');

    if (!gateResult.allowed) {
      if (!gateResult.userId) {
        return jsonResponse({ error: 'Unauthorized' }, 401, corsHeaders);
      }
      return premiumRequiredResponse(
        gateResult.reason ?? 'Daily Genie message limit reached. Upgrade to Premium for unlimited coaching.',
        corsHeaders,
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader! } } },
    );

    const user = { id: gateResult.userId! };

    const { message, conversationId } = await req.json();
    if (!message || typeof message !== 'string') {
      return jsonResponse({ error: 'Message is required' }, 400, corsHeaders);
    }

    // 2. Get or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const { data: newConvo, error: convoError } = await supabase
        .from('genie_conversations')
        .insert({ user_id: user.id })
        .select('id')
        .single();

      if (convoError || !newConvo) {
        return jsonResponse({ error: 'Failed to create conversation' }, 500, corsHeaders);
      }
      activeConversationId = newConvo.id;
    }

    // 3. Store user message
    await supabase.from('genie_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
      action_buttons: [],
    });

    // 4. Fetch user context
    const userContext = await buildUserContext(supabase, user.id);

    // 5. Fetch conversation history (last 10 messages)
    const { data: history } = await supabase
      .from('genie_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    // 6. Build messages for GPT-4o
    const messages: Array<{ role: string; content: string }> = [
      { role: 'system', content: GENIE_SYSTEM_PROMPT },
      { role: 'system', content: userContext },
    ];

    // Add conversation history
    if (history && history.length > 0) {
      for (const msg of history.slice(-8)) { // Keep last 8 for context window
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Current message (if not already in history)
    if (!history?.length || history[history.length - 1]?.content !== message) {
      messages.push({ role: 'user', content: message });
    }

    // 7. Call GPT-4o
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return jsonResponse({ error: 'AI service not configured' }, 500, corsHeaders);
    }

    const aiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'genie_response',
            strict: true,
            schema: GENIE_RESPONSE_SCHEMA,
          },
        },
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return jsonResponse({ error: 'AI service error', details: errText }, 502, corsHeaders);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content;

    let genieResponse: { text: string; action_buttons: any[] };
    try {
      genieResponse = JSON.parse(rawContent);
    } catch {
      // Fallback if JSON parsing fails
      genieResponse = {
        text: rawContent ?? "I'm here to help! What would you like to work on today?",
        action_buttons: [
          { label: 'Start a Workout', route: '/(tabs)/form-check', icon: 'dumbbell' },
        ],
      };
    }

    // 8. Store assistant response
    await supabase.from('genie_messages').insert({
      conversation_id: activeConversationId,
      role: 'assistant',
      content: genieResponse.text,
      action_buttons: genieResponse.action_buttons,
    });

    // Update conversation timestamp
    await supabase
      .from('genie_conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', activeConversationId);

    // 9. Return response
    return jsonResponse(
      {
        conversationId: activeConversationId,
        response: genieResponse,
      },
      200,
      corsHeaders,
    );
  } catch (error) {
    return jsonResponse(
      { error: 'Internal server error', details: String(error) },
      500,
      corsHeaders,
    );
  }
});

// ----- Context Building -----

async function buildUserContext(supabase: any, userId: string): Promise<string> {
  const parts: string[] = ['USER CONTEXT:'];

  // Profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, fitness_goal, activity_level')
    .eq('id', userId)
    .single();

  if (profile) {
    parts.push(`- Name: ${profile.display_name}`);
    parts.push(`- Goal: ${(profile.fitness_goal ?? '').replace('_', ' ')}`);
    parts.push(`- Activity: ${(profile.activity_level ?? '').replace('_', ' ')}`);
  }

  // Latest HRV
  const { data: hrv } = await supabase
    .from('hrv_readings')
    .select('classification, rmssd_ms, recorded_at')
    .eq('user_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (hrv) {
    parts.push(`- Current HRV State: ${hrv.classification} (${hrv.rmssd_ms}ms RMSSD)`);
  }

  // Last workout
  const { data: lastWorkout } = await supabase
    .from('workout_sessions')
    .select('exercise, average_score, started_at')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (lastWorkout) {
    parts.push(`- Last Workout: ${lastWorkout.exercise} (score: ${lastWorkout.average_score})`);
  }

  // Today's meal plan status
  const today = new Date().toISOString().split('T')[0];
  const { data: mealPlan } = await supabase
    .from('nutrition_plans')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_date', today)
    .single();

  parts.push(`- Today's Meal Plan: ${mealPlan ? 'Generated' : 'Not yet generated'}`);

  return parts.join('\n');
}

function jsonResponse(data: any, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}
