import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Section } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function AdminSetup() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const grantAdminAccess = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // First, ensure the user has a profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
          approved: true
        }, {
          onConflict: 'user_id'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        alert('Failed to create profile: ' + profileError.message);
        return;
      }

      // Call the grant_admin function
      const { error } = await supabase.rpc('grant_admin');

      if (error) {
        console.error('Error granting admin access:', error);
        alert('Failed to grant admin access: ' + error.message);
      } else {
        alert('Admin access granted successfully! Please refresh the page.');
        // Force a page refresh to update auth state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while granting admin access.');
    }
    setLoading(false);
  };

  if (isAdmin) {
    return (
      <Layout>
        <Section>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Admin Access Confirmed</h1>
            <p className="mb-4">You already have admin privileges.</p>
            <Button onClick={() => navigate('/admin')}>Go to Admin Dashboard</Button>
          </div>
        </Section>
      </Layout>
    );
  }

  return (
    <Layout>
      <Section className="min-h-[60vh] flex items-center">
        <div className="text-center max-w-md mx-auto">
          <h1 className="font-display text-2xl font-bold mb-4">Admin Setup</h1>
          <p className="text-muted-foreground mb-6">
            Grant yourself admin access to manage the platform.
          </p>
          <Button
            onClick={grantAdminAccess}
            disabled={loading || !user}
            className="w-full"
          >
            {loading ? 'Granting Access...' : 'Grant Admin Access'}
          </Button>
          {user && (
            <p className="text-sm text-muted-foreground mt-4">
              Logged in as: {user.email}
            </p>
          )}
        </div>
      </Section>
    </Layout>
  );
}