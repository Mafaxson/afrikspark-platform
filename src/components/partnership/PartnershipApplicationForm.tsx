import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { Upload, Building2, Mail, Globe, MapPin, User, MessageSquare, Check, ChevronsUpDown } from "lucide-react";

const INTEREST_AREAS = [
  "Sponsor DSS",
  "Fund Innovation Projects",
  "Support Youth Training",
  "Provide Mentorship",
  "Technology Collaboration"
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia",
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda",
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

interface PartnershipFormData {
  organizationName: string;
  contactPerson: string;
  email: string;
  country: string;
  website: string;
  partnershipType: "partner" | "sponsor";
  interestAreas: string[];
  message: string;
  logo: File | null;
}

export function PartnershipApplicationForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [formData, setFormData] = useState<PartnershipFormData>({
    organizationName: "",
    contactPerson: "",
    email: "",
    country: "",
    website: "",
    partnershipType: "partner",
    interestAreas: [],
    message: "",
    logo: null
  });

  const handleInputChange = (field: keyof PartnershipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInterestAreaChange = (area: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interestAreas: checked
        ? [...prev.interestAreas, area]
        : prev.interestAreas.filter(a => a !== area)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPG, etc.)",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, logo: file }));
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `logos/${fileName}`;

    const { error } = await supabase.storage
      .from('partner-logos')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading logo:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('partner-logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoUrl = null;

      // Upload logo if provided
      if (formData.logo) {
        logoUrl = await uploadLogo(formData.logo);
        if (!logoUrl) {
          throw new Error('Failed to upload logo');
        }
      }

      // Submit application
      const { error } = await supabase
        .from('partnership_applications')
        .insert({
          organization_name: formData.organizationName,
          contact_person: formData.contactPerson,
          email: formData.email,
          country: formData.country,
          website: formData.website,
          partnership_type: formData.partnershipType,
          interest_area: formData.interestAreas,
          message: formData.message,
          logo_url: logoUrl
        });

      if (error) throw error;

      toast({
        title: "Application submitted successfully!",
        description: "We'll review your application and get back to you soon.",
      });

      // Reset form
      setFormData({
        organizationName: "",
        contactPerson: "",
        email: "",
        country: "",
        website: "",
        partnershipType: "partner",
        interestAreas: [],
        message: "",
        logo: null
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
            <Building2 className="h-6 w-6" />
            Partnership Application
          </CardTitle>
          <CardDescription>
            Join us in building Africa's tech ecosystem. Apply to become a partner or sponsor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange('organizationName', e.target.value)}
                  required
                  placeholder="Your Organization Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  required
                  placeholder="Full Name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  placeholder="contact@organization.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={countryOpen}
                      className="w-full justify-between"
                    >
                      {formData.country || "Select your country..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search countries..." />
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {COUNTRIES.map((country) => (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={(value) => {
                              handleInputChange('country', value);
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.country === country ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {country}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://www.organization.com"
              />
            </div>

            {/* Partnership Type */}
            <div className="space-y-2">
              <Label>Partnership Type *</Label>
              <Select
                value={formData.partnershipType}
                onValueChange={(value: "partner" | "sponsor") => handleInputChange('partnershipType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="partner">Partner - Collaborate on initiatives</SelectItem>
                  <SelectItem value="sponsor">Sponsor - Provide financial support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interest Areas */}
            <div className="space-y-2">
              <Label>Partnership Interest Areas *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {INTEREST_AREAS.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={area}
                      checked={formData.interestAreas.includes(area)}
                      onCheckedChange={(checked) => handleInterestAreaChange(area, checked as boolean)}
                    />
                    <Label htmlFor={area} className="text-sm">{area}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo">Organization Logo</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Upload your organization logo (PNG, JPG, max 5MB)
              </p>
              {formData.logo && (
                <p className="text-sm text-green-600">
                  ✓ {formData.logo.name} selected
                </p>
              )}
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Tell us more about your organization and partnership goals..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}