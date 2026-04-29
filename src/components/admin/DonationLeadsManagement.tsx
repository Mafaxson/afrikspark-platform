import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Users } from "lucide-react";

interface DonationLead {
  id: string;
  created_at: string | null;
  full_name: string;
  organization_name: string | null;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  country: string | null;
  donation_type: string;
  amount: number;
  currency: string;
  purpose: string | null;
  contact_method: string;
  message: string | null;
  status: string;
  note: string | null;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "Contacted":
      return <Badge className="bg-sky-100 text-sky-800">Contacted</Badge>;
    case "Completed":
      return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800">New</Badge>;
  }
};

export function DonationLeadsManagement() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<DonationLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("donation_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads((data || []) as DonationLead[]);
    } catch (error) {
      console.error("Error fetching donation leads:", error);
      toast({
        title: "Unable to load donation leads",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Donation Leads</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Review incoming DSS donation inquiries, contact donors quickly, and ensure every lead is handled professionally.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{leads.length} total</Badge>
        </div>
      </div>

      {leads.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No donation leads yet</h3>
            <p className="text-sm text-muted-foreground mt-2">Donation inquiries submitted from the DSS page will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{lead.donation_type} Lead</p>
                  <h3 className="mt-2 text-xl font-semibold leading-tight">{lead.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {statusBadge(lead.status)}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Amount + Currency</p>
                  <p className="text-sm text-muted-foreground">{lead.amount?.toLocaleString()} {lead.currency}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Preferred Contact</p>
                  <p className="text-sm text-muted-foreground">{lead.contact_method}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Country</p>
                  <p className="text-sm text-muted-foreground">{lead.country || "Not specified"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-900">Organization</p>
                  <p className="text-sm text-muted-foreground">{lead.organization_name || "Not provided"}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3 rounded-3xl border border-border bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-900">Message</p>
                <p className="text-sm text-muted-foreground">{lead.message || "No message provided."}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">Submitted {lead.created_at ? new Date(lead.created_at).toLocaleString() : "Unknown"}</div>
                <Button variant="outline" size="sm" asChild>
                  <a href={`mailto:${lead.email}?subject=Thank you for your donation inquiry`}>
                    Contact Donor
                  </a>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
