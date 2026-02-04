import { useRef, useState, useCallback, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { MentionSuggestions } from "./MentionSuggestions";
import { useMentionSystem, MentionEntity } from "@/hooks/useMentionSystem";
import { cn } from "@/lib/utils";

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  contextType?: 'chat' | 'task' | 'deal_room' | 'note' | 'document' | 'activity';
  contextId?: string;
  minRows?: number;
}

export function MentionInput({
  value,
  onChange,
  onKeyDown,
  onPaste,
  placeholder,
  className,
  disabled,
  contextType = 'chat',
  contextId,
  minRows = 1
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0 });

  const handleMention = useCallback((entity: MentionEntity) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    
    // Find the @ symbol position
    let atIndex = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (value[i] === '@') {
        atIndex = i;
        break;
      }
    }

    if (atIndex >= 0) {
      // Replace @query with @[Name](type:id)
      const before = value.substring(0, atIndex);
      const after = value.substring(cursorPos);
      const mentionText = `@[${entity.display_name}](${entity.entity_type}:${entity.entity_id}) `;
      const newValue = before + mentionText + after;
      
      onChange(newValue);

      // Set cursor after the mention
      setTimeout(() => {
        const newPos = before.length + mentionText.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }, 0);
    }
  }, [value, onChange]);

  const {
    isOpen,
    suggestions,
    isSearching,
    selectedIndex,
    detectMention,
    selectSuggestion,
    handleKeyDown: mentionKeyDown,
    setIsOpen
  } = useMentionSystem({
    onMention: handleMention,
    contextType,
    contextId
  });

  // Calculate suggestion popup position
  const updatePosition = useCallback(() => {
    if (!textareaRef.current || !containerRef.current) return;

    const textarea = textareaRef.current;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Position below the textarea
    setSuggestionPosition({
      top: textarea.offsetHeight + 4,
      left: 0
    });
  }, []);

  // Handle input changes and detect mentions
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPos = e.target.selectionStart;
    detectMention(newValue, cursorPos);
    updatePosition();
  }, [onChange, detectMention, updatePosition]);

  // Handle cursor position changes
  const handleSelect = useCallback((e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    detectMention(value, target.selectionStart);
    updatePosition();
  }, [value, detectMention, updatePosition]);

  // Handle keyboard events
  const handleKeyDownInternal = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // First, let mention system handle navigation
    if (mentionKeyDown(e)) {
      return;
    }

    // Then, pass to parent handler
    onKeyDown?.(e);
  }, [mentionKeyDown, onKeyDown]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div ref={containerRef} className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onSelect={handleSelect}
        onKeyDown={handleKeyDownInternal}
        onPaste={onPaste}
        placeholder={placeholder}
        className={cn(
          "resize-none",
          minRows === 1 ? "min-h-[44px] max-h-[44px]" : "",
          className
        )}
        disabled={disabled}
        rows={minRows}
      />
      
      {isOpen && (
        <MentionSuggestions
          suggestions={suggestions}
          selectedIndex={selectedIndex}
          isSearching={isSearching}
          onSelect={(entity) => {
            selectSuggestion(entity);
          }}
          position={suggestionPosition}
        />
      )}
    </div>
  );
}
