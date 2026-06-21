// Input validation utilities for API routes

export function validateWorkspaceId(value: unknown): string | null {
  if (typeof value !== 'string') return 'workspace_id must be a string'
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return 'workspace_id must be a valid UUID'
  }
  return null
}

export function validateDateRange(startDate?: string, endDate?: string): string | null {
  if (startDate) {
    const d = new Date(startDate)
    if (isNaN(d.getTime())) return 'Invalid start_date format'
    if (d > new Date()) return 'start_date cannot be in the future'
  }
  if (endDate) {
    const d = new Date(endDate)
    if (isNaN(d.getTime())) return 'Invalid end_date format'
    if (d > new Date()) return 'end_date cannot be in the future'
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return 'start_date must be before end_date'
  }
  return null
}

export function sanitizeString(value: unknown, maxLength: number = 500): string | null {
  if (typeof value !== 'string') return null
  return value.trim().slice(0, maxLength)
}

export function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  const validPage = Math.max(1, Math.min(1000, Number(page) || 1))
  const validLimit = Math.max(1, Math.min(100, Number(limit) || 20))
  return { page: validPage, limit: validLimit }
}

export function validateReportType(value: unknown): string | null {
  const validTypes = ['campaign_summary', 'performance', 'insights', 'health', 'recommendations', 'forecasts', 'alerts']
  if (typeof value !== 'string') return 'report_type must be a string'
  if (!validTypes.includes(value)) return `report_type must be one of: ${validTypes.join(', ')}`
  return null
}

export function validateReportFormat(value: unknown): string | null {
  const validFormats = ['csv', 'excel', 'pdf']
  if (typeof value !== 'string') return 'format must be a string'
  if (!validFormats.includes(value)) return `format must be one of: ${validFormats.join(', ')}`
  return null
}

export function validateAlertStatus(value: unknown): string | null {
  const validStatuses = ['active', 'resolved', 'dismissed']
  if (typeof value !== 'string') return null
  if (!validStatuses.includes(value)) return `status must be one of: ${validStatuses.join(', ')}`
  return null
}
