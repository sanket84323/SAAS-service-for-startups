import type { 
  User, Workspace, StartupProfile, IdeaValidationReport, 
  BusinessPlan, BrandKit, WebsiteContent, MarketingStrategy, 
  PitchDeck, PitchDeckSlide, ChatSession, ChatMessage, UploadedDocument, 
  ActivityLog, SystemStats, ContentCalendar 
} from '../types';

const API_BASE = 'http://100.53.214.128:8080/api';

// Helper to retrieve token from storage
const getToken = (): string | null => localStorage.getItem('startupos_token');

// Generic authenticated fetch wrapper
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- Auth APIs ---
  login: async (email: string, password: String): Promise<{ token: string; user: User; workspace?: Workspace }> => {
    return apiRequest<{ token: string; user: User; workspace?: Workspace }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  register: async (firstName: string, lastName: string, email: string, password: String, role: string, workspaceName: string, industry: string, avatarUrl?: string): Promise<{ token: string; user: User; workspace: Workspace }> => {
    return apiRequest<{ token: string; user: User; workspace: Workspace }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password, role, workspaceName, industry, avatarUrl })
    });
  },

  getCurrentUser: async (): Promise<{ user: User; workspace?: Workspace }> => {
    return apiRequest<{ user: User; workspace?: Workspace }>('/auth/current');
  },

  // --- Profile APIs ---
  getProfile: async (workspaceId: string): Promise<StartupProfile> => {
    return apiRequest<StartupProfile>(`/profile/${workspaceId}`);
  },

  saveProfile: async (profile: StartupProfile): Promise<StartupProfile> => {
    return apiRequest<StartupProfile>('/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    });
  },

  // --- Idea Validator APIs ---
  getValidation: async (workspaceId: string): Promise<IdeaValidationReport> => {
    return apiRequest<IdeaValidationReport>(`/validation/${workspaceId}`);
  },

  generateValidation: async (workspaceId: string): Promise<IdeaValidationReport> => {
    return apiRequest<IdeaValidationReport>('/validation/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
  },

  // --- Business Plan APIs ---
  getBusinessPlan: async (workspaceId: string): Promise<BusinessPlan> => {
    return apiRequest<BusinessPlan>(`/business-plan/${workspaceId}`);
  },

  saveBusinessPlan: async (plan: BusinessPlan): Promise<BusinessPlan> => {
    return apiRequest<BusinessPlan>('/business-plan', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  regenerateSection: async (workspaceId: string, sectionKey: string, sectionTitle: string): Promise<{ content: string }> => {
    return apiRequest<{ content: string }>('/business-plan/regenerate-section', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, sectionKey, sectionTitle })
    });
  },

  // --- Branding Kit APIs ---
  getBranding: async (workspaceId: string): Promise<BrandKit> => {
    return apiRequest<BrandKit>(`/branding/${workspaceId}`);
  },

  generateBranding: async (workspaceId: string): Promise<BrandKit> => {
    return apiRequest<BrandKit>('/branding/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
  },

  // --- Website Copywriter APIs ---
  getWebsiteContent: async (workspaceId: string): Promise<WebsiteContent> => {
    return apiRequest<WebsiteContent>(`/website/${workspaceId}`);
  },

  saveWebsiteContent: async (content: WebsiteContent): Promise<WebsiteContent> => {
    return apiRequest<WebsiteContent>('/website', {
      method: 'POST',
      body: JSON.stringify(content)
    });
  },

  generateWebsiteContent: async (workspaceId: string): Promise<WebsiteContent> => {
    return apiRequest<WebsiteContent>('/website/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
  },

  // --- Growth Marketing Strategy APIs ---
  getMarketingStrategy: async (workspaceId: string): Promise<MarketingStrategy> => {
    return apiRequest<MarketingStrategy>(`/marketing/${workspaceId}`);
  },

  generateMarketingStrategy: async (workspaceId: string): Promise<MarketingStrategy> => {
    return apiRequest<MarketingStrategy>('/marketing/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
  },

  // --- Content Calendar APIs ---
  getContentCalendar: async (workspaceId: string): Promise<ContentCalendar> => {
    return apiRequest<ContentCalendar>(`/calendar/${workspaceId}`);
  },

  generateContentCalendar: async (workspaceId: string): Promise<ContentCalendar> => {
    return apiRequest<ContentCalendar>('/calendar/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId })
    });
  },

  // --- Pitch Deck APIs ---
  getPitchDeck: async (workspaceId: string): Promise<PitchDeck> => {
    return apiRequest<PitchDeck>(`/pitch-deck/${workspaceId}`);
  },

  savePitchDeck: async (deck: PitchDeck): Promise<PitchDeck> => {
    return apiRequest<PitchDeck>('/pitch-deck', {
      method: 'POST',
      body: JSON.stringify(deck)
    });
  },

  generatePitchDeck: async (workspaceId: string, instructions?: string): Promise<PitchDeck> => {
    return apiRequest<PitchDeck>('/pitch-deck/generate', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, instructions })
    });
  },

  refineSlide: async (workspaceId: string, slide: PitchDeckSlide, instructions: string): Promise<PitchDeckSlide> => {
    return apiRequest<PitchDeckSlide>('/pitch-deck/refine-slide', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, slide, instructions })
    });
  },

  // --- AI Mentor Chat APIs ---
  getChatSessions: async (workspaceId: string): Promise<ChatSession[]> => {
    return apiRequest<ChatSession[]>(`/chat/sessions/${workspaceId}`);
  },

  getChatMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    return apiRequest<ChatMessage[]>(`/chat/messages/${sessionId}`);
  },

  createChatSession: async (workspaceId: string, title: string): Promise<ChatSession> => {
    return apiRequest<ChatSession>('/chat/session', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, title })
    });
  },

  sendMessage: async (workspaceId: string, sessionId: string, content: string): Promise<ChatMessage> => {
    return apiRequest<ChatMessage>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, sessionId, content })
    });
  },

  // --- Uploaded RAG Documents APIs ---
  getDocuments: async (workspaceId: string): Promise<UploadedDocument[]> => {
    return apiRequest<UploadedDocument[]>(`/documents/${workspaceId}`);
  },

  uploadDocument: async (workspaceId: string, fileName: string, fileSize: string, fileType: string): Promise<UploadedDocument> => {
    return apiRequest<UploadedDocument>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, fileName, fileSize, fileType })
    });
  },

  // --- Platform Admin Stats APIs ---
  getStats: async (): Promise<SystemStats> => {
    return apiRequest<SystemStats>('/admin/stats');
  },

  upgradePlan: async (workspaceId: string, planName: string): Promise<Workspace> => {
    return apiRequest<Workspace>('/billing/upgrade', {
      method: 'POST',
      body: JSON.stringify({ workspaceId, planName })
    });
  },

  deleteUser: async (userId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  },

  deleteWorkspace: async (workspaceId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(`/admin/workspaces/${workspaceId}`, {
      method: 'DELETE'
    });
  },

  updateWorkspacePlan: async (workspaceId: string, plan: string): Promise<Workspace> => {
    return apiRequest<Workspace>(`/admin/workspaces/${workspaceId}/plan`, {
      method: 'PUT',
      body: JSON.stringify({ plan })
    });
  },

  // --- Dynamic Team & Settings ---
  getTeamMembers: async (workspaceId: string): Promise<User[]> => {
    return apiRequest<User[]>(`/workspace/${workspaceId}/members`);
  },

  addTeamMember: async (workspaceId: string, memberData: any): Promise<User[]> => {
    return apiRequest<User[]>(`/workspace/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  },

  updateWorkspaceSettings: async (workspaceId: string, settings: { teamEditingAllowed: boolean }): Promise<Workspace> => {
    return apiRequest<Workspace>(`/workspace/${workspaceId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  getActivityLogs: async (workspaceId: string): Promise<any[]> => {
    return apiRequest<any[]>(`/workspace/${workspaceId}/activity`);
  },

  saveBranding: async (brandKit: BrandKit): Promise<BrandKit> => {
    return apiRequest<BrandKit>('/branding', {
      method: 'POST',
      body: JSON.stringify(brandKit)
    });
  }
};
