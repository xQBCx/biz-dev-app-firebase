import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mwklkamxdlggpusdiohp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13a2xrYW14ZGxnZ3B1c2Rpb2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNzYyODAsImV4cCI6MjA0ODY1MjI4MH0.SE6QGxrFvnpTSgOvRFyL8xOpfb3K04LhJpJxDceuW9U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);