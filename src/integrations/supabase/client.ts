// Single Supabase client for the entire application
// This ensures only one client instance exists to prevent auth lock conflicts

import { supabase } from './supabaseClient';
import type { Database } from './types';

// Re-export the single client instance
export { supabase };

// Re-export types
export type { Database };

// Legacy exports for backward compatibility
export const SUPABASE_URL = "https://flrnlsceusewzphbyugq.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yYXd1dHBmenRzZ2xxa2hxcWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MDAxMjUsImV4cCI6MjA4OTA2MjEyNX0.YOUR_NEW_ANON_KEY_HERE";
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
