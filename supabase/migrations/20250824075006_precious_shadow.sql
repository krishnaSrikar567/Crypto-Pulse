/*
  # Enable Row Level Security for Alerts

  1. Security
    - Enable RLS on `alerts` table
    - Add policies for authenticated users to manage their own alerts
    - Users can only see and modify their own alerts

  2. Policies
    - Users can insert their own alerts
    - Users can select their own alerts
    - Users can update their own alerts
    - Users can delete their own alerts
*/

/*-- Enable RLS on alerts table
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Policy for inserting alerts (users can only insert alerts for themselves)
CREATE POLICY "Users can insert own alerts"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy for selecting alerts (users can only see their own alerts)
CREATE POLICY "Users can view own alerts"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id::text);

-- Policy for updating alerts (users can only update their own alerts)
CREATE POLICY "Users can update own alerts"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy for deleting alerts (users can only delete their own alerts)
CREATE POLICY "Users can delete own alerts"
  ON alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id::text);*/
  -- Enable Row Level Security (RLS)
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own alerts
CREATE POLICY "Users can insert own alerts"
  ON public.alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can select their own alerts
CREATE POLICY "Users can view own alerts"
  ON public.alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can update their own alerts
CREATE POLICY "Users can update own alerts"
  ON public.alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can delete their own alerts
CREATE POLICY "Users can delete own alerts"
  ON public.alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);