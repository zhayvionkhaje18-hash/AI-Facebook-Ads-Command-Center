import { generateRecommendations, getActionLabel, getActionColor, getActionIcon } from '../recommendations'
import type { CampaignRecommendation } from '../recommendations'

describe('recommendations engine', () => {
  const mockCampaigns = [
    { campaign_id: 'camp1', name: 'High Performer', status: 'ACTIVE' },
    { campaign_id: 'camp2', name: 'Low Performer', status: 'ACTIVE' },
    { campaign_id: 'camp3', name: 'Medium', status: 'ACTIVE' },
  ]

  const mockInsights = {
    camp1: { spend: 500, impressions: 50000, clicks: 1000, conversions: 50, purchase_value: 2000, reach: 40000 },
    camp2: { spend: 300, impressions: 30000, clicks: 150, conversions: 5, purchase_value: 100, reach: 25000 },
    camp3: { spend: 200, impressions: 20000, clicks: 200, conversions: 10, purchase_value: 300, reach: 15000 },
  }

  describe('generateRecommendations', () => {
    it('returns recommendations for high ROAS campaign', () => {
      const recs = generateRecommendations(mockCampaigns, mockInsights)
      expect(recs.length).toBeGreaterThan(0)

      const highPerformerRec = recs.find((r) => r.campaignId === 'camp1')
      expect(highPerformerRec).toBeDefined()
      if (highPerformerRec) {
        // camp1: roas=4.0, ctr=2.0%, so should get increase_budget or duplicate
        expect(['increase_budget', 'duplicate']).toContain(highPerformerRec.actionType)
        expect(highPerformerRec.confidenceScore).toBeGreaterThan(0.4)
        expect(highPerformerRec.reasoning).toContain('High Performer')
      }
    })

    it('recommends pause for very poor campaigns', () => {
      const poorCampaigns = [
        { campaign_id: 'poor1', name: 'Bad Campaign', status: 'ACTIVE' },
      ]
      // Need healthScore < 40 but confidence >= 0.4
      // roas = 100/500 = 0.2, ctr = 500/50000*100 = 1.0%
      // roasScore = (0.2/4)*100 = 5, ctrScore = (1.0/2)*100 = 50
      // healthScore = 5*0.4 + 50*0.3 = 17 -> < 40 triggers pause
      // confidence = (17/100 * 0.6 + 0.9 * 0.4) = 0.102 + 0.36 = 0.462 >= 0.4
      const poorInsights = {
        poor1: { spend: 500, impressions: 50000, clicks: 500, conversions: 10, purchase_value: 100, reach: 40000 },
      }

      const recs = generateRecommendations(poorCampaigns, poorInsights)
      expect(recs.length).toBeGreaterThan(0)
      expect(recs[0].actionType).toBe('pause')
    })

    it('filters out low confidence recommendations', () => {
      const tinyCampaigns = [
        { campaign_id: 'tiny1', name: 'Tiny', status: 'ACTIVE' },
      ]
      const tinyInsights = {
        tiny1: { spend: 5, impressions: 100, clicks: 1, conversions: 0, purchase_value: 0, reach: 80 },
      }

      const recs = generateRecommendations(tinyCampaigns, tinyInsights)
      // Should be empty due to low data quality
      expect(recs.length).toBe(0)
    })

    it('sorts by confidence descending', () => {
      const recs = generateRecommendations(mockCampaigns, mockInsights)
      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].confidenceScore).toBeGreaterThanOrEqual(recs[i].confidenceScore)
      }
    })
  })

  describe('getActionLabel', () => {
    it('returns correct labels', () => {
      expect(getActionLabel('increase_budget')).toBe('Increase Budget')
      expect(getActionLabel('pause')).toBe('Pause Campaign')
      expect(getActionLabel('duplicate')).toBe('Duplicate Campaign')
    })
  })

  describe('getActionColor', () => {
    it('returns color classes', () => {
      expect(getActionColor('increase_budget')).toContain('green')
      expect(getActionColor('pause')).toContain('red')
    })
  })

  describe('getActionIcon', () => {
    it('returns icon names', () => {
      expect(getActionIcon('increase_budget')).toBe('TrendingUp')
      expect(getActionIcon('pause')).toBe('Pause')
    })
  })
})
