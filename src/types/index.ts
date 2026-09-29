export type UserRole = 'FOUNDER' | 'TEAM_MEMBER' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  industry: string;
  description: string;
  targetAudience: string;
  activePlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  creditsUsed: number;
  creditsLimit: number;
  teamMembersCount: number;
  teamEditingAllowed?: boolean;
  createdAt: string;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: UserRole;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED';
  invitedAt: string;
}

export interface StartupProfile {
  id: string;
  workspaceId: string;
  name: string;
  industry: string;
  targetAudience: string;
  problem: string;
  solution: string;
  competitors: string;
  revenueModel: string;
  oneLiner: string;
}

export interface IdeaValidationReport {
  id: string;
  workspaceId: string;
  marketOpportunity: {
    size: string;
    cagr: string;
    growthPotential: 'High' | 'Medium' | 'Low';
    summary: string;
  };
  competitorAnalysis: {
    directCompetitors: string[];
    indirectCompetitors: string[];
    marketGap: string;
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  monetizationStrategies: {
    channels: { name: string; type: string; difficulty: string }[];
    pricingRecommendation: string;
  };
  risksAndChallenges: {
    technical: string[];
    business: string[];
    financial: string[];
    regulatory: string[];
  };
  score: number; // 0-100 startup score
  createdAt: string;
}

export interface BusinessPlanSection {
  id: string;
  title: string;
  key: string;
  content: string;
}

export interface BusinessPlan {
  id: string;
  workspaceId: string;
  sections: BusinessPlanSection[];
  version: number;
  updatedAt: string;
}

export interface BrandKit {
  id: string;
  workspaceId: string;
  nameIdeas: string[];
  taglineIdeas: string[];
  mission: string;
  vision: string;
  brandStory: string;
  personality: string;
  paletteColors: string[]; // e.g., ["#090a0f", "#8b5cf6"]
  values: string[];
  voiceAndTone: string;
}

export interface WebsiteSection {
  hero: { title: string; subtitle: string; cta: string };
  features: { title: string; description: string; icon: string }[];
  pricing: { name: string; price: string; features: string[] }[];
  faq: { question: string; answer: string }[];
  seoMetadata: { title: string; description: string; keywords: string };
}

export interface WebsiteContent {
  id: string;
  workspaceId: string;
  sections: WebsiteSection;
  updatedAt: string;
}

export interface ContentCalendarItem {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  postContent: string;
  scheduledDate: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'scheduled' | 'published' | 'draft';
}

export interface Persona {
  name: string;
  demographics: string;
  painPoints: string[];
  channels: string[];
}

export interface ContentCalendarPost {
  id: string;
  date: string;
  platform: string;
  type: string;
  content: string;
  status: string;
}

export interface ContentCalendar {
  id: string;
  workspaceId: string;
  month: string;
  posts: ContentCalendarPost[];
}

export interface MarketingStrategy {
  id: string;
  workspaceId: string;
  gtmLaunchPlan: string[];
  acquisitionChannels: { name: string; cost: string; roi: string }[];
  contentCalendar: ContentCalendarItem[];
  updatedAt: string;
  personas?: Persona[];
  keyChannels?: string[];
  messagingPillars?: string[];
}

export interface PitchDeckSlide {
  id: string;
  slideNumber: number;
  title: string;
  content: string; // markdown or structured HTML string
  points: string[];
  layout?: string; // e.g., 'traditional' | 'split' | 'grid' | 'cover'
}

export interface PitchDeck {
  id: string;
  workspaceId: string;
  slides: PitchDeckSlide[];
  updatedAt: string;
  theme?: string; // e.g., 'gradient-fusion' | 'midnight-tech' | 'venture-editorial' | etc.
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
  sourceDocuments?: { id: string; name: string; matchedText: string }[];
}

export interface ChatSession {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
}

export interface UploadedDocument {
  id: string;
  workspaceId: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  chunkCount: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  workspaceId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface WorkspaceAdminInfo {
  id: string;
  name: string;
  industry: string;
  activePlan: 'FREE' | 'PRO' | 'ENTERPRISE';
  creditsUsed: number;
  creditsLimit: number;
  userEmail: string;
  createdAt: string;
}

export interface SystemStats {
  totalUsers: number;
  activeWorkspaces: number;
  totalRevenue: number;
  tokenUsage: number;
  planDistribution: Record<string, number>;
  workspacesList: WorkspaceAdminInfo[];
  recentSignups: { id: string; name: string; email: string; role: string; joined: string }[];
  activityLogs: ActivityLog[];
}
