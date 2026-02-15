import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://eoskcsbytaurtqrnuraw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2tjc2J5dGF1cnRxcm51cmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjI2NzYsImV4cCI6MjA3NTEzODY3Nn0.JwJb0PIMCP_2GXqUjamfW98ldHVzT7UisqYoLDND_lc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);