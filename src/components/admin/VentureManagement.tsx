import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Rocket, Mail, Phone, MapPin, Users, DollarSign, ExternalLink, Calendar, Building2 } from "lucide-react";

interface VentureApplication {
  id: string;
  startup_name: string;
  founder_name: string;
  email: string;
  phone?: string;
  country?: string;
  industry?: string;
  stage: "idea" | "mvp" | "early" | "growth" | "mature";
  team_size?: number;
  funding_needed?: number;
  funding_stage?: string;
  summary: string;
  problem?: string;
  solution?: string;
  market_opportunity?: string;
  competitive_advantage?: string;
  business_model?: string;
  traction?: string;
  website?: string;
  linkedin?: string;
  pitch_deck_url?: string;
  status: "pending" | "approved" | "rejected" | "contacted";
  created_at: string;
}

export function VentureManagement() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<VentureApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<VentureApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('venture_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load venture applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateApplicationStatus = async (id: string, status: "approved" | "rejected" | "contacted") => {
    try {
      const { error } = await supabase
        .from('venture_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev =>
        prev.map(app =>
          app.id === id ? { ...app, status } : app
        )
      );

      toast({
        title: "Status updated",
        description: `Application ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'contacted':
        return <Badge className="bg-blue-100 text-blue-800">Contacted</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getStageBadge = (stage: string) => {
    const colors = {
      idea: "bg-purple-100 text-purple-800",
      mvp: "bg-blue-100 text-blue-800",
      early: "bg-green-100 text-green-800",
      growth: "bg-orange-100 text-orange-800",
      mature: "bg-red-100 text-red-800"
    };
    return <Badge className={colors[stage as keyof typeof colors] || "bg-gray-100 text-gray-800"}>{stage.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Venture Applications</h2>
          <p className="text-gray-600">Manage startup applications for the venture studio program</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {applications.filter(a => a.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {applications.filter(a => a.status === 'approved').length} Approved
          </Badge>
          <Badge variant="outline">
            {applications.filter(a => a.status === 'contacted').length} Contacted
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Startup Icon */}
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-6 h-6 text-purple-600" />
                  </div>

                  {/* Application Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {application.startup_name}
                      </h3>
                      {getStageBadge(application.stage)}
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {application.founder_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {application.email}
                      </div>
                      {application.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {application.phone}
                        </div>
                      )}
                      {application.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.country}
                        </div>
                      )}
                      {application.industry && (
                        <div className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {application.industry}
                        </div>
                      )}
                      {application.funding_needed && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${application.funding_needed.toLocaleString()}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {application.summary}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(application.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Rocket className="w-6 h-6" />
                          {application.startup_name}
                        </DialogTitle>
                        <DialogDescription>
                          Venture studio application details
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Founder</label>
                            <p className="text-sm text-gray-600">{application.founder_name}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm text-gray-600">{application.email}</p>
                          </div>
                          {application.phone && (
                            <div>
                              <label className="text-sm font-medium">Phone</label>
                              <p className="text-sm text-gray-600">{application.phone}</p>
                            </div>
                          )}
                          {application.country && (
                            <div>
                              <label className="text-sm font-medium">Country</label>
                              <p className="text-sm text-gray-600">{application.country}</p>
                            </div>
                          )}
                          {application.industry && (
                            <div>
                              <label className="text-sm font-medium">Industry</label>
                              <p className="text-sm text-gray-600">{application.industry}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-sm font-medium">Stage</label>
                            <p className="text-sm text-gray-600 capitalize">{application.stage}</p>
                          </div>
                          {application.team_size && (
                            <div>
                              <label className="text-sm font-medium">Team Size</label>
                              <p className="text-sm text-gray-600">{application.team_size}</p>
                            </div>
                          )}
                          {application.funding_needed && (
                            <div>
                              <label className="text-sm font-medium">Funding Needed</label>
                              <p className="text-sm text-gray-600">${application.funding_needed.toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Summary */}
                        <div>
                          <label className="text-sm font-medium">Summary</label>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                            {application.summary}
                          </p>
                        </div>

                        {/* Problem & Solution */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {application.problem && (
                            <div>
                              <label className="text-sm font-medium">Problem</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.problem}
                              </p>
                            </div>
                          )}
                          {application.solution && (
                            <div>
                              <label className="text-sm font-medium">Solution</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.solution}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Market & Competition */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {application.market_opportunity && (
                            <div>
                              <label className="text-sm font-medium">Market Opportunity</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.market_opportunity}
                              </p>
                            </div>
                          )}
                          {application.competitive_advantage && (
                            <div>
                              <label className="text-sm font-medium">Competitive Advantage</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.competitive_advantage}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Business Model & Traction */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {application.business_model && (
                            <div>
                              <label className="text-sm font-medium">Business Model</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.business_model}
                              </p>
                            </div>
                          )}
                          {application.traction && (
                            <div>
                              <label className="text-sm font-medium">Traction & Milestones</label>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                                {application.traction}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {application.website && (
                            <div>
                              <label className="text-sm font-medium">Website</label>
                              <a
                                href={application.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                              >
                                Visit Website
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {application.linkedin && (
                            <div>
                              <label className="text-sm font-medium">LinkedIn</label>
                              <a
                                href={application.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                              >
                                View LinkedIn
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {application.pitch_deck_url && (
                            <div>
                              <label className="text-sm font-medium">Pitch Deck</label>
                              <a
                                href={application.pitch_deck_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                              >
                                View Pitch Deck
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateApplicationStatus(application.id, 'contacted')}
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateApplicationStatus(application.id, 'rejected')}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Venture studio applications will appear here when startups apply.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}