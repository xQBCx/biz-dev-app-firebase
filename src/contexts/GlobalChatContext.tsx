import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type PageContext = {
  module: string;
  entityType?: string;
  entityId?: string;
  pageTitle?: string;
};

type GlobalChatContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearMessages: () => void;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  currentContext: PageContext;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const GlobalChatContext = createContext<GlobalChatContextType | undefined>(undefined);

// Route to module mapping for context detection
const routeToModule: Record<string, string> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/crm': 'crm',
  '/crm/contacts': 'crm',
  '/crm/companies': 'crm',
  '/crm/deals': 'crm',
  '/initiatives': 'initiatives',
  '/initiative-architect': 'initiatives',
  '/deal-rooms': 'deal_rooms',
  '/proposals': 'proposals',
  '/tasks': 'tasks',
  '/calendar': 'calendar',
  '/messages': 'messages',
  '/research-studio': 'research',
  '/xevents': 'events',
  '/portfolio': 'portfolio',
  '/eros': 'eros',
  '/workforce': 'workforce',
  '/capital-formation': 'capital',
  '/directory': 'directory',
  '/funding': 'funding',
  '/integrations': 'integrations',
  '/workflows': 'workflows',
  '/clients': 'clients',
};

function getContextFromPath(pathname: string): PageContext {
  // Check exact match first
  if (routeToModule[pathname]) {
    return { module: routeToModule[pathname] };
  }
  
  // Check for dynamic routes
  const pathParts = pathname.split('/');
  
  if (pathParts[1] === 'crm' && pathParts[2] === 'companies' && pathParts[3]) {
    return { module: 'crm', entityType: 'company', entityId: pathParts[3] };
  }
  if (pathParts[1] === 'crm' && pathParts[2] === 'contacts' && pathParts[3]) {
    return { module: 'crm', entityType: 'contact', entityId: pathParts[3] };
  }
  if (pathParts[1] === 'crm' && pathParts[2] === 'deals' && pathParts[3]) {
    return { module: 'crm', entityType: 'deal', entityId: pathParts[3] };
  }
  if (pathParts[1] === 'initiatives' && pathParts[2]) {
    return { module: 'initiatives', entityType: 'initiative', entityId: pathParts[2] };
  }
  if (pathParts[1] === 'deal-rooms' && pathParts[2]) {
    return { module: 'deal_rooms', entityType: 'deal_room', entityId: pathParts[2] };
  }
  if (pathParts[1] === 'proposals' && pathParts[2]) {
    return { module: 'proposals', entityType: 'proposal', entityId: pathParts[2] };
  }
  if (pathParts[1] === 'xevents' && pathParts[2]) {
    return { module: 'events', entityType: 'event', entityId: pathParts[2] };
  }
  
  // Check prefix match
  for (const [route, module] of Object.entries(routeToModule)) {
    if (pathname.startsWith(route) && route !== '/') {
      return { module };
    }
  }
  
  return { module: 'general' };
}

export function GlobalChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastEntityId, setLastEntityId] = useState<string | undefined>(undefined);
  const location = useLocation();
  
  const currentContext = getContextFromPath(location.pathname);

  // Clear messages when navigating to a different entity (e.g., different initiative)
  useEffect(() => {
    if (currentContext.entityId && currentContext.entityId !== lastEntityId) {
      setMessages([]);
      setConversationId(null);
      setLastEntityId(currentContext.entityId);
    } else if (!currentContext.entityId && lastEntityId) {
      // Navigated away from an entity page
      setLastEntityId(undefined);
    }
  }, [currentContext.entityId, lastEntityId]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'>) => {
    setMessages(prev => [...prev, { ...message, id: crypto.randomUUID() }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  return (
    <GlobalChatContext.Provider value={{
      isOpen,
      setIsOpen,
      isExpanded,
      setIsExpanded,
      messages,
      addMessage,
      clearMessages,
      conversationId,
      setConversationId,
      currentContext,
      isLoading,
      setIsLoading,
    }}>
      {children}
    </GlobalChatContext.Provider>
  );
}

export function useGlobalChat() {
  const context = useContext(GlobalChatContext);
  if (!context) {
    throw new Error('useGlobalChat must be used within a GlobalChatProvider');
  }
  return context;
}
