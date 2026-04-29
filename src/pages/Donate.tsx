import { useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Section, SectionHeader } from "@/components/SectionComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const DONATION_TYPES = ["Individual", "Company", "NGO", "Foundation", "Anonymous"];
const CURRENCIES = ["USD", "EUR", "GBP", "SLE", "Other"];
const PURPOSES = ["General Support", "Sponsor a Scholar", "Equipment Support", "Startup Grants", "Partnership Inquiry"];
const CONTACT_METHODS = ["Email", "WhatsApp", "Phone Call"];

export default function Donate() {
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("");
  const [donationType, setDonationType] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [purpose, setPurpose] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const validate = () => {
    if (!fullName.trim()) {
      toast({ title: "Full name required", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }
    if (!email.trim()) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return false;
    }
    if (!donationType) {
      toast({ title: "Donation type required", description: "Please select your donation type.", variant: "destructive" });
      return false;
    }
    if (!amount.trim() || Number(amount) <= 0) {
      toast({ title: "Donation amount required", description: "Please enter a valid donation amount.", variant: "destructive" });
      return false;
    }
    if (!currency) {
      toast({ title: "Currency required", description: "Please select your donation currency.", variant: "destructive" });
      return false;
    }
    if (!contactMethod) {
      toast({ title: "Preferred contact method", description: "Please choose how we should reach you.", variant: "destructive" });
      return false;
    }
    if (!consent) {
      toast({ title: "Consent required", description: "Please agree to be contacted regarding this donation inquiry.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;
    if (!validate()) return;

    setLoading(true);

    try {
      const numericAmount = Number(amount);
      const { error } = await supabase.from("donation_leads").insert({
        full_name: fullName.trim(),
        organization_name: organizationName.trim() || null,
        email: email.trim(),
        phone: phone.trim() || null,
        whatsapp: whatsapp.trim() || null,
        country: country.trim() || null,
        donation_type: donationType,
        amount: numericAmount,
        currency,
        purpose,
        contact_method: contactMethod,
        message: message.trim() || null,
        status: "New",
        note: null,
      });

      if (error) {
        throw error;
      }

      supabase.functions.invoke("send-notification", {
        body: {
          type: "dss_donation_lead",
          data: {
            full_name: fullName.trim(),
            organization_name: organizationName.trim() || "Not provided",
            email: email.trim(),
            phone: phone.trim() || "Not provided",
            whatsapp: whatsapp.trim() || "Not provided",
            country: country.trim() || "Not provided",
            donation_type: donationType,
            amount: numericAmount,
            currency,
            purpose,
            contact_method: contactMethod,
            message: message.trim() || "No message provided.",
          },
        },
      }).catch((emailError) => {
        console.error("Donation lead email notification failed:", emailError);
      });

      setSubmitted(true);
      setFullName("");
      setOrganizationName("");
      setEmail("");
      setPhone("");
      setWhatsapp("");
      setCountry("");
      setDonationType("");
      setAmount("");
      setCurrency("");
      setPurpose("");
      setContactMethod("");
      setMessage("");
      setConsent(false);

      toast({ title: "Submission received", description: "Thank you for your interest. Our team will contact you shortly." });
    } catch (error) {
      console.error("Donation lead submission error:", error);
      toast({ title: "Unable to submit", description: "Please try again or contact us directly.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Section className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 flex items-center gap-3 text-sm text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
            <Link to="/dss" className="font-medium hover:text-primary">Back to DSS</Link>
          </div>
          <div className="rounded-[2rem] border border-border bg-white shadow-xl shadow-slate-900/10 p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <SectionHeader
                  badge="Support DSS"
                  title="Support the Digital Skills Scholarship"
                  description="Your support helps train young people, provide mentorship, equipment, startup grants, and career pathways."
                />
                <div className="rounded-3xl bg-slate-950/95 p-6 text-slate-100 shadow-sm">
                  <p className="text-sm leading-relaxed">
                    We do not process payments on this form. This inquiry helps us coordinate your preferred donation method securely.
                  </p>
                </div>
              </div>
              <div className="rounded-3xl border border-border bg-slate-950/5 p-6">
                <div className="text-sm text-muted-foreground">Need immediate support?</div>
                <div className="mt-4 text-xl font-semibold text-foreground">Our team is ready to follow up and build a donation plan with you.</div>
              </div>
            </div>

            {submitted ? (
              <div className="mt-10 rounded-3xl bg-emerald-50 border border-emerald-200 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                <h2 className="mt-4 text-2xl font-semibold">Thank you for your interest.</h2>
                <p className="mt-3 text-muted-foreground">Our team will contact you shortly to coordinate your donation inquiry.</p>
              </div>
            ) : (
              <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input id="organizationName" value={organizationName} onChange={(event) => setOrganizationName(event.target.value)} placeholder="Company or NGO" />
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+232 7XX XXX XXX" />
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="Preferred WhatsApp contact" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Sierra Leone" />
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="donationType">Donation Type *</Label>
                    <Select value={donationType} onValueChange={setDonationType}>
                      <SelectTrigger id="donationType">
                        <SelectValue placeholder="Select donation type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DONATION_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Intended Donation Amount *</Label>
                    <Input id="amount" type="number" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="500" />
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency *</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purpose">Donation Purpose</Label>
                    <Select value={purpose} onValueChange={setPurpose}>
                      <SelectTrigger id="purpose">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {PURPOSES.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Preferred Contact Method *</Label>
                    <Select value={contactMethod} onValueChange={setContactMethod}>
                      <SelectTrigger id="contactMethod">
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTACT_METHODS.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationType">&nbsp;</Label>
                    <div className="rounded-xl border border-border bg-slate-50 p-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-slate-900">Donation coordination support</p>
                      <p className="mt-2">We help you complete the next steps securely through your preferred channel.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message / Notes</Label>
                  <Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us how you’d like to support DSS." className="min-h-[160px]" />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} />
                  <Label htmlFor="consent" className="text-sm leading-relaxed">
                    I agree to be contacted regarding this donation inquiry. *
                  </Label>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground max-w-xl">
                    We do not process payments on this form. This form helps us coordinate your preferred donation method securely.
                  </p>
                  <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
                    Submit Donation Interest
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>
    </Layout>
  );
}
