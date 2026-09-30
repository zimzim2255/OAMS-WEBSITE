import nodemailer from "nodemailer";

interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function config(): MailConfig | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return {
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: (process.env.SMTP_SECURE ?? "true") === "true",
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.MAIL_FROM ?? "OAMS <no-reply@oams.shop>",
  };
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  const cfg = config();
  if (!cfg) return; // SMTP not configured — skip silently in dev
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
  });
  try {
    await transporter.sendMail({ from: cfg.from, to, subject, html });
  } finally {
    transporter.close();
  }
}

export async function sendOrderConfirmation(
  to: string,
  orderNumber: string,
  totalDisplay: string,
  siteUrl: string
): Promise<void> {
  await sendMail(
    to,
    `OAMS — Order ${orderNumber} received`,
    `<h1>Thanks for your order!</h1><p>Order <b>${orderNumber}</b> has been received.</p>
     <p>Total: <b>${totalDisplay}</b></p><p>Track it from <a href="${siteUrl}/account/orders">your account</a>.</p>`
  );
}

export async function sendSupportConfirmation(
  to: string,
  ticketNumber: string,
  subject: string
): Promise<void> {
  await sendMail(
    to,
    `OAMS — Support ticket ${ticketNumber} received`,
    `<h1>We received your request</h1>
     <p>Thank you for contacting OAMS support. Your ticket <b>${ticketNumber}</b>
     ("${subject}") has been opened and our team will get back to you shortly.</p>
     <p>You can track it at <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/support">oams support</a>.</p>`
  );
}

export async function sendSupportReply(
  to: string,
  ticketNumber: string,
  snippet: string
): Promise<void> {
  const escaped = snippet.replace(/</g, "&lt;").replace(/\n/g, "<br>");
  await sendMail(
    to,
    `OAMS — New reply on ticket ${ticketNumber}`,
    `<p>Our team has replied to your ticket <b>${ticketNumber}</b> (OAMS support):</p>
     <blockquote>${escaped}</blockquote>
     <p>Reply any time from <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/support">oams support</a>.</p>`
  );
}