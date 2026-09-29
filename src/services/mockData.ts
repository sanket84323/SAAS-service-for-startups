import type { 
  User, Workspace, StartupProfile, IdeaValidationReport, 
  BusinessPlan, BrandKit, WebsiteContent, MarketingStrategy, 
  PitchDeck, ChatSession, ChatMessage, UploadedDocument, 
  ActivityLog, SystemStats, ContentCalendar 
} from '../types';

// Helper to load/save from localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initial Mock Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr_founder',
    firstName: 'Piyush',
    lastName: 'Sakha',
    email: 'piyush@startupos.com',
    role: 'FOUNDER',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    joinedAt: '2026-05-01T10:00:00Z'
  },
  {
    id: 'usr_teammember',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah@startupos.com',
    role: 'TEAM_MEMBER',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80',
    joinedAt: '2026-05-15T14:30:00Z'
  },
  {
    id: 'usr_admin',
    firstName: 'Alex',
    lastName: 'Miller',
    email: 'admin@startupos.com',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    joinedAt: '2026-04-20T08:15:00Z'
  }
];

// Initial Workspace
const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'wsp_ecosphere',
    name: 'EcoSphere AI',
    industry: 'Sustainability Technology',
    description: 'AI-driven carbon footprint tracking and offsets optimizer for small and medium businesses (SMBs).',
    targetAudience: 'SMBs in retail, manufacturing, and software sectors striving for net-zero carbon operations.',
    activePlan: 'PRO',
    creditsUsed: 1450,
    creditsLimit: 5000,
    teamMembersCount: 2,
    createdAt: '2026-05-01T10:05:00Z'
  }
];

// Initial Startup Profile
const INITIAL_STARTUP_PROFILE: StartupProfile = {
  id: 'prof_ecosphere',
  workspaceId: 'wsp_ecosphere',
  name: 'EcoSphere AI',
  industry: 'Sustainability Tech',
  targetAudience: 'SMBs, specifically retailers, logistics startups, and tech companies.',
  oneLiner: 'Track, reduce, and offset your business carbon footprint with automated AI analytics.',
  problem: 'SMBs face pressure from clients and regulators to reduce emissions, but hiring consultants costs $10k+ and existing enterprise software is too complex.',
  solution: 'A simple integration that aggregates utility bills, logistics data, and cloud hosting spend, calculates emissions via AI, and recommends targeted reduction activities.',
  competitors: 'Watershed (Enterprise focused, expensive), Sweep (Mid-market), Treebly (Manual entries).',
  revenueModel: 'SaaS subscription model starting at $79/month for starter tools up to $299/month for multi-site monitoring, plus a 5% brokerage fee on carbon offset purchases.'
};

// Initial Idea Validation
const INITIAL_VALIDATION: IdeaValidationReport = {
  id: 'val_ecosphere',
  workspaceId: 'wsp_ecosphere',
  marketOpportunity: {
    size: '$12.4 Billion',
    cagr: '18.4%',
    growthPotential: 'High',
    summary: 'The global SMB sustainability market is expanding rapidly due to corporate supply-chain net-zero requirements. Large enterprises are auditing Scope 3 emissions, forcing vendors to report compliance.'
  },
  competitorAnalysis: {
    directCompetitors: ['Watershed', 'Sweep', 'Greenly'],
    indirectCompetitors: ['Manual Excel templates', 'Environmental consulting agencies'],
    marketGap: 'Most tools focus on enterprise companies with massive budgets. EcoSphere serves the underserved SMB layer with zero-touch automated integrations.'
  },
  swotAnalysis: {
    strengths: [
      'Automated accounting integrations (QuickBooks, Xero) for expense carbon modeling.',
      'Low cost compared to consulting firms.',
      'Fast setup in under 10 minutes.'
    ],
    weaknesses: [
      'Initial accuracy relies on expense proxies rather than direct sensor data.',
      'Dependence on third-party API connections.',
      'Brand building in a nascent market segment.'
    ],
    opportunities: [
      'Scope 3 compliance requirements by EU (CSRD) and California (SB 253).',
      'White-label portal for accounting firms to resell sustainability tracking.',
      'Integration of a carbon offset marketplace with certified credits.'
    ],
    threats: [
      'Incumbent accounting software (Intuit, Xero) building carbon tracking natively.',
      'Greenwashing regulatory crackdowns creating mistrust in offsets.',
      'Sudden drop in corporate sustainability budgets.'
    ]
  },
  monetizationStrategies: {
    channels: [
      { name: 'Self-serve SaaS', type: 'Subscription', difficulty: 'Easy' },
      { name: 'White-label Accountant Partners', type: 'B2B2C Reseller', difficulty: 'Medium' },
      { name: 'Certified Offset Marketplace commission', type: 'Transactional Fee', difficulty: 'Medium' }
    ],
    pricingRecommendation: '$79/mo Basic, $199/mo Pro (includes supplier API and custom dashboard), $499/mo Enterprise.'
  },
  risksAndChallenges: {
    technical: [
      'Building robust semantic mappers for raw financial ledger descriptions (e.g. mapping "Uber Trip" vs "Local Taxi" accurately).'
    ],
    business: [
      'Low initial willingness-to-pay from businesses who do not feel regulatory pressure.'
    ],
    financial: [
      'High client acquisition cost (CAC) through search ads compared to low monthly price.'
    ],
    regulatory: [
      'Constantly evolving carbon accounting metrics (GHG Protocol changes).'
    ]
  },
  score: 84,
  createdAt: '2026-05-02T11:20:00Z'
};

// Initial Business Plan
const INITIAL_BUSINESS_PLAN: BusinessPlan = {
  id: 'bp_ecosphere',
  workspaceId: 'wsp_ecosphere',
  version: 1,
  updatedAt: '2026-05-03T16:40:00Z',
  sections: [
    {
      id: 'sec_1',
      title: 'Executive Summary',
      key: 'executiveSummary',
      content: `EcoSphere AI is a sustainability platform designed to democratize carbon footprint management for SMBs. By integrating directly with accounting ledger systems, cloud providers, and utility dashboards, EcoSphere AI calculates greenhouse gas emissions in real-time, provides action-oriented reduction plans, and facilitates high-quality, verified offsets. Our mission is to accelerate the transition to net-zero by unblocking carbon compliance for the 90% of global businesses that are small and medium enterprises.`
    },
    {
      id: 'sec_2',
      title: 'Problem Statement',
      key: 'problemStatement',
      content: `1. **Scope 3 Compliance Pressure:** Large multinational corporations are forcing their vendor lists (predominantly SMBs) to report carbon emissions or face contract cancellation.\n2. **Prohibitive Consulting Costs:** Hiring external environmental auditors starts at $15,000, which is outside the reach of typical SMB budgets.\n3. **Friction of Manual Data:** The few affordable tools require founders to manual type in mileage, fuel usage, and utility stats, leading to abandonment after 1 month.`
    },
    {
      id: 'sec_3',
      title: 'Proposed Solution',
      key: 'solution',
      content: `EcoSphere AI provides an automated, zero-touch compliance platform:\n- **Instant API Integrations:** Syncs with QuickBooks, Xero, AWS, Azure, Google Cloud, and smart utility meters.\n- **AI carbon engine:** Automatically categorizes ledger transactions into carbon equivalents using LLMs trained on EPA and GHG protocol emission factors.\n- **Exportable Compliance Reports:** Generates PDFs that meet Scope 3 audit requirements in one click.`
    },
    {
      id: 'sec_4',
      title: 'Market Analysis',
      key: 'marketAnalysis',
      content: `The global market for environmental software was valued at $9.3B in 2024 and is projected to reach $24.7B by 2030, growing at a CAGR of 17.6%. SMBs represent 99% of all active businesses. Due to EU CSRD directives and SEC/California rules, Scope 3 reporting is filtering down to hundreds of thousands of vendors. This creates a supply-chain reporting crisis, driving massive demand for automated software solutions.`
    },
    {
      id: 'sec_5',
      title: 'Revenue Model',
      key: 'revenueModel',
      content: `- **Growth Plan ($99/mo):** Up to 5 API integrations, Scope 1 & 2 calculations, standard reports.\n- **Enterprise Pro ($299/mo):** Unlimited API integrations, Scope 3 supplier auditing, custom brand reports.\n- **Offset Commissions (5-8% margin):** Curated market of certified biochar, reforestation, and direct-air-capture carbon offsets built directly into the dashboard.`
    },
    {
      id: 'sec_6',
      title: 'Operational Plan',
      key: 'operationalPlan',
      content: `EcoSphere AI is structured as a software-first organization. Our engineering team will develop core data ingestion pipelines. We will partner with accredited third-party validation registries (Gold Standard, Verra) to source vetted offset project credits. Our customer success team will support accountants who act as resellers to their client bases, creating a highly leveraged distributor sales network.`
    },
    {
      id: 'sec_7',
      title: 'Financial Projections (3-Year Summary)',
      key: 'financialProjections',
      content: `- **Year 1:** 250 active customers | $150k ARR | $20k gross margin | Launch MVP\n- **Year 2:** 1,200 active customers | $1.1M ARR | $350k gross margin | White-label accounting partner launch\n- **Year 3:** 4,800 active customers | $4.8M ARR | $1.9M gross margin | Carbon offset market expansion`
    }
  ]
};

// Initial Brand Kit
const INITIAL_BRAND_KIT: BrandKit = {
  id: 'bk_ecosphere',
  workspaceId: 'wsp_ecosphere',
  nameIdeas: ['EcoSphere AI', 'CarbonLedger', 'NetZeroly', 'AuraEco', 'ScopeZero'],
  taglineIdeas: [
    'Automate your climate action.',
    'Ledger accounting for the planet.',
    'Scope 3 carbon tracking made simple.'
  ],
  mission: 'To empower 1 million businesses to automate, trace, and eliminate their greenhouse gas emissions through intelligent technology.',
  vision: 'A world where climate accounting is as seamless, continuous, and standard as financial accounting.',
  brandStory: 'We started EcoSphere AI when we saw local manufacturers lose contracts because they could not provide carbon disclosure reports to their enterprise buyers. We realized SMBs did not lack the desire to be sustainable; they lacked the resources. We built EcoSphere to bridge that gap.',
  personality: 'Professional, empirical, encouraging, and visionary. We are not activist campaigners; we are pragmatists providing business solutions for climate health.',
  paletteColors: ['#10b981', '#064e3b', '#f8fafc', '#0f172a', '#6366f1'], // Green, Dark Green, Soft White, Dark Navy, Indigo
  values: ['Radical Transparency', 'Data Rigor', 'Simplicity First', 'Empowerment over Guilt'],
  voiceAndTone: 'Empirical, warm, and highly professional. Avoid eco-jargon; focus on clarity, accuracy, and clear business value.'
};

// Initial Website Copy
const INITIAL_WEBSITE_CONTENT: WebsiteContent = {
  id: 'web_ecosphere',
  workspaceId: 'wsp_ecosphere',
  updatedAt: '2026-05-04T12:00:00Z',
  sections: {
    hero: {
      title: 'Automate Your Carbon Compliance. Retain Your Top Customers.',
      subtitle: 'Instantly calculate, report, and reduce your business carbon footprint with AI. Connect your accounting and utility bills to get started in 10 minutes.',
      cta: 'Start Free Assessment'
    },
    features: [
      {
        title: 'Instant Ledgers Sync',
        description: 'Connect with QuickBooks, Xero, or Sage. Our AI automatically maps transactions to verified emission categories.',
        icon: 'Database'
      },
      {
        title: 'Investor-Grade Reports',
        description: 'Export greenhouse gas reports that comply fully with GHG Protocol, CSRD, and Scope 3 supply chain requests.',
        icon: 'FileText'
      },
      {
        title: 'Actionable Reduction Paths',
        description: 'Get tailored recommendations to switch to green web hosts, optimize shipping routes, and cut office utility waste.',
        icon: 'TrendingDown'
      }
    ],
    pricing: [
      {
        name: 'Starter',
        price: '$49/mo',
        features: ['1 User', '3 Integrations', 'Scope 1 & 2 Reporting', 'Email Support']
      },
      {
        name: 'Growth',
        price: '$129/mo',
        features: ['5 Users', 'Unlimited Integrations', 'Scope 3 Supply Chain Base', 'Vetted Offset Access', 'Priority Support']
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['Dedicated Account Manager', 'Custom API Integration', 'Third-Party Auditing Guarantee', 'White-Label Portal']
      }
    ],
    faq: [
      {
        question: 'How does the AI map financial expenses to carbon footprint?',
        answer: 'Our proprietary models parse transaction descriptions (e.g. supplier names, invoice line-items) and cross-reference them against EPA, DEFRA, and ADEME databases to calculate the exact carbon intensity.'
      },
      {
        question: 'Are the reports audited?',
        answer: 'Our calculations adhere strictly to the Greenhouse Gas (GHG) Protocol. In our Growth and Enterprise tiers, we provide third-party validation certificates suitable for compliance audits.'
      }
    ],
    seoMetadata: {
      title: 'Carbon Tracking & Compliance Software for SMBs | EcoSphere AI',
      description: 'Calculate Scope 1, 2, and 3 emissions automatically. Connect QuickBooks, Xero, and AWS to generate investor-grade greenhouse gas reports in 10 minutes.',
      keywords: 'carbon footprint calculator, scope 3 compliance, corporate carbon tracking, green software, carbon offsets, CSRD reporting'
    }
  }
};

// Initial Marketing Strategy
const INITIAL_MARKETING_STRATEGY: MarketingStrategy = {
  id: 'mkt_ecosphere',
  workspaceId: 'wsp_ecosphere',
  gtmLaunchPlan: [
    'Create high-value lead magnet: "Scope 3 Compliance Checklist for B2B Suppliers".',
    'Run webinars focused on CPA and accounting firms to pitch EcoSphere as an add-on service.',
    'Publish localized case studies showing SMBs that successfully retained enterprise contracts using EcoSphere.',
    'Build a free browser carbon calculator for cloud hosting nodes.'
  ],
  acquisitionChannels: [
    { name: 'Organic Search (SEO)', cost: '$2,000/mo', roi: '350%' },
    { name: 'Accounting B2B Resellers', cost: '$500/mo', roi: '600%' },
    { name: 'LinkedIn Search Ads', cost: '$3,500/mo', roi: '120%' },
    { name: 'Cold B2B Outreach to Suppliers', cost: '$800/mo', roi: '180%' }
  ],
  updatedAt: '2026-05-05T09:15:00Z',
  contentCalendar: [
    {
      id: 'post_1',
      platform: 'linkedin',
      postContent: 'Is your company prepared for Scope 3 emissions reporting? Big enterprise buyers are starting to audit their entire supplier base. Those who cannot report compliance risk losing key contracts. Here is how SMBs can adapt without hiring expensive consultants...',
      scheduledDate: '2026-06-01',
      time: '09:00',
      status: 'scheduled'
    },
    {
      id: 'post_2',
      platform: 'twitter',
      postContent: 'Greenwashing is out, empirical data is in. With CSRD and California SB 253 coming into force, spreadsheet carbon reporting is dead. Automate your calculations by connecting your utility smart meters directly. #climateAction #SaaS',
      scheduledDate: '2026-06-03',
      time: '14:30',
      status: 'scheduled'
    },
    {
      id: 'post_3',
      platform: 'linkedin',
      postContent: 'Case Study: How small packaging firm BoxCo saved their $2.5M contracts with retail giants by calculating and disclosing their product carbon intensity in under two weeks. (Spoiler: they did not spend $15k on a consulting auditor). Link to read: ecosphere.ai/case-studies/boxco',
      scheduledDate: '2026-06-05',
      time: '10:00',
      status: 'draft'
    }
  ]
};

// Initial Pitch Deck
const INITIAL_PITCH_DECK: PitchDeck = {
  id: 'pd_ecosphere',
  workspaceId: 'wsp_ecosphere',
  updatedAt: '2026-05-06T15:30:00Z',
  slides: [
    {
      id: 'sld_1',
      slideNumber: 1,
      title: 'EcoSphere AI',
      content: 'Automated Carbon Accounting and Compliance for SMBs',
      points: [
        'Founder presentation deck',
        'Piyush Sakha, Founder & CEO',
        'EcoSphere AI accelerates Net-Zero by democratizing sustainability tech.'
      ]
    },
    {
      id: 'sld_2',
      slideNumber: 2,
      title: 'The Problem',
      content: 'B2B Suppliers are facing a climate disclosure crisis.',
      points: [
        'Enterprise buyers are auditing supplier carbon footprints to meet Scope 3 targets.',
        'Hiring traditional climate auditing consultants costs $15k+ per site.',
        'Manual reporting in spreadsheets is tedious, error-prone, and abandoned in weeks.'
      ]
    },
    {
      id: 'sld_3',
      slideNumber: 3,
      title: 'The Solution',
      content: 'API-driven carbon tracking that integrates in minutes.',
      points: [
        'Instant connections to QuickBooks, Xero, AWS, and local electrical meters.',
        'Automated categorization engine maps dollars to CO2 equivalents.',
        'One-click exporter for audit-ready compliance reporting.'
      ]
    },
    {
      id: 'sld_4',
      slideNumber: 4,
      title: 'Market Size & Opportunity',
      content: 'A massive wave of regulatory requirements is hitting SMBs.',
      points: [
        'TAM: $12.4 Billion global market for B2B carbon accounting software.',
        'Over 140,000 corporate vendors in the US & Europe need reporting in the next 18 months.',
        'EU CSRD and California regulations are legally binding Scope 3 reporting requirements.'
      ]
    },
    {
      id: 'sld_5',
      slideNumber: 5,
      title: 'Business Model',
      content: 'High-margin SaaS coupled with transactional offset fees.',
      points: [
        'Subscription: $79/mo Starter, $199/mo Growth, custom Enterprise packages.',
        'Brokerage: 5-8% fees on certified carbon offset purchases on our marketplace.',
        'Targeting 80% gross margins on subscription software.'
      ]
    },
    {
      id: 'sld_6',
      slideNumber: 6,
      title: 'Go-To-Market (GTM)',
      content: 'Channel partners and content authority.',
      points: [
        'Acquisition via accounting firms (B2B2C) who bundle carbon audits with taxes.',
        'Targeted search campaigns matching "Scope 3 requirements" keywords.',
        'Automated carbon calculator widget as a viral lead generator.'
      ]
    },
    {
      id: 'sld_7',
      slideNumber: 7,
      title: 'Competitors',
      content: 'EcoSphere is built specifically for the mid-market and SMBs.',
      points: [
        'Enterprise tools (Watershed, Sweep) cost $20k+ and require 3-month setup.',
        'EcoSphere matches enterprise data rigor, but with 10-minute automated setup.',
        'Self-serve SaaS model makes pricing affordable for small manufacturers.'
      ]
    },
    {
      id: 'sld_8',
      slideNumber: 8,
      title: 'The Team',
      content: 'Deep domain expertise in climate tech & enterprise scaling.',
      points: [
        'Piyush Sakha (Founder): Former Solutions Engineer at Stripe, carbon ledger contributor.',
        'Advisory board including GHG protocol carbon auditors and SMB accountants.'
      ]
    },
    {
      id: 'sld_9',
      slideNumber: 9,
      title: 'Roadmap & Trajectory',
      content: 'Rapid product growth and capital efficiency.',
      points: [
        'Q1 2026: MVP development & ledger ingestion validation.',
        'Q2 2026: Beta pilot launch with 15 manufacturing vendors.',
        'Q3 2026: White-label portal release for bookkeeping firms.',
        'Q4 2026: Native utility meter integrations & API expansion.'
      ]
    },
    {
      id: 'sld_10',
      slideNumber: 10,
      title: 'The Ask',
      content: 'Raising $750k Pre-Seed to expand engineering and accelerate GTM.',
      points: [
        '65% allocation to core integration engineering.',
        '25% allocation to marketing & reseller program development.',
        '10% operations and legal regulatory compliance.'
      ]
    }
  ]
};

// Initial Chat Session and Messages
const INITIAL_CHAT_SESSIONS: ChatSession[] = [
  {
    id: 'sess_1',
    workspaceId: 'wsp_ecosphere',
    title: 'Acquiring our first 10 customers',
    createdAt: '2026-05-10T11:00:00Z'
  }
];

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    sessionId: 'sess_1',
    sender: 'USER',
    content: 'Hi, I need ideas for acquiring our first 10 B2B manufacturing customers for EcoSphere AI. We have a budget of under $1,000.',
    createdAt: '2026-05-10T11:01:00Z'
  },
  {
    id: 'msg_2',
    sessionId: 'sess_1',
    sender: 'AI',
    content: `Based on your profile for **EcoSphere AI** in Sustainability Tech, here is a targeted customer acquisition strategy for your first 10 customers with a budget of under $1,000:

1. **Leverage the "Vendor Compliance Threat":** 
   Find local B2B manufacturers who supply major retail groups (like Walmart, Target, or Costco). Use LinkedIn Sales Navigator to find operations managers and pitch them directly. Mention that you help them compile standard Scope 3 sheets in under 10 minutes so they don't get deprioritized in vendor reviews.

2. **CPA and Bookkeeping Channel Partnership:**
   Bookkeepers are already managing utility bills and financial ledgers for local manufacturers. Offer 3 local bookkeepers free access to your white-label portal if they audit 2-3 of their clients. This gets you immediate users, trust, and validation with zero advertising spend.

3. **High-converting Lead Magnet:**
   Spend $200 of your budget on a professional graphic designer to create a "Supplier Scope 3 Compliance Checklist" matching the GHG Protocol. Promote this in LinkedIn manufacturing groups. When users download, trigger an automated email offer for a "15-minute free carbon assessment" using EcoSphere AI.

4. **Direct Outreach to Manufacturers in EU/California:**
   California SB 253 and EU CSRD laws legally require Scope 3 tracking starting shortly. Target manufacturers who export to these regions. Since they have immediate regulatory pressure, their conversion rates will be significantly higher than standard domestic SMBs.`,
    createdAt: '2026-05-10T11:02:00Z'
  }
];

// Initial Uploaded Documents
const INITIAL_DOCUMENTS: UploadedDocument[] = [
  {
    id: 'doc_1',
    workspaceId: 'wsp_ecosphere',
    fileName: 'california_sb_253_compliance_standards.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf',
    chunkCount: 142,
    status: 'COMPLETED',
    createdAt: '2026-05-08T09:00:00Z'
  },
  {
    id: 'doc_2',
    workspaceId: 'wsp_ecosphere',
    fileName: 'ghg_protocol_scope_3_calculation_guidelines.docx',
    fileSize: '1.8 MB',
    fileType: 'docx',
    chunkCount: 98,
    status: 'COMPLETED',
    createdAt: '2026-05-09T14:20:00Z'
  }
];

// Initial Activity Logs
const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    workspaceId: 'wsp_ecosphere',
    userName: 'Piyush Sakha',
    userRole: 'FOUNDER',
    action: 'Workspace Created',
    details: 'EcoSphere AI workspace initialized.',
    timestamp: '2026-05-01T10:05:00Z'
  },
  {
    id: 'log_2',
    workspaceId: 'wsp_ecosphere',
    userName: 'Piyush Sakha',
    userRole: 'FOUNDER',
    action: 'Startup Profile Created',
    details: 'Details for EcoSphere AI added to workspace profile.',
    timestamp: '2026-05-01T10:20:00Z'
  },
  {
    id: 'log_3',
    workspaceId: 'wsp_ecosphere',
    userName: 'Piyush Sakha',
    userRole: 'FOUNDER',
    action: 'AI Validation Generated',
    details: 'Startup Idea Validator run for EcoSphere AI. Score: 84.',
    timestamp: '2026-05-02T11:20:00Z'
  },
  {
    id: 'log_4',
    workspaceId: 'wsp_ecosphere',
    userName: 'Sarah Chen',
    userRole: 'TEAM_MEMBER',
    action: 'User Joined Workspace',
    details: 'Joined workspace EcoSphere AI via email invite.',
    timestamp: '2026-05-15T14:30:00Z'
  }
];

// Admin Platform Stats
const INITIAL_STATS: SystemStats = {
  totalUsers: 1420,
  activeWorkspaces: 840,
  totalRevenue: 54300, // Monthly recurring revenue in USD
  tokenUsage: 14250000, // AI tokens consumed this month
  planDistribution: {
    'FREE': 120,
    'PRO': 600,
    'ENTERPRISE': 120
  },
  workspacesList: [
    {
      id: 'wsp_mock_1',
      name: 'Hyperion Logistics',
      industry: 'Logistics',
      activePlan: 'PRO',
      creditsUsed: 5000,
      creditsLimit: 10000,
      userEmail: 'james@hyperion.com',
      createdAt: '2026-05-20'
    }
  ],
  recentSignups: [
    { id: 'usr_reg_1', name: 'James Carter', email: 'james@hyperion.com', role: 'FOUNDER', joined: '2026-05-29' },
    { id: 'usr_reg_2', name: 'Sophia Patel', email: 'spatel@medlink.io', role: 'FOUNDER', joined: '2026-05-29' },
    { id: 'usr_reg_3', name: 'Marcus Vance', email: 'mvance@shiftpay.co', role: 'FOUNDER', joined: '2026-05-28' },
    { id: 'usr_reg_4', name: 'Elena Rostova', email: 'elena@novapower.eu', role: 'FOUNDER', joined: '2026-05-28' }
  ],
  activityLogs: [
    {
      id: 'log_sys_1',
      workspaceId: 'wsp_hyperion',
      userName: 'James Carter',
      userRole: 'FOUNDER',
      action: 'Account Registered',
      details: 'Registered user James Carter with email james@hyperion.com.',
      timestamp: '2026-05-29T21:40:00Z'
    },
    {
      id: 'log_sys_2',
      workspaceId: 'wsp_medlink',
      userName: 'Sophia Patel',
      userRole: 'FOUNDER',
      action: 'Business Plan Generated',
      details: 'Generated complete AI Business Plan for MedLink Healthcare.',
      timestamp: '2026-05-29T20:15:00Z'
    },
    {
      id: 'log_sys_3',
      workspaceId: 'wsp_shiftpay',
      userName: 'Marcus Vance',
      userRole: 'FOUNDER',
      action: 'Subscription Upgraded',
      details: 'Upgraded subscription to ENTERPRISE package ($499/mo).',
      timestamp: '2026-05-28T18:30:00Z'
    }
  ]
};

// Database Initialization Logic
export const initializeDatabase = (force = false): void => {
  if (force || !localStorage.getItem('startupos_db_initialized')) {
    setStorageItem('startupos_users', INITIAL_USERS);
    setStorageItem('startupos_workspaces', INITIAL_WORKSPACES);
    setStorageItem('startupos_profile', INITIAL_STARTUP_PROFILE);
    setStorageItem('startupos_validation', INITIAL_VALIDATION);
    setStorageItem('startupos_business_plan', INITIAL_BUSINESS_PLAN);
    setStorageItem('startupos_brand_kit', INITIAL_BRAND_KIT);
    setStorageItem('startupos_website', INITIAL_WEBSITE_CONTENT);
    setStorageItem('startupos_marketing', INITIAL_MARKETING_STRATEGY);
    setStorageItem('startupos_pitch_deck', INITIAL_PITCH_DECK);
    setStorageItem('startupos_chat_sessions', INITIAL_CHAT_SESSIONS);
    setStorageItem('startupos_chat_messages', INITIAL_CHAT_MESSAGES);
    setStorageItem('startupos_documents', INITIAL_DOCUMENTS);
    setStorageItem('startupos_activity_logs', INITIAL_ACTIVITY_LOGS);
    setStorageItem('startupos_stats', INITIAL_STATS);
    
    // Auth State
    localStorage.setItem('startupos_currentUser', JSON.stringify(INITIAL_USERS[0])); // Default login as Founder
    localStorage.setItem('startupos_currentWorkspace', JSON.stringify(INITIAL_WORKSPACES[0]));
    
    localStorage.setItem('startupos_db_initialized', 'true');
  }
};

// Service Database APIs (simulate delay API responses)
export const apiDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const db = {
  // Authentication & Users
  getCurrentUser: (): User | null => getStorageItem<User | null>('startupos_currentUser', null),
  setCurrentUser: (user: User | null) => {
    localStorage.setItem('startupos_currentUser', user ? JSON.stringify(user) : '');
  },
  getCurrentWorkspace: (): Workspace | null => getStorageItem<Workspace | null>('startupos_currentWorkspace', null),
  setCurrentWorkspace: (workspace: Workspace | null) => {
    localStorage.setItem('startupos_currentWorkspace', workspace ? JSON.stringify(workspace) : '');
  },
  
  getUsers: (): User[] => getStorageItem<User[]>('startupos_users', []),
  saveUser: (user: User) => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) users[index] = user;
    else users.push(user);
    setStorageItem('startupos_users', users);
  },

  // Workspaces
  getWorkspaces: (): Workspace[] => getStorageItem<Workspace[]>('startupos_workspaces', []),
  saveWorkspace: (w: Workspace) => {
    const ws = db.getWorkspaces();
    const index = ws.findIndex(x => x.id === w.id);
    if (index >= 0) ws[index] = w;
    else ws.push(w);
    setStorageItem('startupos_workspaces', ws);
  },

  // Startup Profile
  getProfile: (workspaceId: string): StartupProfile | null => {
    const p = getStorageItem<StartupProfile | null>('startupos_profile', null);
    return (p && p.workspaceId === workspaceId) ? p : null;
  },
  saveProfile: (p: StartupProfile) => {
    setStorageItem('startupos_profile', p);
    db.logActivity(p.workspaceId, 'Profile Updated', `Updated core startup metrics for ${p.name}.`);
  },

  // Idea Validation
  getValidation: (workspaceId: string): IdeaValidationReport | null => {
    const v = getStorageItem<IdeaValidationReport | null>('startupos_validation', null);
    return (v && v.workspaceId === workspaceId) ? v : null;
  },
  saveValidation: (v: IdeaValidationReport) => {
    setStorageItem('startupos_validation', v);
    db.logActivity(v.workspaceId, 'AI Validation Generated', `Generated new validation report. Score: ${v.score}.`);
  },

  // Business Plan
  getBusinessPlan: (workspaceId: string): BusinessPlan | null => {
    const bp = getStorageItem<BusinessPlan | null>('startupos_business_plan', null);
    return (bp && bp.workspaceId === workspaceId) ? bp : null;
  },
  saveBusinessPlan: (bp: BusinessPlan) => {
    setStorageItem('startupos_business_plan', bp);
    db.logActivity(bp.workspaceId, 'Business Plan Saved', `Saved business plan version ${bp.version}.`);
  },

  // Brand Kit
  getBrandKit: (workspaceId: string): BrandKit | null => {
    const bk = getStorageItem<BrandKit | null>('startupos_brand_kit', null);
    return (bk && bk.workspaceId === workspaceId) ? bk : null;
  },
  saveBrandKit: (bk: BrandKit) => {
    setStorageItem('startupos_brand_kit', bk);
    db.logActivity(bk.workspaceId, 'Brand Kit Saved', `Generated or updated branding values and guidelines.`);
  },

  // Website copy
  getWebsiteContent: (workspaceId: string): WebsiteContent | null => {
    const wc = getStorageItem<WebsiteContent | null>('startupos_website', null);
    return (wc && wc.workspaceId === workspaceId) ? wc : null;
  },
  saveWebsiteContent: (wc: WebsiteContent) => {
    setStorageItem('startupos_website', wc);
    db.logActivity(wc.workspaceId, 'Website Copy Saved', `Updated website landing page copy.`);
  },

  // Marketing strategy
  getMarketingStrategy: (workspaceId: string): MarketingStrategy | null => {
    const ms = getStorageItem<MarketingStrategy | null>('startupos_marketing', null);
    return (ms && ms.workspaceId === workspaceId) ? ms : null;
  },
  saveMarketingStrategy: (ms: MarketingStrategy) => {
    setStorageItem('startupos_marketing', ms);
  },

  getContentCalendar: (workspaceId: string): ContentCalendar | null => {
    const cc = getStorageItem<ContentCalendar | null>('startupos_calendar', null);
    return (cc && cc.workspaceId === workspaceId) ? cc : null;
  },
  saveContentCalendar: (cc: ContentCalendar) => {
    setStorageItem('startupos_calendar', cc);
  },

  // Pitch Deck
  getPitchDeck: (workspaceId: string): PitchDeck | null => {
    const pd = getStorageItem<PitchDeck | null>('startupos_pitch_deck', null);
    return (pd && pd.workspaceId === workspaceId) ? pd : null;
  },
  savePitchDeck: (pd: PitchDeck) => {
    setStorageItem('startupos_pitch_deck', pd);
    db.logActivity(pd.workspaceId, 'Pitch Deck Updated', `Updated slides in pitch deck presentation.`);
  },

  // AI Mentor Chat
  getChatSessions: (workspaceId: string): ChatSession[] => {
    const sessions = getStorageItem<ChatSession[]>('startupos_chat_sessions', []);
    return sessions.filter(s => s.workspaceId === workspaceId);
  },
  getChatMessages: (sessionId: string): ChatMessage[] => {
    const messages = getStorageItem<ChatMessage[]>('startupos_chat_messages', []);
    return messages.filter(m => m.sessionId === sessionId);
  },
  saveChatSession: (session: ChatSession) => {
    const sessions = getStorageItem<ChatSession[]>('startupos_chat_sessions', []);
    sessions.unshift(session);
    setStorageItem('startupos_chat_sessions', sessions);
  },
  saveChatMessage: (msg: ChatMessage) => {
    const messages = getStorageItem<ChatMessage[]>('startupos_chat_messages', []);
    messages.push(msg);
    setStorageItem('startupos_chat_messages', messages);
  },

  // Uploaded Documents
  getDocuments: (workspaceId: string): UploadedDocument[] => {
    const docs = getStorageItem<UploadedDocument[]>('startupos_documents', []);
    return docs.filter(d => d.workspaceId === workspaceId);
  },
  saveDocument: (doc: UploadedDocument) => {
    const docs = getStorageItem<UploadedDocument[]>('startupos_documents', []);
    docs.push(doc);
    setStorageItem('startupos_documents', docs);
    db.logActivity(doc.workspaceId, 'Document Uploaded', `Uploaded RAG document: ${doc.fileName}.`);
  },

  // Activity Logging
  getActivityLogs: (workspaceId: string): ActivityLog[] => {
    const logs = getStorageItem<ActivityLog[]>('startupos_activity_logs', []);
    return logs.filter(l => l.workspaceId === workspaceId);
  },
  logActivity: (workspaceId: string, action: string, details: string) => {
    const logs = getStorageItem<ActivityLog[]>('startupos_activity_logs', []);
    const user = db.getCurrentUser();
    const newLog: ActivityLog = {
      id: 'log_' + Math.random().toString(36).substring(2, 11),
      workspaceId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'System',
      userRole: user ? user.role : 'FOUNDER',
      action,
      details,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    setStorageItem('startupos_activity_logs', logs.slice(0, 100)); // Cap at 100 logs
  },

  // Platform Admin Stats
  getStats: (): SystemStats => getStorageItem<SystemStats>('startupos_stats', INITIAL_STATS),
  saveStats: (stats: SystemStats) => setStorageItem('startupos_stats', stats)
};
