import { generateAlerts, getAlertIcon, getAlertColor, getAlertLabel, generateDedupKey } from '../alerts'
import type { AlertType } from '../alerts'

describe('alerts engine', () => {
  const mockCampaigns = [
    { campaign_id: 'camp1', name: 'Test Campaign', status: 'ACTIVE' },
  ]

  describe('generateAlerts', () => {
    it('detects ROAS drop', () => {
      const current = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 1000, reach: 40000 },
      }
      const previous = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 3000, reach: 40000 },
      }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      const roasDrop = alerts.find((a) => a.alertType === 'roas_drop')
      expect(roasDrop).toBeDefined()
      if (roasDrop) {
        expect(roasDrop.severity).toBe('critical')
        expect(roasDrop.metricValue).toBeCloseTo(2.0, 1)
        expect(roasDrop.previousValue).toBeCloseTo(6.0, 1)
      }
    })

    it('detects CPA spike', () => {
      const current = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 5, purchase_value: 500, reach: 40000 },
      }
      const previous = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 500, reach: 40000 },
      }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      const cpaSpike = alerts.find((a) => a.alertType === 'cpa_spike')
      expect(cpaSpike).toBeDefined()
      if (cpaSpike) {
        expect(cpaSpike.severity).toBe('critical')
      }
    })

    it('detects high frequency', () => {
      const current = {
        camp1: { spend: 500, impressions: 100000, clicks: 1000, conversions: 50, purchase_value: 2000, reach: 10000 },
      }
      const previous = { camp1: {} }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      const freqAlert = alerts.find((a) => a.alertType === 'high_frequency')
      expect(freqAlert).toBeDefined()
      if (freqAlert) {
        expect(freqAlert.severity).toBe('critical')
        expect(freqAlert.metricValue).toBeCloseTo(10, 0)
      }
    })

    it('detects pixel issue', () => {
      const current = {
        camp1: { spend: 100, impressions: 5000, clicks: 20, conversions: 0, purchase_value: 0, reach: 4000 },
      }
      const previous = { camp1: {} }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      const pixelAlert = alerts.find((a) => a.alertType === 'pixel_issue')
      expect(pixelAlert).toBeDefined()
      if (pixelAlert) {
        expect(pixelAlert.severity).toBe('critical')
      }
    })

    it('sorts by severity: critical first', () => {
      const current = {
        camp1: { spend: 500, impressions: 100000, clicks: 1000, conversions: 0, purchase_value: 0, reach: 10000 },
      }
      const previous = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 3000, reach: 40000 },
      }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].severity).toBe('critical')
    })

    it('returns empty for no issues', () => {
      const current = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 2000, reach: 40000 },
      }
      const previous = {
        camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 2000, reach: 40000 },
      }

      const alerts = generateAlerts(mockCampaigns, current, previous)
      expect(alerts.length).toBe(0)
    })
  })

  describe('getAlertIcon', () => {
    it('returns correct icons', () => {
      expect(getAlertIcon('roas_drop')).toBe('TrendingDown')
      expect(getAlertIcon('pixel_issue')).toBe('AlertTriangle')
    })
  })

  describe('getAlertColor', () => {
    it('returns correct colors', () => {
      expect(getAlertColor('critical')).toContain('red')
      expect(getAlertColor('warning')).toContain('amber')
      expect(getAlertColor('info')).toContain('blue')
    })
  })

  describe('getAlertLabel', () => {
    it('returns correct labels', () => {
      expect(getAlertLabel('roas_drop')).toBe('ROAS Drop')
      expect(getAlertLabel('creative_fatigue')).toBe('Creative Fatigue')
    })
  })

  describe('generateDedupKey', () => {
    it('generates consistent keys', () => {
      const key1 = generateDedupKey('roas_drop', 'camp1', 24)
      const key2 = generateDedupKey('roas_drop', 'camp1', 24)
      expect(key1).toBe(key2)
    })
    it('includes type and campaign', () => {
      const key = generateDedupKey('roas_drop', 'camp1', 24)
      expect(key).toContain('roas_drop')
      expect(key).toContain('camp1')
    })
  })
})
