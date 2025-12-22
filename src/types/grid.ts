/**
 * The Grid: BizDev Productivity Suite
 * 
 * A reimagined productivity ecosystem that learns from you.
 * Each tool has a unique name and is enhanced by user embeddings.
 */

// Grid Tool Identifiers - Our unique naming scheme
export type GridToolId = 
  | 'pulse'        // Email - Your communication heartbeat
  | 'rhythm'       // Calendar - Learn your patterns
  | 'vault'        // Storage - Context-aware files
  | 'scribe'       // Documents - AI co-writing
  | 'matrix'       // Spreadsheets - Pattern recognition
  | 'canvas'       // Presentations - Story-driven
  | 'nexus'        // Notes - Connected knowledge
  | 'sphere'       // Contacts - Relationship intelligence
  | 'momentum'     // Tasks - Priority learning
  | 'flow'         // Automation - Embedding-driven workflows
  | 'sync'         // Communication - Real-time collab
  | 'gather'       // Forms - Intelligent collection
  | 'beacon'       // Announcements - Team broadcasts
  | 'lens'         // Insights - Analytics & learning
  | 'atlas'        // Projects - Journey mapping
  | 'forge'        // App Builder - Create custom tools
  | 'stream'       // Video - Content intelligence
  | 'hub'          // Team Space - Shared environment;

// What the world is missing - our differentiators
export interface GridIntelligence {
  // Learns from user embeddings
  personalizedSuggestions: boolean;
  // Anticipates next actions
  predictiveActions: boolean;
  // Understands relationships between data
  crossToolIntelligence: boolean;
  // Auto-categorizes and organizes
  smartOrganization: boolean;
  // Surfaces relevant content proactively
  contextualSurfacing: boolean;
  // Adapts UI based on usage patterns
  adaptiveInterface: boolean;
}

export interface GridTool {
  id: GridToolId;
  name: string;
  tagline: string;
  description: string;
  icon: string; // Lucide icon name
  category: GridToolCategory;
  status: 'active' | 'coming_soon' | 'beta';
  
  // What makes it different
  differentiators: string[];
  
  // Intelligence features
  intelligence: Partial<GridIntelligence>;
  
  // Integration points
  integrations: GridToolId[];
  
  // Embedding influence - how much this tool learns from user behavior
  embeddingWeight: number;
}

export type GridToolCategory = 
  | 'communication'
  | 'productivity'
  | 'organization'
  | 'automation'
  | 'collaboration'
  | 'intelligence';

// The Grid Registry - All tools defined
export const GRID_TOOLS: Record<GridToolId, GridTool> = {
  pulse: {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'Your communication heartbeat',
    description: 'AI-prioritized email that learns which messages matter most to you. Auto-drafts responses in your voice, surfaces action items, and predicts follow-up needs.',
    icon: 'Zap',
    category: 'communication',
    status: 'active',
    differentiators: [
      'Priority scoring based on your relationship graph',
      'Auto-detection of commitments and deadlines',
      'Smart threading that follows conversations across channels',
      'Response drafts that match your communication style'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      crossToolIntelligence: true,
    },
    integrations: ['sphere', 'momentum', 'rhythm'],
    embeddingWeight: 0.9,
  },
  
  rhythm: {
    id: 'rhythm',
    name: 'Rhythm',
    tagline: 'Learns your patterns, protects your time',
    description: 'Calendar that understands your energy levels, meeting preferences, and optimal work blocks. Auto-suggests best times and defends your focus periods.',
    icon: 'Clock',
    category: 'organization',
    status: 'active',
    differentiators: [
      'Energy-aware scheduling based on your patterns',
      'Auto-blocking focus time based on task deadlines',
      'Smart conflict resolution with priority scoring',
      'Meeting prep materials auto-surfaced'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      adaptiveInterface: true,
    },
    integrations: ['pulse', 'momentum', 'sphere'],
    embeddingWeight: 0.85,
  },
  
  vault: {
    id: 'vault',
    name: 'Vault',
    tagline: 'Context-aware file intelligence',
    description: 'Storage that organizes itself. Files are automatically tagged, related, and surfaced when contextually relevant. Never search for a file again.',
    icon: 'FolderLock',
    category: 'organization',
    status: 'active',
    differentiators: [
      'Auto-tagging based on content and usage patterns',
      'Relationship mapping between files and projects',
      'Proactive surfacing during relevant tasks',
      'Version intelligence with change summaries'
    ],
    intelligence: {
      smartOrganization: true,
      contextualSurfacing: true,
      crossToolIntelligence: true,
    },
    integrations: ['scribe', 'matrix', 'atlas'],
    embeddingWeight: 0.7,
  },
  
  scribe: {
    id: 'scribe',
    name: 'Scribe',
    tagline: 'AI co-writing with your voice',
    description: 'Documents that write themselves. Learns your style, suggests content, and helps you communicate with consistency and clarity.',
    icon: 'PenTool',
    category: 'productivity',
    status: 'active',
    differentiators: [
      'Style learning from your existing documents',
      'Template intelligence that adapts to context',
      'Real-time collaboration with AI suggestions',
      'Auto-formatting based on document type'
    ],
    intelligence: {
      personalizedSuggestions: true,
      adaptiveInterface: true,
    },
    integrations: ['vault', 'pulse', 'nexus'],
    embeddingWeight: 0.8,
  },
  
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    tagline: 'Pattern recognition in your data',
    description: 'Spreadsheets that see what you miss. Auto-detects patterns, suggests formulas, and generates insights from your data without you asking.',
    icon: 'Grid3X3',
    category: 'productivity',
    status: 'active',
    differentiators: [
      'Automatic pattern detection and alerting',
      'Natural language formula generation',
      'Cross-sheet intelligence and linking',
      'Predictive data filling based on patterns'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      crossToolIntelligence: true,
    },
    integrations: ['lens', 'vault', 'flow'],
    embeddingWeight: 0.75,
  },
  
  canvas: {
    id: 'canvas',
    name: 'Canvas',
    tagline: 'Story-driven presentations',
    description: 'Presentations that tell your story. AI-assisted design, narrative flow suggestions, and automatic data visualization integration.',
    icon: 'Presentation',
    category: 'productivity',
    status: 'active',
    differentiators: [
      'Narrative arc suggestions for better storytelling',
      'Auto-design based on content and audience',
      'Live data connections that update visuals',
      'Audience-adaptive content recommendations'
    ],
    intelligence: {
      personalizedSuggestions: true,
      adaptiveInterface: true,
    },
    integrations: ['matrix', 'scribe', 'vault'],
    embeddingWeight: 0.65,
  },
  
  nexus: {
    id: 'nexus',
    name: 'Nexus',
    tagline: 'Connected knowledge base',
    description: 'Notes that link themselves. Every note understands its relationship to your other knowledge, surfacing connections you never knew existed.',
    icon: 'Network',
    category: 'organization',
    status: 'active',
    differentiators: [
      'Auto-linking between related concepts',
      'Knowledge graph visualization',
      'Smart tagging based on content analysis',
      'Recall assistance during relevant tasks'
    ],
    intelligence: {
      smartOrganization: true,
      contextualSurfacing: true,
      crossToolIntelligence: true,
    },
    integrations: ['scribe', 'momentum', 'lens'],
    embeddingWeight: 0.85,
  },
  
  sphere: {
    id: 'sphere',
    name: 'Sphere',
    tagline: 'Relationship intelligence',
    description: 'Contacts that understand relationships. Not just who you know, but how you know them, when to reach out, and what matters to each connection.',
    icon: 'Users',
    category: 'communication',
    status: 'active',
    differentiators: [
      'Relationship strength scoring and trends',
      'Optimal outreach timing suggestions',
      'Conversation history across all channels',
      'Mutual connection intelligence'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      crossToolIntelligence: true,
    },
    integrations: ['pulse', 'rhythm', 'sync'],
    embeddingWeight: 0.95,
  },
  
  momentum: {
    id: 'momentum',
    name: 'Momentum',
    tagline: 'Priority learning task engine',
    description: 'Tasks that prioritize themselves. Learns what truly matters to you, auto-schedules based on deadlines and energy, and adapts as priorities shift.',
    icon: 'Target',
    category: 'organization',
    status: 'active',
    differentiators: [
      'Priority learning from your completion patterns',
      'Energy-aware task scheduling',
      'Automatic deadline detection from communications',
      'Progress momentum visualization and gamification'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      adaptiveInterface: true,
    },
    integrations: ['rhythm', 'pulse', 'atlas'],
    embeddingWeight: 0.9,
  },
  
  flow: {
    id: 'flow',
    name: 'Flow',
    tagline: 'Embedding-driven automation',
    description: 'Workflows that design themselves. Based on your behavioral patterns, Flow suggests and creates automations that save hours without you configuring them.',
    icon: 'Workflow',
    category: 'automation',
    status: 'active',
    differentiators: [
      'Pattern-detected automation suggestions',
      'Natural language workflow creation',
      'Cross-tool orchestration',
      'Learning from manual repetitive actions'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
      crossToolIntelligence: true,
      smartOrganization: true,
    },
    integrations: ['pulse', 'momentum', 'matrix'],
    embeddingWeight: 0.95,
  },
  
  sync: {
    id: 'sync',
    name: 'Sync',
    tagline: 'Relationship-aware communication',
    description: 'Real-time collaboration that understands context. Conversations are organized by project, person, and priority - not just chronology.',
    icon: 'MessageCircle',
    category: 'collaboration',
    status: 'active',
    differentiators: [
      'Context-threaded conversations',
      'Relationship-aware message prioritization',
      'Meeting intelligence with action item extraction',
      'Cross-platform message unification'
    ],
    intelligence: {
      personalizedSuggestions: true,
      crossToolIntelligence: true,
      contextualSurfacing: true,
    },
    integrations: ['sphere', 'pulse', 'rhythm'],
    embeddingWeight: 0.8,
  },
  
  gather: {
    id: 'gather',
    name: 'Gather',
    tagline: 'Intelligent data collection',
    description: 'Forms that adapt. Questions adjust based on previous answers, suggested fields are smart-populated, and responses auto-flow into relevant systems.',
    icon: 'ClipboardList',
    category: 'automation',
    status: 'active',
    differentiators: [
      'Dynamic form logic based on response patterns',
      'Auto-population from existing data',
      'Response-triggered workflow initiation',
      'Smart field suggestions based on form type'
    ],
    intelligence: {
      personalizedSuggestions: true,
      smartOrganization: true,
    },
    integrations: ['flow', 'sphere', 'matrix'],
    embeddingWeight: 0.6,
  },
  
  beacon: {
    id: 'beacon',
    name: 'Beacon',
    tagline: 'Team broadcasts that resonate',
    description: 'Announcements that reach the right people. Intelligent routing, engagement tracking, and optimal timing for maximum visibility.',
    icon: 'Radio',
    category: 'communication',
    status: 'active',
    differentiators: [
      'Audience segmentation intelligence',
      'Optimal send-time prediction',
      'Engagement analytics and re-targeting',
      'Multi-channel distribution'
    ],
    intelligence: {
      personalizedSuggestions: true,
      predictiveActions: true,
    },
    integrations: ['sync', 'sphere', 'lens'],
    embeddingWeight: 0.5,
  },
  
  lens: {
    id: 'lens',
    name: 'Lens',
    tagline: 'Insights from everywhere',
    description: 'Analytics that tell the story. Cross-tool intelligence that surfaces what matters, predicts trends, and recommends actions.',
    icon: 'Eye',
    category: 'intelligence',
    status: 'active',
    differentiators: [
      'Cross-tool correlation discovery',
      'Anomaly detection and alerting',
      'Natural language insight queries',
      'Predictive trend analysis'
    ],
    intelligence: {
      crossToolIntelligence: true,
      contextualSurfacing: true,
      personalizedSuggestions: true,
    },
    integrations: ['matrix', 'momentum', 'sphere'],
    embeddingWeight: 0.85,
  },
  
  atlas: {
    id: 'atlas',
    name: 'Atlas',
    tagline: 'Journey mapping for projects',
    description: 'Project management that sees the whole picture. Visualizes dependencies, predicts bottlenecks, and adapts plans based on team patterns.',
    icon: 'Map',
    category: 'organization',
    status: 'active',
    differentiators: [
      'Dependency visualization and bottleneck prediction',
      'Team capacity learning and optimization',
      'Milestone risk assessment',
      'Cross-project resource intelligence'
    ],
    intelligence: {
      predictiveActions: true,
      crossToolIntelligence: true,
      adaptiveInterface: true,
    },
    integrations: ['momentum', 'rhythm', 'lens'],
    embeddingWeight: 0.8,
  },
  
  forge: {
    id: 'forge',
    name: 'Forge',
    tagline: 'Create custom tools',
    description: 'Build the tools your team needs. Low-code creator that understands your patterns and suggests app structures before you design them.',
    icon: 'Hammer',
    category: 'automation',
    status: 'beta',
    differentiators: [
      'Pattern-based app suggestions',
      'Template generation from existing workflows',
      'Natural language app creation',
      'Cross-tool integration builder'
    ],
    intelligence: {
      personalizedSuggestions: true,
      crossToolIntelligence: true,
    },
    integrations: ['flow', 'matrix', 'gather'],
    embeddingWeight: 0.7,
  },
  
  stream: {
    id: 'stream',
    name: 'Stream',
    tagline: 'Content intelligence',
    description: 'Video and media that work for you. Auto-transcription, key moment detection, and intelligent search across all your content.',
    icon: 'Video',
    category: 'collaboration',
    status: 'active',
    differentiators: [
      'Automatic key moment detection',
      'Cross-video topic threading',
      'Smart clip generation for sharing',
      'Meeting summary extraction'
    ],
    intelligence: {
      smartOrganization: true,
      contextualSurfacing: true,
    },
    integrations: ['sync', 'nexus', 'vault'],
    embeddingWeight: 0.6,
  },
  
  hub: {
    id: 'hub',
    name: 'Hub',
    tagline: 'Shared team environment',
    description: 'Team space that organizes itself. All your team knowledge, conversations, and work in one place that adapts to how you work together.',
    icon: 'Home',
    category: 'collaboration',
    status: 'active',
    differentiators: [
      'Auto-organized team knowledge base',
      'Activity-aware content surfacing',
      'Role-based view customization',
      'Cross-team collaboration intelligence'
    ],
    intelligence: {
      smartOrganization: true,
      adaptiveInterface: true,
      contextualSurfacing: true,
    },
    integrations: ['nexus', 'sync', 'vault'],
    embeddingWeight: 0.75,
  },
};

// Get tools by category
export function getToolsByCategory(category: GridToolCategory): GridTool[] {
  return Object.values(GRID_TOOLS).filter(tool => tool.category === category);
}

// Get active tools only
export function getActiveTools(): GridTool[] {
  return Object.values(GRID_TOOLS).filter(tool => tool.status === 'active');
}

// Get tools that integrate with a specific tool
export function getIntegratedTools(toolId: GridToolId): GridTool[] {
  return GRID_TOOLS[toolId]?.integrations.map(id => GRID_TOOLS[id]) || [];
}

// User's Grid preferences and state
export interface UserGridState {
  enabledTools: GridToolId[];
  favoriteTools: GridToolId[];
  toolSettings: Partial<Record<GridToolId, Record<string, unknown>>>;
  lastUsedTool: GridToolId | null;
  lastUsedAt: Record<GridToolId, string>;
}

// Embedding-driven suggestions
export interface GridSuggestion {
  type: 'action' | 'tool' | 'connection' | 'workflow';
  priority: number;
  toolId?: GridToolId;
  title: string;
  description: string;
  actionLabel: string;
  confidence: number;
  context?: Record<string, unknown>;
}
