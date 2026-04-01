import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Building2, Award } from "lucide-react";

interface Partner {
  id: string;
  organization_name: string;
  website: string;
  partnership_type: "partner" | "sponsor";
  logo_url?: string;
}

export function PartnersSponsorsSection() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [sponsors, setSponsors] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedPartnerships();
  }, []);

  const fetchApprovedPartnerships = async () => {
    try {
      const { data, error } = await supabase
        .from('partnership_applications')
        .select('id, organization_name, website, partnership_type, logo_url')
        .in('status', ['approved', 'active'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const partnersData = data.filter(p => p.partnership_type === 'partner');
        const sponsorsData = data.filter(p => p.partnership_type === 'sponsor');

        setPartners(partnersData);
        setSponsors(sponsorsData);
      }
    } catch (error) {
      console.error('Error fetching partnerships:', error);
    } finally {
      setLoading(false);
    }
  };

  const PartnerCard = ({ partner }: { partner: Partner }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          {partner.logo_url ? (
            <div className="w-20 h-20 rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-shadow">
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  <img
                    src={partner.logo_url}
                    alt={`${partner.organization_name} logo`}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.nextElementSibling!.className = 'flex';
                    }}
                  />
                </a>
              ) : (
                <img
                  src={partner.logo_url}
                  alt={`${partner.organization_name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.className = 'flex';
                  }}
                />
              )}
              <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
              {partner.organization_name}
            </h3>
            {partner.website && (
              <a
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-1 group-hover:underline"
              >
                Visit Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading partners...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Sponsors Section */}
        {sponsors.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Award className="w-4 h-4" />
                Our Sponsors
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Supporting Our Mission
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Generous organizations that believe in our vision and support youth innovation across Africa.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {sponsors.map((sponsor) => (
                <PartnerCard key={sponsor.id} partner={sponsor} />
              ))}
            </div>
          </div>
        )}

        {/* Partners Section */}
        {partners.length > 0 && (
          <div>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Building2 className="w-4 h-4" />
                Our Partners
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Building Together
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Organizations collaborating with us to drive innovation and create opportunities for African youth.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {partners.map((partner) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {partners.length === 0 && sponsors.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Partnerships Coming Soon
            </h3>
            <p className="text-gray-600">
              We're actively building partnerships to support our mission.
              <br />
              Interested in collaborating? <a href="#contact" className="text-blue-600 hover:underline">Get in touch</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}