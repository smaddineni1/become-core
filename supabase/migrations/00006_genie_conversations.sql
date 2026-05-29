-- =============================================================================
-- GENIE CONVERSATIONS & MESSAGES
-- =============================================================================
CREATE TABLE public.genie_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_genie_conversations_user_id ON public.genie_conversations(user_id);

CREATE TABLE public.genie_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.genie_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  action_buttons JSONB NOT NULL DEFAULT '[]',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_genie_messages_conversation ON public.genie_messages(conversation_id, created_at);

-- HNSW index for fast vector similarity search (RAG)
CREATE INDEX idx_genie_messages_embedding ON public.genie_messages
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- RLS
ALTER TABLE public.genie_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genie_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON public.genie_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.genie_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.genie_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own messages"
  ON public.genie_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.genie_conversations gc
      WHERE gc.id = genie_messages.conversation_id AND gc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON public.genie_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.genie_conversations gc
      WHERE gc.id = genie_messages.conversation_id AND gc.user_id = auth.uid()
    )
  );
