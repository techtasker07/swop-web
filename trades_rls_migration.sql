-- Enable RLS on trades table if not already enabled
ALTER TABLE IF EXISTS public.trades ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can create trades" ON public.trades;
DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;

-- Create policies for trades table
-- Users can view trades where they are either proposer or receiver
CREATE POLICY "Users can view their own trades"
  ON public.trades
  FOR SELECT
  USING (
    auth.uid() = proposer_id OR auth.uid() = receiver_id
  );

-- Users can create trades (proposer_id will be set to auth.uid())
CREATE POLICY "Users can create trades"
  ON public.trades
  FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

-- Users can update trades if they are proposer or receiver
CREATE POLICY "Users can update their own trades"
  ON public.trades
  FOR UPDATE
  USING (
    auth.uid() = proposer_id OR auth.uid() = receiver_id
  );
