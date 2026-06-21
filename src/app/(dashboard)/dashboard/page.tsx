'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useWorkspace } from '@/providers/WorkspaceProvider'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Megaphone,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Plus,
  ArrowRight,
  RefreshCw,
  ChartBar as BarChart3,
  Loader as Loader2,
  Layers,
  FileText,
  Users,
  Link2,
  Clock
} from 'lucide-react'

type ConnectionStats = {
  campaigns: number
  adsets: number
  ads: number
  connected: boolean
  lastSync?: string
}

type AggregatedMetrics = {
  spend: number
  impressions: number
  clicks: number
  conversions: number
  accounts: number
  campaigns: number
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const { currentWorkspace, workspaces } = useWorkspace()
  const [metrics, setMetrics] = useState<AggregatedMetrics | null>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (currentWorkspace) {
      loadDashboardData()
    }
  }, [currentWorkspace])

  const loadDashboardData = async () => {
    if (!currentWorkspace) return

    setLoading(true)
    setError(null)

    try {
      // Fetch connections with stats
      const response = await fetch(`/api/meta/status?workspace_id=${currentWorkspace.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data')
      }

      setConnections(data || [])

      // Aggregate metrics across all connections
      let totalSpend = 0
      let totalImpressions = 0
      let totalClicks = 0
      let totalConversions = 0
      let totalCampaigns = 0

      for (const conn of data || []) {
        // Get insights for this connection
        try {
          const insightsResponse = await fetch(
            `/api/meta/insights?connection_id=${conn.id}&entity_type=campaign`
          )
          const insightsData = await insightsResponse.json()

          for (const insight of insightsData?.insights || []) {
            totalSpend += insight.spend || 0
            totalImpressions += insight.impressions || 0
            totalClicks += insight.clicks || 0
            totalConversions += insight.conversions || 0
          }

          totalCampaigns += conn.stats?.campaigns || 0
        } catch (e) {
          // Skip this connection's insights if error
        }
      }

      setMetrics({
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalConversions,
        accounts: data?.length || 0,
        campaigns: totalCampaigns
      })
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Early return if no workspace
  if (!currentWorkspace) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center mb-8">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to AdPilot AI</h2>
          <p className="text-slate-400 mb-6">
            Create your first workspace to start managing your Meta Ads campaigns.
          </p>
          <Link
            href="/workspaces/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Create your first workspace
          </Link>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(0)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}
          </h1>
          <p className="text-slate-400 mt-1">
            Here&apos;s an overview of your Meta Ads performance.
          </p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
        </div>
      ) : (
        <>
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Spend"
              value={formatCurrency(metrics?.spend || 0)}
              subtitle={`${metrics?.campaigns || 0} campaigns`}
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              title="Impressions"
              value={formatNumber(metrics?.impressions || 0)}
              subtitle={`${metrics?.accounts || 0} accounts`}
              icon={BarChart3}
              color="green"
            />
            <StatCard
              title="Clicks"
              value={formatNumber(metrics?.clicks || 0)}
              subtitle="Total clicks"
              icon={Megaphone}
              color="yellow"
            />
            <StatCard
              title="Conversions"
              value={formatNumber(metrics?.conversions || 0)}
              subtitle="Total conversions"
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Connections section */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Connected Accounts</h2>
              {connections.length > 0 && (
                <Link
                  href="/ad-accounts"
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  Manage
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {connections.length === 0 ? (
              <div className="text-center py-8">
                <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-4">No Meta accounts connected</p>
                <Link
                  href="/settings/workspace"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Connect Account
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((conn: any) => (
                  <div
                    key={conn.id}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden">
                        {conn.facebook_user_picture_url ? (
                          <img
                            src={conn.facebook_user_picture_url}
                            alt={conn.facebook_user_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium truncate">{conn.facebook_user_name}</p>
                        <p className="text-xs text-slate-500">{conn.ad_accounts?.length || 0} ad accounts</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-white">{conn.stats?.campaigns || 0}</p>
                        <p className="text-xs text-slate-500">Campaigns</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{conn.stats?.adsets || 0}</p>
                        <p className="text-xs text-slate-500">Ad Sets</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{conn.stats?.ads || 0}</p>
                        <p className="text-xs text-slate-500">Ads</p>
                      </div>
                    </div>

                    {conn.last_synced_at && (
                      <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        Last synced: {new Date(conn.last_synced_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <QuickAction
                title="View Analytics"
                description="Deep dive into campaign performance data"
                href="/analytics"
                icon={BarChart3}
              />
              <QuickAction
                title="Manage Campaigns"
                description="View and manage all your campaigns"
                href="/campaigns"
                icon={Megaphone}
              />
              <QuickAction
                title="Sync Data"
                description="Manually sync latest data from Meta"
                href="/ad-accounts"
                icon={RefreshCw}
              />
            </div>
          </div>

          {/* Getting started guide (only if no data) */}
          {connections.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Getting Started</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <GettingStartedStep
                  step={1}
                  title="Connect Meta Account"
                  description="Link your Facebook Business Manager to start syncing your ad data."
                  href="/ad-accounts"
                />
                <GettingStartedStep
                  step={2}
                  title="Sync Your Data"
                  description="Pull campaign, ad set, ad, and metrics data from Meta."
                  href="/ad-accounts"
                />
                <GettingStartedStep
                  step={3}
                  title="Analyze Performance"
                  description="View insights and track your campaign performance."
                  href="/analytics"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  color: 'blue' | 'green' | 'yellow' | 'purple'
}) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-400/10',
    green: 'text-green-400 bg-green-400/10',
    yellow: 'text-yellow-400 bg-yellow-400/10',
    purple: 'text-purple-400 bg-purple-400/10'
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon
}: {
  title: string
  description: string
  href: string
  icon: any
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-4 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-4 transition-all"
    >
      <div className="p-2 bg-slate-700 rounded-lg">
        <Icon className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
      </div>
      <div>
        <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
    </Link>
  )
}

function GettingStartedStep({
  step,
  title,
  description,
  href
}: {
  step: number
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl p-5 transition-all"
    >
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-bold text-white mb-3">
        {step}
      </div>
      <h3 className="font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  )
}
