import { Resend } from "resend";
import type { ReactElement } from "react";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  client = new Resend(apiKey);
  return client;
}

type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
  attachments?: { filename: string; content: Buffer }[];
};

/**
 * Sends via Resend when RESEND_API_KEY is configured; otherwise logs and
 * no-ops, so the rest of the app (order/enrolment flows) keeps working
 * without email credentials.
 */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const { to, subject, react, attachments } = input;
  const resend = getClient();
  const from = process.env.EMAIL_FROM || "Sailors Football Academy <noreply@sailorsfootballacademy.com>";

  if (!resend) {
    console.warn(`sendEmail: RESEND_API_KEY not set — skipping email "${subject}" to ${to}`);
    return;
  }

  try {
    const { error } = await resend.emails.send({ from, to, subject, react, attachments });
    if (error) console.error(`sendEmail: Resend rejected "${subject}" to ${to}`, error);
  } catch (error) {
    console.error(`sendEmail: failed to send "${subject}" to ${to}`, error);
  }
}
