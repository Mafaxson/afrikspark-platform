import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Rocket, User, Mail, Phone, MapPin, DollarSign, Users, Target, Lightbulb, TrendingUp } from "lucide-react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh",
  "Belgium", "Brazil", "Canada", "China", "Colombia", "Denmark", "Egypt", "Finland",
  "France", "Germany", "Ghana", "Greece", "India", "Indonesia", "Ireland", "Italy",
  "Japan", "Jordan", "Kenya", "Malaysia", "Mexico", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Philippines", "Poland", "Portugal", "Russia",
  "Saudi Arabia", "Singapore", "South Africa", "South Korea", "Spain", "Sweden",
  "Switzerland", "Thailand", "Turkey", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Vietnam", "Zimbabwe"
];

const INDUSTRIES = [
  "Agriculture", "Education", "Healthcare", "Finance", "E-commerce", "Logistics",
  "Real Estate", "Manufacturing", "Energy", "Transportation", "Telecommunications",
  "Media & Entertainment", "Food & Beverage", "Retail", "Consulting", "Other"
];

interface VentureFormData {
  startupName: string;
  founderName: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  stage: "idea" | "mvp" | "early" | "growth" | "mature";
  teamSize: string;
  fundingNeeded: string;
  fundingStage: string;
  summary: string;
  problem: string;
  solution: string;
  marketOpportunity: string;
  competitiveAdvantage: string;
  businessModel: string;
  traction: string;
  website: string;
  linkedin: string;
  pitchDeckUrl: string;
}

export function VentureApplicationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VentureFormData>({
    startupName: "",
    founderName: "",
    email: "",
    phone: "",
    country: "",
    industry: "",
    stage: "idea",
    teamSize: "",
    fundingNeeded: "",
    fundingStage: "",
    summary: "",
    problem: "",
    solution: "",
    marketOpportunity: "",
    competitiveAdvantage: "",
    businessModel: "",
    traction: "",
    website: "",
    linkedin: "",
    pitchDeckUrl: ""
  });

  const handleInputChange = (field: keyof VentureFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('venture_applications')
        .insert({
          startup_name: formData.startupName,
          founder_name: formData.founderName,
          email: formData.email,
          phone: formData.phone || null,
          country: formData.country || null,
          industry: formData.industry || null,
          stage: formData.stage,
          team_size: formData.teamSize ? parseInt(formData.teamSize) : null,
          funding_needed: formData.fundingNeeded ? parseFloat(formData.fundingNeeded) : null,
          funding_stage: formData.fundingStage || null,
          summary: formData.summary,
          problem: formData.problem || null,
          solution: formData.solution || null,
          market_opportunity: formData.marketOpportunity || null,
          competitive_advantage: formData.competitiveAdvantage || null,
          business_model: formData.businessModel || null,
          traction: formData.traction || null,
          website: formData.website || null,
          linkedin: formData.linkedin || null,
          pitch_deck_url: formData.pitchDeckUrl || null
        });

      if (error) throw error;

      toast({
        title: "Application submitted successfully!",
        description: "We'll review your startup application and get back to you soon.",
      });

      // Reset form
      setFormData({
        startupName: "",
        founderName: "",
        email: "",
        phone: "",
        country: "",
        industry: "",
        stage: "idea",
        teamSize: "",
        fundingNeeded: "",
        fundingStage: "",
        summary: "",
        problem: "",
        solution: "",
        marketOpportunity: "",
        competitiveAdvantage: "",
        businessModel: "",
        traction: "",
        website: "",
        linkedin: "",
        pitchDeckUrl: ""
      });

    } catch (error: unknown) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : "Please try again later.";
      toast({
        title: "Submission failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-6 w-6" />
            Venture Studio Application
          </CardTitle>
          <CardDescription>
            Apply to join our venture studio program. We're looking for innovative African startups with high growth potential.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startupName">Startup Name *</Label>
                  <Input
                    id="startupName"
                    value={formData.startupName}
                    onChange={(e) => handleInputChange('startupName', e.target.value)}
                    required
                    placeholder="Your Startup Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founderName">Founder Name *</Label>
                  <Input
                    id="founderName"
                    value={formData.founderName}
                    onChange={(e) => handleInputChange('founderName', e.target.value)}
                    required
                    placeholder="Full Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    placeholder="founder@startup.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Startup Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Startup Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stage">Startup Stage *</Label>
                  <Select value={formData.stage} onValueChange={(value: string) => handleInputChange('stage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="idea">Idea Stage</SelectItem>
                      <SelectItem value="mvp">MVP/Prototype</SelectItem>
                      <SelectItem value="early">Early Revenue</SelectItem>
                      <SelectItem value="growth">Growth Stage</SelectItem>
                      <SelectItem value="mature">Mature</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    type="number"
                    min="1"
                    value={formData.teamSize}
                    onChange={(e) => handleInputChange('teamSize', e.target.value)}
                    placeholder="5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingNeeded">Funding Needed ($)</Label>
                  <Input
                    id="fundingNeeded"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.fundingNeeded}
                    onChange={(e) => handleInputChange('fundingNeeded', e.target.value)}
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingStage">Current Funding Stage</Label>
                <Input
                  id="fundingStage"
                  value={formData.fundingStage}
                  onChange={(e) => handleInputChange('fundingStage', e.target.value)}
                  placeholder="Pre-seed, Seed, Series A, etc."
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Business Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="summary">Startup Summary *</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  required
                  placeholder="Brief overview of your startup (what you do, target market, unique value proposition)"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="problem">Problem</Label>
                  <Textarea
                    id="problem"
                    value={formData.problem}
                    onChange={(e) => handleInputChange('problem', e.target.value)}
                    placeholder="What problem are you solving?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solution">Solution</Label>
                  <Textarea
                    id="solution"
                    value={formData.solution}
                    onChange={(e) => handleInputChange('solution', e.target.value)}
                    placeholder="How do you solve this problem?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="marketOpportunity">Market Opportunity</Label>
                  <Textarea
                    id="marketOpportunity"
                    value={formData.marketOpportunity}
                    onChange={(e) => handleInputChange('marketOpportunity', e.target.value)}
                    placeholder="Market size, growth potential, target customers"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
                  <Textarea
                    id="competitiveAdvantage"
                    value={formData.competitiveAdvantage}
                    onChange={(e) => handleInputChange('competitiveAdvantage', e.target.value)}
                    placeholder="What makes you different from competitors?"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessModel">Business Model</Label>
                  <Textarea
                    id="businessModel"
                    value={formData.businessModel}
                    onChange={(e) => handleInputChange('businessModel', e.target.value)}
                    placeholder="How do you make money?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="traction">Traction & Milestones</Label>
                  <Textarea
                    id="traction"
                    value={formData.traction}
                    onChange={(e) => handleInputChange('traction', e.target.value)}
                    placeholder="Users, revenue, partnerships, awards, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Links & Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourstartup.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/yourstartup"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
                <Input
                  id="pitchDeckUrl"
                  type="url"
                  value={formData.pitchDeckUrl}
                  onChange={(e) => handleInputChange('pitchDeckUrl', e.target.value)}
                  placeholder="https://drive.google.com/... or https://docsend.com/..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Startup Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}