-- Securely mark received messages as read for conversations the caller belongs to.
-- Apply this migration to the Supabase database before deploying the updated web app.
CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(conversation_ids_param uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.messages AS message
  SET is_read = TRUE
  FROM public.conversations AS conversation
  WHERE message.conversation_id = conversation.id
    AND conversation.id = ANY(conversation_ids_param)
    AND auth.uid() = ANY(conversation.participants)
    AND message.sender_id <> auth.uid()
    AND message.is_read = FALSE;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_messages_read(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_messages_read(uuid[]) TO authenticated;
