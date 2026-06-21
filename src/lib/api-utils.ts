import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateWorkspaceId } from '@/lib/validation'

export interface ApiContext {
  userId: string
  workspaceId?: string
  membership?: { role: string }
}

export async function withAuth(
  handler: (req: Request, context: ApiContext) => Promise<NextResponse>
): Promise<(request: Request) => Promise<NextResponse>> {
  return async (request: Request) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return await handler(request, { userId: user.id })
    } catch (error: any) {
      console.error('API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export async function withWorkspaceAuth(
  handler: (req: Request, context: ApiContext) => Promise<NextResponse>
): Promise<(request: Request) => Promise<NextResponse>> {
  return async (request: Request) => {
    try {
      const supabase = await createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { searchParams } = new URL(request.url)
      const workspaceId = searchParams.get('workspace_id')

      if (!workspaceId) {
        return NextResponse.json({ error: 'workspace_id is required' }, { status: 400 })
      }

      const workspaceError = validateWorkspaceId(workspaceId)
      if (workspaceError) {
        return NextResponse.json({ error: workspaceError }, { status: 400 })
      }

      const { data: membership } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (!membership) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }

      return await handler(request, {
        userId: user.id,
        workspaceId,
        membership,
      })
    } catch (error: any) {
      console.error('API error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

export function createErrorResponse(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status }
  )
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status })
}
