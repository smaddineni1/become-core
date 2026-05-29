/**
 * Genie API — Client-side functions for the AI coach
 */
import type { GenieResponse, GenieMessage } from '@become/shared';
import { supabase } from '../supabase';

const FUNCTIONS_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';

/**
 * Send a message to Genie and receive a structured response
 */
export async function sendGenieMessage(
  message: string,
  conversationId?: string,
): Promise<{
  success: boolean;
  conversationId?: string;
  response?: GenieResponse;
  error?: string;
}> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'Not authenticated' };

  const response = await fetch(`${FUNCTIONS_URL}/functions/v1/genie-message`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, conversationId }),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.error ?? 'Genie unavailable' };
  }

  return {
    success: true,
    conversationId: data.conversationId,
    response: data.response,
  };
}

/**
 * Fetch conversation history for the current session
 */
export async function getConversationHistory(
  conversationId: string,
): Promise<GenieMessage[]> {
  const { data, error } = await supabase
    .from('genie_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((msg: any) => ({
    id: msg.id,
    conversationId: msg.conversation_id,
    role: msg.role,
    content: msg.content,
    actionButtons: msg.action_buttons ?? [],
    createdAt: msg.created_at,
  }));
}

/**
 * Get the most recent conversation for the user
 */
export async function getLatestConversation(): Promise<string | null> {
  const { data, error } = await supabase
    .from('genie_conversations')
    .select('id')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data.id;
}
