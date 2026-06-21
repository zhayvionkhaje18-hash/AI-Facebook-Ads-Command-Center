import { generateForecasts, generateWorkspaceForecasts, formatForecastValue, getForecastLabel } from '../forecasting'

describe('forecasting engine', () => {
  const mockTimeSeries = [
    { date: '2026-06-01', spend: 100, revenue: 300, purchase_value: 300, clicks: 50, impressions: 5000, conversions: 5, roas: 3, cpa: 20 },
    { date: '2026-06-02', spend: 110, revenue: 320, purchase_value: 320, clicks: 55, impressions: 5200, conversions: 6, roas: 2.9, cpa: 18.3 },
    { date: '2026-06-03', spend: 105, revenue: 310, purchase_value: 310, clicks: 52, impressions: 5100, conversions: 5, roas: 2.95, cpa: 21 },
    { date: '2026-06-04', spend: 115, revenue: 340, purchase_value: 340, clicks: 58, impressions: 5300, conversions: 7, roas: 2.96, cpa: 16.4 },
    { date: '2026-06-05', spend: 120, revenue: 350, purchase_value: 350, clicks: 60, impressions: 5400, conversions: 7, roas: 2.92, cpa: 17.1 },
    { date: '2026-06-06', spend: 125, revenue: 360, purchase_value: 360, clicks: 62, impressions: 5500, conversions: 8, roas: 2.88, cpa: 15.6 },
    { date: '2026-06-07', spend: 130, revenue: 370, purchase_value: 370, clicks: 65, impressions: 5600, conversions: 8, roas: 2.85, cpa: 16.3 },
  ]

  describe('generateForecasts', () => {
    it('returns forecasts for all types', () => {
      const forecasts = generateForecasts('camp1', 'Test Campaign', mockTimeSeries, 7)
      expect(forecasts.length).toBe(5)
      expect(forecasts.map((f) => f.forecastType)).toContain('revenue')
      expect(forecasts.map((f) => f.forecastType)).toContain('spend')
      expect(forecasts.map((f) => f.forecastType)).toContain('roas')
    })

    it('includes daily forecasts', () => {
      const forecasts = generateForecasts('camp1', 'Test Campaign', mockTimeSeries, 7)
      const revenueForecast = forecasts.find((f) => f.forecastType === 'revenue')
      expect(revenueForecast).toBeDefined()
      expect(revenueForecast?.dailyForecasts.length).toBe(7)
    })

    it('returns empty for insufficient data', () => {
      const forecasts = generateForecasts('camp1', 'Test', [], 7)
      expect(forecasts.length).toBe(0)
    })

    it('calculates trend direction', () => {
      const forecasts = generateForecasts('camp1', 'Test Campaign', mockTimeSeries, 7)
      forecasts.forEach((f) => {
        expect(['up', 'down', 'stable']).toContain(f.trend)
      })
    })

    it('includes confidence intervals', () => {
      const forecasts = generateForecasts('camp1', 'Test Campaign', mockTimeSeries, 7)
      const spendForecast = forecasts.find((f) => f.forecastType === 'spend')
      expect(spendForecast?.confidenceLower).toBeDefined()
      expect(spendForecast?.confidenceUpper).toBeDefined()
      expect(spendForecast?.confidenceLower).toBeLessThanOrEqual(spendForecast?.confidenceUpper || 0)
    })
  })

  describe('generateWorkspaceForecasts', () => {
    it('aggregates all campaigns', () => {
      const forecasts = generateWorkspaceForecasts(mockTimeSeries, 7)
      expect(forecasts.length).toBe(5)
      expect(forecasts[0].campaignName).toBe('All Campaigns')
    })
  })

  describe('formatForecastValue', () => {
    it('formats currency', () => {
      expect(formatForecastValue(1234.56, 'revenue')).toBe('$1234.56')
    })
    it('formats ratio', () => {
      expect(formatForecastValue(2.5, 'roas')).toBe('2.50x')
    })
    it('formats number', () => {
      expect(formatForecastValue(42, 'purchases')).toBe('42')
    })
  })

  describe('getForecastLabel', () => {
    it('returns correct labels', () => {
      expect(getForecastLabel('revenue')).toBe('Revenue')
      expect(getForecastLabel('roas')).toBe('ROAS')
      expect(getForecastLabel('purchases')).toBe('Purchases')
    })
  })
})
