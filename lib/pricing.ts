import { PricingTier } from './types'

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    features: [
      '1 active project',
      'Up to 10 total pages',
      'No historical chat',
      'Standard processing'
    ],
    limits: {
      activeProjects: 1,
      totalPages: 10,
      historicalChat: false,
      calendarExport: false,
      priorityProcessing: false,
      teamSharing: 0,
      emailSupport: false,
      advancedAnalysis: false
    }
  },
  {
    name: 'Pro',
    price: 19,
    features: [
      'Unlimited projects',
      'Up to 500 total pages',
      'Unlimited historical chat',
      'Calendar export (ICS)',
      'Priority processing'
    ],
    limits: {
      activeProjects: Infinity,
      totalPages: 500,
      historicalChat: true,
      calendarExport: true,
      priorityProcessing: true,
      teamSharing: 0,
      emailSupport: false,
      advancedAnalysis: false
    }
  },
  {
    name: 'Team',
    price: 39,
    features: [
      'Everything in Pro',
      'Share projects with 3 users',
      'Email support',
      'Advanced document analysis'
    ],
    limits: {
      activeProjects: Infinity,
      totalPages: 500,
      historicalChat: true,
      calendarExport: true,
      priorityProcessing: true,
      teamSharing: 3,
      emailSupport: true,
      advancedAnalysis: true
    }
  }
]

export function getTierByPrice(price: number): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.price === price)
}

export function getTierByName(name: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.name.toLowerCase() === name.toLowerCase())
}