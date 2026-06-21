import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const checks: Record<string, { status: 'ok' | 'error'; message?: string; latency?: number }> = {}
  const startTime = Date.now()

  // Database check
  try {
    const dbStart = Date.now()
    const supabase = await createClient()
    const { error } = await supabase.from('workspaces').select('id').limit(1)
    checks.database = {
      status: error ? 'error' : 'ok',
      message: error?.message,
      latency: Date.now() - dbStart,
    }
  } catch (e: any) {
    checks.database = { status: 'error', message: e.message }
  }

  // Memory check
  const memUsage = process.memoryUsage()
  checks.memory = {
    status: memUsage.heapUsed < 512 * 1024 * 1024 ? 'ok' : 'error',
    message: `Heap: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
  }

  const allOk = Object.values(checks).every((c) => c.status === 'ok')

  return NextResponse.json(
    {
      status: allOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      latency: Date.now() - startTime,
      checks,
      version: process.env.npm_package_version || '0.1.0',
    },
    { status: allOk ? 200 : 503 }
  )
}
