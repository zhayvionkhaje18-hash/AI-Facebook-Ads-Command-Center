import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const connectionId = searchParams.get('connection_id')

  if (!connectionId) {
    return NextResponse.json({ error: 'connection_id is required' }, { status: 400 })
  }

  // Get connection details
  const { data: connection } = await supabase
    .from('meta_connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (!connection) {
    return NextResponse.json({ error: 'Connection not found' }, { status: 404 })
  }

  // Get ad accounts
  const { data: adAccounts, count: adAccountsCount } = await supabase
    .from('meta_ad_accounts')
    .select('*', { count: 'exact' })
    .eq('meta_connection_id', connectionId)

  // Get campaigns
  const { data: campaigns, count: campaignsCount } = await supabase
    .from('meta_campaigns')
    .select('*', { count: 'exact' })
    .eq('meta_connection_id', connectionId)

  // Get ad sets
  const { data: adSets, count: adSetsCount } = await supabase
    .from('meta_ad_sets')
    .select('*', { count: 'exact' })
    .eq('meta_connection_id', connectionId)

  // Get ads
  const { data: ads, count: adsCount } = await supabase
    .from('meta_ads')
    .select('*', { count: 'exact' })
    .eq('meta_connection_id', connectionId)

  // Get sync logs
  const { data: syncLogs } = await supabase
    .from('meta_sync_logs')
    .select('*')
    .eq('meta_connection_id', connectionId)
    .order('created_at', { ascending: false })
    .limit(5)

  return NextResponse.json({
    connection: {
      id: connection.id,
      facebook_user_name: connection.facebook_user_name,
      status: connection.status,
      last_synced_at: connection.last_synced_at,
    },
    counts: {
      ad_accounts: adAccountsCount,
      campaigns: campaignsCount,
      ad_sets: adSetsCount,
      ads: adsCount,
    },
    sample_data: {
      ad_accounts: adAccounts?.slice(0, 3).map(acc => ({
        id: acc.id,
        ad_account_id: acc.ad_account_id,
        name: acc.name,
        account_status: acc.account_status,
      })),
      campaigns: campaigns?.slice(0, 3).map(c => ({
        id: c.id,
        campaign_id: c.campaign_id,
        name: c.name,
        status: c.status,
        ad_account_id: c.ad_account_id,
      })),
      ad_sets: adSets?.slice(0, 3).map(a => ({
        id: a.id,
        adset_id: a.adset_id,
        name: a.name,
        status: a.status,
      })),
      ads: ads?.slice(0, 3).map(a => ({
        id: a.id,
        ad_id: a.ad_id,
        name: a.name,
        status: a.status,
      })),
    },
    recent_sync_logs: syncLogs?.map(log => ({
      id: log.id,
      sync_type: log.sync_type,
      entity_type: log.entity_type,
      status: log.status,
      total_records: log.total_records,
      processed_records: log.processed_records,
      error_message: log.error_message,
      started_at: log.started_at,
      completed_at: log.completed_at,
      duration_seconds: log.duration_seconds,
    })),
  })
}
