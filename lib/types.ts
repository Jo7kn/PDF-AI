export interface User {
  id: string
  email: string
  created_at: string
  tier: 'free' | 'pro' | 'team'
  total_pages_used: number
  active_projects: number
}

export interface Document {
  id: string
  user_id: string
  name: string
  file_url: string
  summary: string | null
  deadlines_json: any
  total_pages: number
  parsed_text: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  document_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface PricingTier {
  name: string
  price: number
  features: string[]
  limits: {
    activeProjects: number
    totalPages: number
    historicalChat: boolean
    calendarExport: boolean
    priorityProcessing: boolean
    teamSharing: number
    emailSupport: boolean
    advancedAnalysis: boolean
  }
}
