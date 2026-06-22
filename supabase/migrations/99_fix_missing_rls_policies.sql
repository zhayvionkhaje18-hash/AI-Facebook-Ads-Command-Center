-- ============================================================================
-- FIX MISSING RLS POLICIES FOR CAMPAIGNS, AD SETS, ADS, SYNC LOGS
-- ============================================================================
-- This migration adds INSERT and UPDATE policies that were missing
-- ============================================================================

-- ============================================================================
-- META CAMPAIGNS POLICIES
-- ============================================================================

-- INSERT policy for campaigns (allows API to insert)
DROP POLICY IF EXISTS "insert_campaigns_as_member" ON public.meta_campaigns;
CREATE POLICY "insert_campaigns_as_member" ON public.meta_campaigns FOR INSERT
  TO authenticated WITH CHECK (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE policy for campaigns
DROP POLICY IF EXISTS "update_campaigns_as_member" ON public.meta_campaigns;
CREATE POLICY "update_campaigns_as_member" ON public.meta_campaigns FOR UPDATE
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- META AD SETS POLICIES
-- ============================================================================

-- INSERT policy for ad sets
DROP POLICY IF EXISTS "insert_adsets_as_member" ON public.meta_ad_sets;
CREATE POLICY "insert_adsets_as_member" ON public.meta_ad_sets FOR INSERT
  TO authenticated WITH CHECK (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE policy for ad sets
DROP POLICY IF EXISTS "update_adsets_as_member" ON public.meta_ad_sets;
CREATE POLICY "update_adsets_as_member" ON public.meta_ad_sets FOR UPDATE
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- META ADS POLICIES
-- ============================================================================

-- INSERT policy for ads
DROP POLICY IF EXISTS "insert_ads_as_member" ON public.meta_ads;
CREATE POLICY "insert_ads_as_member" ON public.meta_ads FOR INSERT
  TO authenticated WITH CHECK (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE policy for ads
DROP POLICY IF EXISTS "update_ads_as_member" ON public.meta_ads;
CREATE POLICY "update_ads_as_member" ON public.meta_ads FOR UPDATE
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- META SYNC LOGS POLICIES
-- ============================================================================

-- SELECT policy for sync logs
DROP POLICY IF EXISTS "select_sync_logs_as_member" ON public.meta_sync_logs;
CREATE POLICY "select_sync_logs_as_member" ON public.meta_sync_logs FOR SELECT
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT policy for sync logs (API needs to create logs)
DROP POLICY IF EXISTS "insert_sync_logs_as_member" ON public.meta_sync_logs;
CREATE POLICY "insert_sync_logs_as_member" ON public.meta_sync_logs FOR INSERT
  TO authenticated WITH CHECK (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE policy for sync logs (API needs to update status)
DROP POLICY IF EXISTS "update_sync_logs_as_member" ON public.meta_sync_logs;
CREATE POLICY "update_sync_logs_as_member" ON public.meta_sync_logs FOR UPDATE
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- META SYNC STATE POLICIES
-- ============================================================================

-- SELECT policy for sync state
DROP POLICY IF EXISTS "select_sync_state_as_member" ON public.meta_sync_state;
CREATE POLICY "select_sync_state_as_member" ON public.meta_sync_state FOR SELECT
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- INSERT policy for sync state
DROP POLICY IF EXISTS "insert_sync_state_as_member" ON public.meta_sync_state;
CREATE POLICY "insert_sync_state_as_member" ON public.meta_sync_state FOR INSERT
  TO authenticated WITH CHECK (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- UPDATE policy for sync state
DROP POLICY IF EXISTS "update_sync_state_as_member" ON public.meta_sync_state;
CREATE POLICY "update_sync_state_as_member" ON public.meta_sync_state FOR UPDATE
  TO authenticated USING (
    meta_connection_id IN (
      SELECT id FROM public.meta_connections 
      WHERE workspace_id IN (
        SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- After running this migration, verify with:
-- SELECT tablename, policyname, cmd FROM pg_policies 
-- WHERE tablename IN ('meta_campaigns', 'meta_ad_sets', 'meta_ads', 'meta_sync_logs')
-- ORDER BY tablename, cmd;
