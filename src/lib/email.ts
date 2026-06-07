export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.SMTP_URL) {
    console.info("[email]", payload.to, payload.subject);
    return;
  }
  console.info("[email:dev]", payload);
}

export function listingApprovedEmail(title: string, slug: string) {
  const url = `${process.env.APP_URL}/workflows/${slug}`;
  return {
    subject: `Your workflow "${title}" is live on n8nify`,
    text: `Great news! Your workflow "${title}" has been approved and is now published.\n\nView it: ${url}`,
  };
}

export function listingRejectedEmail(title: string, reason: string) {
  return {
    subject: `Update on your workflow "${title}"`,
    text: `Your workflow submission was not approved.\n\nReason: ${reason}\n\nYou can edit and resubmit from your seller dashboard.`,
  };
}

export function purchaseReceiptEmail(title: string, slug: string) {
  const url = `${process.env.APP_URL}/workflows/${slug}`;
  return {
    subject: `Your n8nify purchase: ${title}`,
    text: `Thanks for your purchase!\n\nAccess your workflow: ${url}\n\nYou can download the JSON or use the Import URL from your dashboard.`,
  };
}
