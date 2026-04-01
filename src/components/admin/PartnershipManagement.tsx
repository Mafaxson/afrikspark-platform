import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Eye, Building2, Mail, Globe, MapPin, User, ExternalLink, Calendar } from "lucide-react";

interface PartnershipApplication {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  country?: string;
  website?: string;
  partnership_type: "partner" | "sponsor";
  interest_area: string[];
  message?: string;
  logo_url?: string;
  status: "pending" | "active" | "approved" | "rejected";
  created_at: string;
}

export function PartnershipManagement() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<PartnershipApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<PartnershipApplication | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const fetchApplications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load partnership applications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateApplicationStatus = async (id: string, status: "active" | "approved" | "rejected") => {
    try {
      const { error } = await supabase
        .from('partnership_applications')
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
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return type === 'sponsor' ?
      <Badge className="bg-orange-100 text-orange-800">Sponsor</Badge> :
      <Badge className="bg-blue-100 text-blue-800">Partner</Badge>;
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
          <h2 className="text-2xl font-bold text-gray-900">Partnership Applications</h2>
          <p className="text-gray-600">Manage partnership and sponsorship applications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {applications.filter(a => a.status === 'pending').length} Pending
          </Badge>
          <Badge variant="outline">
            {applications.filter(a => a.status === 'active').length} Active
          </Badge>
          <Badge variant="outline">
            {applications.filter(a => a.status === 'approved').length} Approved
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {applications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {application.logo_url ? (
                      <img
                        src={application.logo_url}
                        alt={`${application.organization_name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.className = 'flex w-full h-full items-center justify-center';
                        }}
                      />
                    ) : null}
                    <div className="flex w-full h-full items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {application.organization_name}
                      </h3>
                      {getTypeBadge(application.partnership_type)}
                      {getStatusBadge(application.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {application.contact_person}
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {application.email}
                      </div>
                      {application.country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.country}
                        </div>
                      )}
                      {application.website && (
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <a
                            href={application.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {application.interest_area.map((area, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>

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
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {application.logo_url && (
                            <img
                              src={application.logo_url}
                              alt="logo"
                              className="w-8 h-8 rounded object-contain"
                            />
                          )}
                          {application.organization_name}
                        </DialogTitle>
                        <DialogDescription>
                          Partnership application details
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Contact Person</label>
                            <p className="text-sm text-gray-600">{application.contact_person}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <p className="text-sm text-gray-600">{application.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Country</label>
                            <p className="text-sm text-gray-600">{application.country || 'Not specified'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Type</label>
                            <p className="text-sm text-gray-600 capitalize">{application.partnership_type}</p>
                          </div>
                        </div>

                        {application.website && (
                          <div>
                            <label className="text-sm font-medium">Website</label>
                            <p>
                              <a
                                href={application.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                {application.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </p>
                          </div>
                        )}

                        <div>
                          <label className="text-sm font-medium">Interest Areas</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.interest_area.map((area, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {application.message && (
                          <div>
                            <label className="text-sm font-medium">Message</label>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mt-1">
                              {application.message}
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {application.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'active')}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateApplicationStatus(application.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
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
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-600">Partnership applications will appear here when organizations apply.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}