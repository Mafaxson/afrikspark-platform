import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  signOutImmediate: () => void;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAdmin: false,
  isApproved: false,
  loading: true,
  signOut: async () => {},
  signOutImmediate: () => {},
  signIn: async () => ({}),
  signUp: async () => ({}),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasInitializedAuth = useRef(false);

  useEffect(() => {
    let mounted = true;

    // Function to load user roles and profile
    const loadUserState = async (currentUser: User | null) => {
      if (!currentUser) {
        if (mounted) {
          setIsAdmin(false);
          setIsApproved(false);
        }
        return;
      }

      try {
        // Load roles and profile in parallel
        const [{ data: roles }, { data: profile }] = await Promise.all([
          supabase.from("user_roles").select("role").eq("user_id", currentUser.id),
          supabase.rpc("get_current_user_profile"),
        ]);

        if (!mounted) return;

        const isAdminUser = roles?.some((r: { role: string }) => r.role === "admin") ?? false;
        const approved = profile?.approved ?? false;

        setIsAdmin(isAdminUser);
        setIsApproved(isAdminUser || approved);
      } catch (error) {
        console.error("Error loading user state:", error);
        if (mounted) {
          setIsAdmin(false);
          setIsApproved(false);
        }
      }
    };

    // Get initial session - this should only happen once
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
        }

        if (mounted) {
          const currentUser = initialSession?.user ?? null;
          setSession(initialSession);
          setUser(currentUser);
          await loadUserState(currentUser);
          setLoading(false);
          hasInitializedAuth.current = true;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Initialize auth once
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);

        if (mounted) {
          const currentUser = newSession?.user ?? null;
          setSession(newSession);
          setUser(currentUser);
          await loadUserState(currentUser);

          // Only set loading to false after the first auth state change
          if (!hasInitializedAuth.current) {
            setLoading(false);
            hasInitializedAuth.current = true;
          }
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - this effect runs only once

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const signOutImmediate = () => {
    // Clear local state immediately
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setIsApproved(false);
    // Clear Supabase session from localStorage
    localStorage.removeItem('supabase.auth.token');
    // Also clear any other supabase related keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-') && key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    // Sign out in background
    supabase.auth.signOut().catch(error => console.error("Background sign out error:", error));
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error("Error signing in:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      return { error };
    } catch (error) {
      console.error("Error signing up:", error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      isApproved,
      loading,
      signOut,
      signOutImmediate,
      signIn,
      signUp,
    }}>
      {children}
    </AuthContext.Provider>
  );
}