import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface RecipientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RecipientSearchInput = ({ 
  value, 
  onChange, 
  placeholder = "recipient@example.com" 
}: RecipientSearchInputProps) => {
  const [open, setOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length < 2) {
      setSearchResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .or(`full_name.ilike.%${value}%,email.ilike.%${value}%`)
          .limit(10);

        if (error) {
          console.error("Error searching profiles:", error);
          return;
        }

        // Map to Profile type with null avatar_url
        const profiles: Profile[] = (data || []).map(p => ({
          ...p,
          avatar_url: null
        }));
        setSearchResults(profiles);
        if (profiles.length > 0) {
          setOpen(true);
        }
      } catch (error) {
        console.error("Error searching profiles:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const handleSelect = (profile: Profile) => {
    onChange(profile.email || "");
    setOpen(false);
    setSearchResults([]);
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => {
              if (searchResults.length > 0) {
                setOpen(true);
              }
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {isSearching ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : searchResults.length === 0 ? (
              <CommandEmpty>No contacts found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {searchResults.map((profile) => (
                  <CommandItem
                    key={profile.id}
                    value={profile.email || profile.id}
                    onSelect={() => handleSelect(profile)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(profile.full_name, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">
                        {profile.full_name || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {profile.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
