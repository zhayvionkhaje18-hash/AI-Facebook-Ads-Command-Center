import {
  validateWorkspaceId,
  validateDateRange,
  sanitizeString,
  validatePagination,
  validateReportType,
  validateReportFormat,
} from '../validation'

describe('validation', () => {
  describe('validateWorkspaceId', () => {
    it('accepts valid UUID', () => {
      expect(validateWorkspaceId('550e8400-e29b-41d4-a716-446655440000')).toBeNull()
    })
    it('rejects non-string', () => {
      expect(validateWorkspaceId(123)).toBe('workspace_id must be a string')
    })
    it('rejects invalid UUID', () => {
      expect(validateWorkspaceId('not-a-uuid')).toBe('workspace_id must be a valid UUID')
    })
  })

  describe('validateDateRange', () => {
    it('accepts valid range', () => {
      expect(validateDateRange('2026-01-01', '2026-06-21')).toBeNull()
    })
    it('rejects invalid start date', () => {
      expect(validateDateRange('invalid', '2026-06-21')).toBe('Invalid start_date format')
    })
    it('rejects start after end', () => {
      expect(validateDateRange('2026-06-21', '2026-01-01')).toBe('start_date must be before end_date')
    })
    it('rejects future date', () => {
      const future = new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]
      expect(validateDateRange(future, undefined)).toBe('start_date cannot be in the future')
    })
  })

  describe('sanitizeString', () => {
    it('trims and truncates', () => {
      expect(sanitizeString('  hello  ', 5)).toBe('hello')
    })
    it('returns null for non-string', () => {
      expect(sanitizeString(123)).toBeNull()
    })
  })

  describe('validatePagination', () => {
    it('returns defaults', () => {
      expect(validatePagination()).toEqual({ page: 1, limit: 20 })
    })
    it('clamps max values', () => {
      expect(validatePagination(2000, 500)).toEqual({ page: 1000, limit: 100 })
    })
  })

  describe('validateReportType', () => {
    it('accepts valid type', () => {
      expect(validateReportType('campaign_summary')).toBeNull()
    })
    it('rejects invalid type', () => {
      expect(validateReportType('invalid')).toContain('campaign_summary')
    })
  })

  describe('validateReportFormat', () => {
    it('accepts csv', () => {
      expect(validateReportFormat('csv')).toBeNull()
    })
    it('rejects invalid format', () => {
      expect(validateReportFormat('xml')).toContain('csv')
    })
  })
})
