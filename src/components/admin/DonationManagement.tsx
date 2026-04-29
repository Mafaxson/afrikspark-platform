import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, MessageCircle, User } from "lucide-react";

interface DonationRequest {
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
  status: "New" | "Contacted" | "Completed";
  note: string | null;
}

const STATUS_OPTIONS: Array<{ value: DonationRequest["status"]; label: string }> = [
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Completed", label: "Completed" },
];

const statusBadge = (status: DonationRequest["status"]) => {
  switch (status) {
    case "Completed":
      return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>;
    case "Contacted":
      return <Badge className="bg-sky-100 text-sky-800">Contacted</Badge>;
    default:
      return <Badge className="bg-yellow-100 text-yellow-800">New</Badge>;
  }
};

export function DonationManagement() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedRows, setEditedRows] = useState<Record<string, { status: DonationRequest["status"]; note: string }>>({});

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("donation_leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests((data || []) as DonationRequest[]);
      setEditedRows((data || []).reduce((acc, request) => {
        acc[request.id] = {
          status: request.status,
          note: request.note ?? "",
        };
        return acc;
      }, {} as Record<string, { status: DonationRequest["status"]; note: string }>));
    } catch (error) {
      console.error("Error fetching donation requests:", error);
      toast({
        title: "Unable to load donation requests",
        description: "Please refresh the page or try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFieldChange = (id: string, field: "status" | "note", value: string) => {
    setEditedRows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const saveRequest = async (id: string) => {
    const edited = editedRows[id];
    if (!edited) return;

    try {
      const { error } = await supabase
        .from("donation_leads")
        .update({ status: edited.status, note: edited.note })
        .eq("id", id);

      if (error) throw error;

      setRequests((prev) => prev.map((request) =>
        request.id === id ? { ...request, status: edited.status, note: edited.note } : request
      ));

      toast({
        title: "Donation request updated",
        description: "The status and note were saved successfully.",
      });
    } catch (error) {
      console.error("Error saving donation request:", error);
      toast({
        title: "Unable to save",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const pendingCount = requests.filter((request) => request.status === "New").length;

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
          <h2 className="text-2xl font-bold">Donation Requests</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track every support request from the DSS donation form. Update status, add notes, and make sure every donor is followed up with.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{pendingCount} New</Badge>
          <Badge variant="outline">{requests.length} Total</Badge>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No donation requests yet</h3>
            <p className="text-sm text-muted-foreground mt-2">Requests from the DSS donation form will appear here as they are submitted.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/10 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    {request.created_at ? new Date(request.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-4 align-top font-medium">{request.full_name}</td>
                  <td className="px-4 py-4 align-top text-muted-foreground">{request.organization_name || "-"}</td>
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    <div>{request.email}</div>
                    {request.phone && <div className="text-xs">📞 {request.phone}</div>}
                    {request.whatsapp && <div className="text-xs">💬 {request.whatsapp}</div>}
                  </td>
                  <td className="px-4 py-4 align-top font-semibold">
                    {request.amount} {request.currency}
                  </td>
                  <td className="px-4 py-4 align-top text-muted-foreground">
                    <div>{request.donation_type}</div>
                    {request.purpose && <div className="text-xs">{request.purpose}</div>}
                  </td>
                  <td className="px-4 py-4 align-top">{statusBadge(request.status)}</td>
                  <td className="px-4 py-4 align-top">
                    <Textarea
                      value={editedRows[request.id]?.note ?? ""}
                      onChange={(event) => handleFieldChange(request.id, "note", event.target.value)}
                      className="min-h-[110px] resize-none"
                      placeholder="Add a follow-up note"
                    />
                  </td>
                  <td className="px-4 py-4 align-top space-y-2">
                    <div>
                      <Label htmlFor={`status-${request.id}`} className="sr-only">Status</Label>
                      <Select
                        value={editedRows[request.id]?.status ?? request.status}
                        onValueChange={(value) => handleFieldChange(request.id, "status", value as DonationRequest["status"])}
                      >
                        <SelectTrigger id={`status-${request.id}`} className="w-[180px]">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" onClick={() => saveRequest(request.id)}>
                      <Check className="mr-2 h-4 w-4" /> Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
