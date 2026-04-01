import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Get environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://flrnlsceusewzphbyugq.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZscm5sc2NldXNld3pwaGJ5dWdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0ODQ3MTUsImV4cCI6MjA4OTA2MDcxNX0.iCEJaZNdvgvzUzxfLEU-8UfLdX9c-3COF06YHnSmrfI";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create a single Supabase client instance for the entire application
// This prevents multiple client instances from causing auth lock conflicts
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Export types for convenience
export type { Database } from './types';
export type { Database } from './types';