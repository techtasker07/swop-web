-- Enable RLS on conversations table
ALTER TABLE IF EXISTS public.conversations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view conversations they're part of" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update conversations they're part of" ON public.conversations;

-- Create policies for conversations table
-- Users can view conversations where they are participants
CREATE POLICY "Users can view conversations they're part of"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = ANY(participants));

-- Users can create conversations if they are one of the participants
CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() = ANY(participants));

-- Users can update conversations they're part of
CREATE POLICY "Users can update conversations they're part of"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() = ANY(participants));

-- Enable RLS on messages table
ALTER TABLE IF EXISTS public.messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

-- Create policies for messages table
-- Users can view messages in conversations they're part of
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );

-- Users can only send messages in conversations they're part of
CREATE POLICY "Users can create messages in their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND auth.uid() = ANY(conversations.participants)
    )
  );
