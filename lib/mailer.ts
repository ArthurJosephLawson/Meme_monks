import nodemailer from "nodemailer";

/** Operations inbox that receives filed creator applications. */
export const OPERATIONS_EMAIL = "script.monks.mail@gmail.com";

export interface ApplicationEmailData {
  id: string;
  name: string;
  contact: string;
  submissionType: string;
  assetPath?: string;
  conceptText?: string;
  agreedToPolicy: boolean;
  status: string;
  createdAt: string;
}

export interface ApplicationEmail {
  subject: string;
  text: string;
  html: string;
}

/**
 * Build a detailed operations email for a filed application. For UPLOAD
 * submissions the meme picture is referenced via its stored asset path;
 * for CONCEPT_DESCRIPTION the sanitized concept text is included.
 */
export function buildApplicationEmail(data: ApplicationEmailData): ApplicationEmail {
  const subject = `Meme Monks — new application filed: ${data.name}`;

  const detail =
    data.submissionType === "UPLOAD"
      ? data.assetPath
        ? `Uploaded meme picture: ${data.assetPath}`
        : "Uploaded meme picture (asset pending)."
      : data.conceptText
        ? data.conceptText
        : "No concept description provided.";

  const text = [
    "NEW MEME MONKS CREATOR APPLICATION",
    "=============================",
    "",
    `Reference:        ${data.id}`,
    `Applicant name:   ${data.name}`,
    `Contact:          ${data.contact || "—"}`,
    `Submission type: ${data.submissionType}`,
    `Meme detail:      ${detail}`,
    `Policy agreed:    ${data.agreedToPolicy ? "yes" : "no"}`,
    `Status:           ${data.status}`,
    `Filed at:         ${data.createdAt}`,
    "",
    "Action: review application in the admin inbox before approving.",
  ].join("\n");

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f1f3f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#fbfcfe;border:1px solid #c5ccd8;border-radius:8px;padding:24px;">
      <h1 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1f2833;">Meme Monks — new creator application</h1>
      <table style="width:100%;border-collapse:collapse;font-size:13px;color:#1f2833;">
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Reference</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.id}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Applicant name</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.name}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Contact</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.contact || "—"}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Submission type</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.submissionType}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Meme detail</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${detail}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Policy agreed</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.agreedToPolicy ? "yes" : "no"}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Status</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.status}</td></tr>
        <tr><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">Filed at</td><td style="padding:6px 0;border-bottom:1px solid #e9edf3;">${data.createdAt}</td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#647b96;">Review the application in the admin inbox before approving.</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

/**
 * Send the detailed application notification to the operations inbox.
 * Gmail SMTP via nodemailer. Failures are surfaced to the caller (the API
 * route logs them) — filing itself must not be rolled back on mail errors.
 */
export async function sendApplicationEmail(data: ApplicationEmailData): Promise<void> {
  const from = process.env.GMAIL_USER ?? OPERATIONS_EMAIL;
  const pass = process.env.GMAIL_APP_PASSWORD ?? "";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: from, pass },
  });

  const { subject, text, html } = buildApplicationEmail(data);

  await transporter.sendMail({
    from,
    to: OPERATIONS_EMAIL,
    subject,
    text,
    html,
  });
}
