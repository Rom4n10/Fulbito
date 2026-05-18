import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Resend } from "npm:resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log("Webhook payload:", payload);

    // Verify it's an insert on notifications
    if (payload.type === "INSERT" && payload.table === "notifications") {
      const { user_id, message, type: notifType } = payload.record;

      // Get user email
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("first_name, email")
        .eq("id", user_id)
        .single();

      if (userError || !user?.email) {
        throw new Error("Could not find user or email");
      }

      console.log(`Sending email to ${user.email} for notification type: ${notifType}`);

      const subjectMap: Record<string, string> = {
        'match_request': '¡Alguien quiere unirse a tu partido en Fulbito!',
        'match_accepted': '¡Has sido aceptado en el partido!',
        'match_rejected': 'Actualización sobre tu postulación a un partido',
        'match_canceled': 'El partido ha sido cancelado',
        'mvp_selected': '¡Has sido elegido MVP del partido!',
        'team_invite': '¡Te han invitado a unirte a un equipo en Fulbito!',
      };

      const subject = subjectMap[notifType] || "Nueva notificación de Fulbito";

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <h2 style="color: #111827;">Hola ${user.first_name},</h2>
          <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">${message}</p>
          <div style="margin-top: 30px;">
            <a href="https://fulbito-app.vercel.app/" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver en la App</a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            El equipo de Fulbito<br>
            <i>Organiza y jugá más rápido</i>
          </p>
        </div>
      `;

      const data = await resend.emails.send({
        from: "Fulbito <notificaciones@tu-dominio.com>",
        to: [user.email],
        subject: subject,
        html: html,
      });

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Not an insert event" }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
