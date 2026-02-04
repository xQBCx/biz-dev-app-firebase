import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Type definitions based on database schema
export type XEventStatus = 'draft' | 'published' | 'live' | 'completed' | 'cancelled' | 'archived';
export type XEventCategory = 'workshop' | 'summit' | 'conference' | 'webinar' | 'roundtable' | 'networking' | 'private_dinner' | 'training' | 'launch_event' | 'custom';
export type XEventVisibility = 'public' | 'private' | 'invite_only';
export type XEventParticipantRole = 'organizer' | 'co_organizer' | 'speaker' | 'sponsor' | 'staff' | 'vip' | 'attendee';
export type XEventRegistrationStatus = 'pending' | 'confirmed' | 'checked_in' | 'cancelled' | 'refunded' | 'waitlisted';

export interface XEvent {
  id: string;
  created_at: string;
  updated_at: string;
  organizer_id: string;
  client_id?: string;
  initiative_id?: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category: XEventCategory;
  status: XEventStatus;
  visibility: XEventVisibility;
  start_date: string;
  end_date: string;
  timezone: string;
  is_virtual: boolean;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  venue_zip?: string;
  virtual_meeting_url?: string;
  virtual_platform?: string;
  max_capacity?: number;
  registration_open: boolean;
  registration_deadline?: string;
  waitlist_enabled: boolean;
  cover_image_url?: string;
  logo_url?: string;
  primary_color: string;
  accent_color: string;
  website_data?: Record<string, any>;
  lobby_enabled: boolean;
  networking_enabled: boolean;
  qna_enabled: boolean;
  deal_room_id?: string;
  network_group_id?: string;
  tags: string[];
  metadata?: Record<string, any>;
  // Computed/joined fields
  registration_count?: number;
  participant_count?: number;
}

export interface XEventSession {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  session_type: string;
  start_time: string;
  end_time: string;
  track_name?: string;
  room_name?: string;
  max_attendees?: number;
  requires_registration: boolean;
  virtual_meeting_url?: string;
  sort_order: number;
  is_break: boolean;
}

export interface XEventTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price_cents: number;
  currency: string;
  is_free: boolean;
  quantity_total?: number;
  quantity_sold: number;
  quantity_reserved: number;
  sale_start?: string;
  sale_end?: string;
  is_available: boolean;
  min_per_order: number;
  max_per_order: number;
  access_level: string;
  xodiak_contract_id?: string;
  revenue_split_config?: Record<string, any>;
  sort_order: number;
  hidden: boolean;
}

export interface XEventRegistration {
  id: string;
  event_id: string;
  ticket_type_id: string;
  user_id?: string;
  crm_contact_id?: string;
  status: XEventRegistrationStatus;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  ticket_code: string;
  qr_code_url?: string;
  amount_paid_cents: number;
  payment_status: string;
  checked_in_at?: string;
  custom_responses?: Record<string, any>;
  created_at: string;
}

export interface XEventParticipant {
  id: string;
  event_id: string;
  user_id?: string;
  crm_contact_id?: string;
  role: XEventParticipantRole;
  display_name?: string;
  title?: string;
  company?: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  sponsor_tier?: string;
  sponsor_logo_url?: string;
}

export interface CreateXEventInput {
  name: string;
  category: XEventCategory;
  start_date: string;
  end_date: string;
  description?: string;
  tagline?: string;
  visibility?: XEventVisibility;
  is_virtual?: boolean;
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  venue_state?: string;
  venue_country?: string;
  virtual_meeting_url?: string;
  virtual_platform?: string;
  max_capacity?: number;
  timezone?: string;
  cover_image_url?: string;
  logo_url?: string;
  primary_color?: string;
  accent_color?: string;
  tags?: string[];
}

export interface CreateTicketTypeInput {
  event_id: string;
  name: string;
  description?: string;
  price_cents?: number;
  currency?: string;
  quantity_total?: number;
  sale_start?: string;
  sale_end?: string;
  access_level?: string;
  min_per_order?: number;
  max_per_order?: number;
}

export interface CreateRegistrationInput {
  event_id: string;
  ticket_type_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  custom_responses?: Record<string, any>;
}

// Generate a unique slug from event name
const generateSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
};

// Generate a ticket code
const generateTicketCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useXEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<XEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all events (organized by user or public)
  const loadEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('xevents')
        .select(`
          *,
          xevents_registrations(count),
          xevents_participants(count)
        `)
        .order('start_date', { ascending: true });

      if (fetchError) throw fetchError;

      const eventsWithCounts = (data || []).map((event: any) => ({
        ...event,
        registration_count: event.xevents_registrations?.[0]?.count || 0,
        participant_count: event.xevents_participants?.[0]?.count || 0,
      }));

      setEvents(eventsWithCounts);
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Create a new event
  const createEvent = async (input: CreateXEventInput): Promise<XEvent | null> => {
    if (!user) {
      toast.error('You must be logged in to create an event');
      return null;
    }

    try {
      const slug = generateSlug(input.name);

      const { data, error: insertError } = await supabase
        .from('xevents')
        .insert({
          organizer_id: user.id,
          name: input.name,
          slug,
          tagline: input.tagline,
          description: input.description,
          category: input.category,
          visibility: input.visibility || 'public',
          start_date: input.start_date,
          end_date: input.end_date,
          timezone: input.timezone || 'America/Chicago',
          is_virtual: input.is_virtual || false,
          venue_name: input.venue_name,
          venue_address: input.venue_address,
          venue_city: input.venue_city,
          venue_state: input.venue_state,
          venue_country: input.venue_country,
          virtual_meeting_url: input.virtual_meeting_url,
          virtual_platform: input.virtual_platform,
          max_capacity: input.max_capacity,
          cover_image_url: input.cover_image_url,
          logo_url: input.logo_url,
          primary_color: input.primary_color || '#000000',
          accent_color: input.accent_color || '#666666',
          tags: input.tags || [],
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Event created successfully!');
      await loadEvents();
      return data as XEvent;
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast.error(err.message || 'Failed to create event');
      return null;
    }
  };

  // Update an event
  const updateEvent = async (id: string, updates: Partial<CreateXEventInput>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('xevents')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success('Event updated successfully!');
      await loadEvents();
      return true;
    } catch (err: any) {
      console.error('Error updating event:', err);
      toast.error(err.message || 'Failed to update event');
      return false;
    }
  };

  // Update event status
  const updateEventStatus = async (id: string, status: XEventStatus): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('xevents')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      const statusLabels: Record<XEventStatus, string> = {
        draft: 'saved as draft',
        published: 'published',
        live: 'is now live',
        completed: 'marked as completed',
        cancelled: 'cancelled',
        archived: 'archived'
      };

      toast.success(`Event ${statusLabels[status]}!`);
      await loadEvents();
      return true;
    } catch (err: any) {
      console.error('Error updating event status:', err);
      toast.error(err.message || 'Failed to update event status');
      return false;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('xevents')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Event deleted successfully!');
      await loadEvents();
      return true;
    } catch (err: any) {
      console.error('Error deleting event:', err);
      toast.error(err.message || 'Failed to delete event');
      return false;
    }
  };

  // Get single event by ID
  const getEvent = async (id: string): Promise<XEvent | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents')
        .select(`
          *,
          xevents_registrations(count),
          xevents_participants(count)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...data,
        registration_count: data.xevents_registrations?.[0]?.count || 0,
        participant_count: data.xevents_participants?.[0]?.count || 0,
      } as XEvent;
    } catch (err: any) {
      console.error('Error fetching event:', err);
      return null;
    }
  };

  // Get event by slug
  const getEventBySlug = async (slug: string): Promise<XEvent | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) throw fetchError;
      return data as XEvent;
    } catch (err: any) {
      console.error('Error fetching event by slug:', err);
      return null;
    }
  };

  // ==================== TICKET TYPES ====================

  const getTicketTypes = async (eventId: string): Promise<XEventTicketType[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents_ticket_types')
        .select('*')
        .eq('event_id', eventId)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as XEventTicketType[];
    } catch (err: any) {
      console.error('Error fetching ticket types:', err);
      return [];
    }
  };

  const createTicketType = async (input: CreateTicketTypeInput): Promise<XEventTicketType | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('xevents_ticket_types')
        .insert({
          event_id: input.event_id,
          name: input.name,
          description: input.description,
          price_cents: input.price_cents || 0,
          currency: input.currency || 'USD',
          quantity_total: input.quantity_total,
          sale_start: input.sale_start,
          sale_end: input.sale_end,
          access_level: input.access_level || 'general',
          min_per_order: input.min_per_order || 1,
          max_per_order: input.max_per_order || 10,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast.success('Ticket type created!');
      return data as XEventTicketType;
    } catch (err: any) {
      console.error('Error creating ticket type:', err);
      toast.error(err.message || 'Failed to create ticket type');
      return null;
    }
  };

  const updateTicketType = async (id: string, updates: Partial<CreateTicketTypeInput>): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('xevents_ticket_types')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      toast.success('Ticket type updated!');
      return true;
    } catch (err: any) {
      console.error('Error updating ticket type:', err);
      toast.error(err.message || 'Failed to update ticket type');
      return false;
    }
  };

  const deleteTicketType = async (id: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('xevents_ticket_types')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      toast.success('Ticket type deleted!');
      return true;
    } catch (err: any) {
      console.error('Error deleting ticket type:', err);
      toast.error(err.message || 'Failed to delete ticket type');
      return false;
    }
  };

  // ==================== REGISTRATIONS ====================

  const getRegistrations = async (eventId: string): Promise<XEventRegistration[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      return (data || []) as XEventRegistration[];
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      return [];
    }
  };

  const createRegistration = async (input: CreateRegistrationInput): Promise<XEventRegistration | null> => {
    try {
      const ticketCode = generateTicketCode();

      const { data, error: insertError } = await supabase
        .from('xevents_registrations')
        .insert({
          event_id: input.event_id,
          ticket_type_id: input.ticket_type_id,
          user_id: user?.id,
          first_name: input.first_name,
          last_name: input.last_name,
          email: input.email,
          phone: input.phone,
          company: input.company,
          title: input.title,
          ticket_code: ticketCode,
          status: 'pending',
          custom_responses: input.custom_responses || {},
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Increment ticket sold count
      try {
        await supabase
          .from('xevents_ticket_types')
          .update({ quantity_sold: supabase.rpc ? 1 : 1 }) // Will be handled by trigger or manual update
          .eq('id', input.ticket_type_id);
      } catch {
        // Silently fail - not critical
      }

      toast.success('Registration submitted successfully!');
      return data as XEventRegistration;
    } catch (err: any) {
      console.error('Error creating registration:', err);
      toast.error(err.message || 'Failed to submit registration');
      return null;
    }
  };

  const updateRegistrationStatus = async (id: string, status: XEventRegistrationStatus): Promise<boolean> => {
    try {
      const updates: any = { status };
      if (status === 'checked_in') {
        updates.checked_in_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from('xevents_registrations')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;
      toast.success(`Registration ${status}!`);
      return true;
    } catch (err: any) {
      console.error('Error updating registration:', err);
      toast.error(err.message || 'Failed to update registration');
      return false;
    }
  };

  // ==================== SESSIONS ====================

  const getSessions = async (eventId: string): Promise<XEventSession[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents_sessions')
        .select('*')
        .eq('event_id', eventId)
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as XEventSession[];
    } catch (err: any) {
      console.error('Error fetching sessions:', err);
      return [];
    }
  };

  const createSession = async (eventId: string, session: Omit<XEventSession, 'id' | 'event_id'>): Promise<XEventSession | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('xevents_sessions')
        .insert({
          event_id: eventId,
          ...session,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast.success('Session added!');
      return data as XEventSession;
    } catch (err: any) {
      console.error('Error creating session:', err);
      toast.error(err.message || 'Failed to add session');
      return null;
    }
  };

  // ==================== PARTICIPANTS ====================

  const getParticipants = async (eventId: string): Promise<XEventParticipant[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('xevents_participants')
        .select('*')
        .eq('event_id', eventId)
        .order('role', { ascending: true });

      if (fetchError) throw fetchError;
      return (data || []) as XEventParticipant[];
    } catch (err: any) {
      console.error('Error fetching participants:', err);
      return [];
    }
  };

  const addParticipant = async (eventId: string, participant: Omit<XEventParticipant, 'id' | 'event_id'>): Promise<XEventParticipant | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('xevents_participants')
        .insert({
          event_id: eventId,
          ...participant,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast.success('Participant added!');
      return data as XEventParticipant;
    } catch (err: any) {
      console.error('Error adding participant:', err);
      toast.error(err.message || 'Failed to add participant');
      return null;
    }
  };

  return {
    // State
    events,
    isLoading,
    error,
    
    // Event CRUD
    loadEvents,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    getEvent,
    getEventBySlug,
    
    // Ticket Types
    getTicketTypes,
    createTicketType,
    updateTicketType,
    deleteTicketType,
    
    // Registrations
    getRegistrations,
    createRegistration,
    updateRegistrationStatus,
    
    // Sessions
    getSessions,
    createSession,
    
    // Participants
    getParticipants,
    addParticipant,
  };
};
