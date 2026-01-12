import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MentionEntity {
  id: string;
  entity_type: 'contact' | 'company' | 'user' | 'deal_room' | 'business';
  entity_id: string;
  display_name: string;
  email?: string | null;
  avatar_url?: string | null;
  pinned?: boolean;
  usage_count?: number;
}

interface UseMentionSystemOptions {
  onMention?: (entity: MentionEntity) => void;
  contextType?: 'chat' | 'task' | 'deal_room' | 'note' | 'document' | 'activity';
  contextId?: string;
}

export function useMentionSystem(options: UseMentionSystemOptions = {}) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MentionEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStartPosition, setMentionStartPosition] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Detect @ symbol and extract query
  const detectMention = useCallback((text: string, position: number) => {
    // Find the last @ before cursor
    let atIndex = -1;
    for (let i = position - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atIndex = i;
        break;
      }
      // Stop if we hit a space or newline before finding @
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atIndex >= 0) {
      const mentionQuery = text.substring(atIndex + 1, position);
      // Only trigger if no spaces in the query (still typing the mention)
      if (!mentionQuery.includes(' ') && !mentionQuery.includes('\n')) {
        setMentionStartPosition(atIndex);
        setQuery(mentionQuery);
        setIsOpen(true);
        return;
      }
    }

    setIsOpen(false);
    setMentionStartPosition(-1);
    setQuery("");
  }, []);

  // Search for entities
  const searchEntities = useCallback(async (searchQuery: string) => {
    if (!user) return;

    setIsSearching(true);
    try {
      const results: MentionEntity[] = [];

      // 1. First, get from Prompt Access list (pinned and frequently used)
      const { data: promptAccess } = await supabase
        .from("prompt_access_entities")
        .select("*")
        .eq("user_id", user.id)
        .ilike("display_name", `%${searchQuery}%`)
        .order("pinned", { ascending: false })
        .order("usage_count", { ascending: false })
        .limit(5);

      if (promptAccess) {
        results.push(...promptAccess.map(p => ({
          id: p.id,
          entity_type: p.entity_type as MentionEntity['entity_type'],
          entity_id: p.entity_id,
          display_name: p.display_name,
          email: p.email,
          avatar_url: p.avatar_url,
          pinned: p.pinned || false,
          usage_count: p.usage_count || 0
        })));
      }

      // 2. Search CRM Contacts
      if (searchQuery.length >= 2) {
        const { data: contacts } = await supabase
          .from("crm_contacts")
          .select("id, first_name, last_name, email, avatar_url")
          .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(5);

        if (contacts) {
          for (const c of contacts) {
            const exists = results.find(r => r.entity_type === 'contact' && r.entity_id === c.id);
            if (!exists) {
              results.push({
                id: `contact-${c.id}`,
                entity_type: 'contact',
                entity_id: c.id,
                display_name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'Unknown',
                email: c.email,
                avatar_url: c.avatar_url
              });
            }
          }
        }

        // 3. Search CRM Companies
        const { data: companies } = await supabase
          .from("crm_companies")
          .select("id, name, website, logo_url")
          .ilike("name", `%${searchQuery}%`)
          .limit(5);

        if (companies) {
          for (const c of companies) {
            const exists = results.find(r => r.entity_type === 'company' && r.entity_id === c.id);
            if (!exists) {
              results.push({
                id: `company-${c.id}`,
                entity_type: 'company',
                entity_id: c.id,
                display_name: c.name,
                email: c.website,
                avatar_url: c.logo_url
              });
            }
          }
        }

        // 4. Search Deal Rooms
        const { data: dealRooms } = await supabase
          .from("deal_rooms")
          .select("id, name")
          .ilike("name", `%${searchQuery}%`)
          .limit(3);

        if (dealRooms) {
          for (const dr of dealRooms) {
            const exists = results.find(r => r.entity_type === 'deal_room' && r.entity_id === dr.id);
            if (!exists) {
              results.push({
                id: `deal_room-${dr.id}`,
                entity_type: 'deal_room',
                entity_id: dr.id,
                display_name: dr.name
              });
            }
          }
        }

        // 5. Search Profiles (platform users)
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
          .limit(5);

        if (profiles) {
          for (const p of profiles) {
            const exists = results.find(r => r.entity_type === 'user' && r.entity_id === p.id);
            if (!exists) {
              results.push({
                id: `user-${p.id}`,
                entity_type: 'user',
                entity_id: p.id,
                display_name: p.full_name || p.email || 'Unknown User',
                email: p.email,
                avatar_url: null
              });
            }
          }
        }
      }

      setSuggestions(results.slice(0, 10));
      setSelectedIndex(0);
    } catch (error) {
      console.error("Error searching entities:", error);
    } finally {
      setIsSearching(false);
    }
  }, [user]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (isOpen && query.length >= 0) {
      debounceRef.current = setTimeout(() => {
        searchEntities(query);
      }, 200);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, isOpen, searchEntities]);

  // Select a suggestion
  const selectSuggestion = useCallback(async (entity: MentionEntity) => {
    if (!user) return;

    // Track usage in prompt_access_entities
    try {
      const { data: existing } = await supabase
        .from("prompt_access_entities")
        .select("id, usage_count")
        .eq("user_id", user.id)
        .eq("entity_type", entity.entity_type)
        .eq("entity_id", entity.entity_id)
        .single();

      if (existing) {
        await supabase
          .from("prompt_access_entities")
          .update({
            usage_count: (existing.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("prompt_access_entities")
          .insert({
            user_id: user.id,
            entity_type: entity.entity_type,
            entity_id: entity.entity_id,
            display_name: entity.display_name,
            email: entity.email,
            avatar_url: entity.avatar_url,
            usage_count: 1,
            last_used_at: new Date().toISOString()
          });
      }

      // Log the mention
      if (options.contextType) {
        await supabase.from("entity_mentions").insert({
          mentioned_by: user.id,
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          context_type: options.contextType,
          context_id: options.contextId,
          mention_text: entity.display_name
        });
      }
    } catch (error) {
      console.error("Error tracking mention:", error);
    }

    options.onMention?.(entity);
    setIsOpen(false);
    setQuery("");
    setMentionStartPosition(-1);
  }, [user, options]);

  // Add to prompt access list (pin)
  const addToPromptAccess = useCallback(async (entity: MentionEntity, pinned: boolean = true) => {
    if (!user) return;

    try {
      await supabase
        .from("prompt_access_entities")
        .upsert({
          user_id: user.id,
          entity_type: entity.entity_type,
          entity_id: entity.entity_id,
          display_name: entity.display_name,
          email: entity.email,
          avatar_url: entity.avatar_url,
          pinned
        }, {
          onConflict: 'user_id,entity_type,entity_id'
        });
    } catch (error) {
      console.error("Error adding to prompt access:", error);
    }
  }, [user]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
        return true;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        return true;
      case 'Enter':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
          return true;
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        return true;
      case 'Tab':
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedIndex]);
          return true;
        }
        break;
    }
    return false;
  }, [isOpen, selectedIndex, suggestions, selectSuggestion]);

  // Format mention for display in text
  const formatMention = useCallback((entity: MentionEntity): string => {
    return `@[${entity.display_name}](${entity.entity_type}:${entity.entity_id})`;
  }, []);

  // Parse mentions from text
  const parseMentions = useCallback((text: string): Array<{
    start: number;
    end: number;
    entity_type: string;
    entity_id: string;
    display_name: string;
  }> => {
    const mentions: Array<{
      start: number;
      end: number;
      entity_type: string;
      entity_id: string;
      display_name: string;
    }> = [];
    
    const regex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      mentions.push({
        start: match.index,
        end: match.index + match[0].length,
        display_name: match[1],
        entity_type: match[2],
        entity_id: match[3]
      });
    }
    
    return mentions;
  }, []);

  return {
    isOpen,
    query,
    suggestions,
    isSearching,
    selectedIndex,
    mentionStartPosition,
    cursorPosition,
    setCursorPosition,
    detectMention,
    selectSuggestion,
    addToPromptAccess,
    handleKeyDown,
    formatMention,
    parseMentions,
    setIsOpen
  };
}
