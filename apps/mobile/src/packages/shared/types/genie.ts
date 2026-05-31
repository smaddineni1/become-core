/**
 * Genie AI Coach types
 */
export type GenieMessageRole = 'user' | 'assistant';

export interface ActionButton {
  label: string;
  route: string;
  icon?: string;
}

export interface GenieMessage {
  id: string;
  conversationId: string;
  role: GenieMessageRole;
  content: string;
  actionButtons: ActionButton[];
  createdAt: string;
}

export interface GenieConversation {
  id: string;
  userId: string;
  startedAt: string;
  lastMessageAt: string;
}

export interface GenieResponse {
  text: string;
  action_buttons: ActionButton[];
}

export interface GenieSendMessageInput {
  conversationId?: string; // omit to start new conversation
  message: string;
}

/**
 * Intent categories Genie must recognize and route
 */
export type GenieIntent =
  | 'rest_recovery'
  | 'form_check'
  | 'meditation_yoga'
  | 'nutrition'
  | 'hrv_stress'
  | 'general';

/**
 * JSON Schema for GPT-4o Structured Outputs
 */
export const GENIE_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    text: { type: 'string' },
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
} as const;
