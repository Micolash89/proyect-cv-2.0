import nodemailer from "nodemailer";
import { getSettings } from "@/lib/db/models/settings";

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const settings = await getSettings();
    
    if (!settings.emailHost || !settings.emailUser || !settings.emailPassword) {
      console.error("Email settings not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: settings.emailHost,
      port: parseInt(settings.emailPort || "587"),
      secure: settings.emailPort === "465",
      auth: {
        user: settings.emailUser,
        pass: settings.emailPassword,
      },
    });

    await transporter.sendMail({
      from: settings.emailFrom || settings.emailUser,
      to,
      subject,
      html,
    });

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendNewCVNotification(userName: string, userPhone: string): Promise<void> {
  const settings = await getSettings();
  
  if (!settings.emailUser) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0ea5e9; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .info { margin: 10px 0; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nuevo Curriculum Registrado</h1>
        </div>
        <div class="content">
          <div class="info">
            <span class="label">Nombre:</span> ${userName}
          </div>
          <div class="info">
            <span class="label">Teléfono:</span> ${userPhone}
          </div>
          <p>Hay un nuevo curriculum vitae esperando ser revisado en el panel de admin.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Ver en Admin
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail(settings.emailUser, "Nuevo CV Registrado", html);
}
