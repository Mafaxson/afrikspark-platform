import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ADMIN_EMAIL = "ismealkamara20@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    let subject = "";
    let body = "";

    if (type === "new_signup") {
      subject = "AfrikSpark: New Community Sign-up";
      body = `A new user has signed up and is waiting for community approval.\n\nName: ${data.name || "Not provided"}\nEmail: ${data.email || "Not provided"}\n\nGo to your Admin Dashboard to approve or reject this user.`;
    } else if (type === "contact") {
      subject = "New Contact Message";
      body = `New contact form submission:\n\nName: ${data.name}\nEmail: ${data.email}\nMessage: ${data.message}`;
    } else if (type === "startup") {
      subject = "New Startup Application";
      body = `New startup application:\n\nStartup Name: ${data.startup_name}\nFounder Name: ${data.founder_name}\nEmail: ${data.email}\nWebsite: ${data.website || "Not provided"}`;
    } else if (type === "testimonial") {
      subject = "New Testimonial Submitted";
      body = `New testimonial submitted:\n\nName: ${data.name}\nMessage: ${data.message}`;
    } else if (type === "newsletter") {
      // Send newsletter to individual subscriber
      const newsletterSubject = `AfrikSpark: New Blog Post - ${data.blog_title}`;
      const newsletterBody = `Hi there!\n\nWe just published a new blog post: "${data.blog_title}"\n\n${data.blog_content ? data.blog_content.substring(0, 500) + "..." : ""}\n\nRead the full post: https://afrikspark.tech/blog/${data.blog_slug}\n\nBest regards,\nAfrikSpark Team\n\n---\nTo unsubscribe, please contact us at info@afrikspark.tech`;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "AfrikSpark <newsletter@afrikspark.tech>",
          to: [data.email],
          subject: newsletterSubject,
          text: newsletterBody,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error("Failed to send newsletter:", errorData);
        return new Response(JSON.stringify({ error: "Failed to send newsletter", details: errorData }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Newsletter sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "Unknown notification type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email using Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "AfrikSpark <notifications@afrikspark.tech>",
        to: [ADMIN_EMAIL],
        subject: subject,
        text: body,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Failed to send email:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Notification sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in notify-admin:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
