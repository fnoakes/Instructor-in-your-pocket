import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL")!;

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    const record = payload?.record;
    if (!record?.ticket_id) {
      return new Response(
        JSON.stringify({ ok: true, skipped: "No ticket_id on payload" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: ticket, error: ticketError } = await supabase
      .from("ask_francis_tickets")
      .select("id, subject, user_id")
      .eq("id", record.ticket_id)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Ticket lookup failed",
          details: ticketError,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", ticket.user_id)
      .maybeSingle();

    if (profileError || !profile?.email) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Profile/email lookup failed",
          details: profileError,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2>Your Ask Francis question has a reply</h2>
        <p>Hi ${profile.name || "there"},</p>
        <p>Francis has replied to your Ask Francis question:</p>
        <p><strong>${ticket.subject || "Your question"}</strong></p>
        <p>Log in to Instructor In Your Pocket to read the reply.</p>
        <p>
          <a
            href="${APP_URL}"
            style="display:inline-block;padding:12px 18px;background:#47778f;color:#ffffff;text-decoration:none;border-radius:12px;"
          >
            Open the app
          </a>
        </p>
        <p style="margin-top:24px;color:#6b7280;font-size:14px;">
          You’re getting this email because a reply was added to your Ask Francis ticket.
        </p>
      </div>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Driving School TV <notifications@YOURDOMAIN.com>",
        to: profile.email,
        subject: "Francis replied to your Ask Francis question",
        html,
      }),
    });

    const resendData = await resendResponse.json();

    return new Response(JSON.stringify({ ok: true, resendData }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});