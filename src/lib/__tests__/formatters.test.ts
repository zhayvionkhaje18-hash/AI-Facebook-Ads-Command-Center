import { formatNumber, formatCurrency, formatPercent, formatCompact, formatDate } from '../formatters'

describe('formatters', () => {
  describe('formatNumber', () => {
    it('formats millions', () => {
      expect(formatNumber(1500000)).toBe('1.5M')
    })
    it('formats thousands', () => {
      expect(formatNumber(1500)).toBe('1.5K')
    })
    it('formats small numbers', () => {
      expect(formatNumber(42)).toBe('42')
    })
  })

  describe('formatCurrency', () => {
    it('formats USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })
    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })
  })

  describe('formatPercent', () => {
    it('formats percentage', () => {
      expect(formatPercent(1.5)).toBe('1.50%')
    })
  })

  describe('formatCompact', () => {
    it('formats billions', () => {
      expect(formatCompact(1500000000)).toBe('1.5B')
    })
  })

  describe('formatDate', () => {
    it('formats date string', () => {
      expect(formatDate('2026-06-21')).toMatch(/Jun/)
    })
  })
})
