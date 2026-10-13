import { Resend } from 'resend';
import { prisma } from './prisma';

interface EmailPayload {
  to: string;
  subject: string;
  templateType: string;
  html: string;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isSimulated?: boolean;
}

// Global Luxury FITLIFE Email Template Wrapper
export function buildFitlifeEmailHtml({
  preheader,
  headline,
  recipientName,
  bodyContent,
  ctaText,
  ctaUrl,
  highlightBox,
}: {
  preheader: string;
  headline: string;
  recipientName: string;
  bodyContent: string[];
  ctaText?: string;
  ctaUrl?: string;
  highlightBox?: { label: string; value: string }[];
}): string {
  const currentYear = new Date().getFullYear();

  const highlightsHtml = highlightBox
    ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1A1A1A; border: 1px solid #2E2E2E; border-left: 3px solid #C8A96B; border-radius: 6px; margin: 24px 0;">
      <tr>
        <td style="padding: 16px 20px;">
          ${highlightBox
            .map(
              (h) => `
            <div style="margin: 6px 0;">
              <span style="font-size: 12px; color: #8E8E88; text-transform: uppercase; letter-spacing: 0.5px;">${h.label}:</span>
              <strong style="font-size: 15px; color: #F5F5F0; margin-left: 8px;">${h.value}</strong>
            </div>`
            )
            .join('')}
        </td>
      </tr>
    </table>`
    : '';

  const ctaHtml =
    ctaText && ctaUrl
      ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
      <tr>
        <td align="center" style="border-radius: 4px; background-color: #C8A96B;">
          <a href="${ctaUrl}" target="_blank" style="font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111111; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 4px; display: inline-block; letter-spacing: 0.5px;">
            ${ctaText}
          </a>
        </td>
      </tr>
    </table>`
      : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${headline}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <style>
    body { margin: 0; padding: 0; background-color: #0E0E0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    p { margin: 0 0 16px 0; line-height: 1.6; color: #CCCCCC; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0E0E0E;">
  <!-- Preheader Text -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0E0E0E; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #141414; border: 1px solid #262626; border-radius: 10px; overflow: hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #111111; padding: 32px 36px; border-bottom: 1px solid #222222; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: 2px; color: #F5F5F0; font-family: 'Cinzel', -apple-system, sans-serif;">
                      FITLIFE
                    </span>
                    <span style="display: block; font-size: 11px; letter-spacing: 1.5px; color: #C8A96B; text-transform: uppercase; margin-top: 2px;">
                      Luxury Fitness & Athletic Club
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; text-align: left;">
              <h1 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 600; color: #F5F5F0; letter-spacing: -0.2px;">
                ${headline}
              </h1>

              <p style="font-size: 15px; color: #E0E0DA; margin-bottom: 20px;">
                Hi <strong>${recipientName}</strong>,
              </p>

              ${bodyContent.map((p) => `<p style="font-size: 14px; color: #BDBDB5; line-height: 1.65;">${p}</p>`).join('')}

              ${highlightsHtml}

              ${ctaHtml}

              <p style="font-size: 13px; color: #888880; margin-top: 32px; border-top: 1px solid #242424; padding-top: 20px;">
                Warm regards,<br>
                <strong style="color: #F5F5F0;">FITLIFE Concierge & Training Team</strong><br>
                <span style="font-size: 12px; color: #6E6E68;">Bangalore Financial District Club</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0E0E0E; padding: 24px 36px; text-align: center; border-top: 1px solid #222222;">
              <p style="margin: 0; font-size: 12px; color: #666660; line-height: 1.5;">
                Level 4, Signature Towers, Financial District, Bangalore, KA 560103<br>
                Contact: concierge@fitlife.club | +91 80 4990 8800<br>
                &copy; ${currentYear} FITLIFE Luxury Fitness. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Unified Send Email Method (Resend + Local Mock Test Support)
export async function sendEmail({
  to,
  subject,
  templateType,
  html,
}: EmailPayload): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'FITLIFE Club <onboarding@resend.dev>';

  // Dev mode or unconfigured API Key -> Real local mock logging
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    const mockMessageId = `mock-email-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    console.log(`\n================== [LOCAL DEV EMAIL MOCK] ==================`);
    console.log(`To:           ${to}`);
    console.log(`Subject:      ${subject}`);
    console.log(`Template:     ${templateType}`);
    console.log(`MessageId:    ${mockMessageId}`);
    console.log(`Provider:     MOCK_DEV_INBOX (No external delivery attempted)`);
    console.log(`============================================================\n`);

    try {
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          subject,
          templateType,
          status: 'SIMULATED',
          provider: 'MOCK_LOCAL_DEV',
          providerMessageId: mockMessageId,
        },
      });
    } catch (e) {
      console.error('Failed to log simulated email to DB:', e);
    }

    return {
      success: true,
      messageId: mockMessageId,
      isSimulated: true,
    };
  }

  // Real Resend Provider
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    if (error) {
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          subject,
          templateType,
          status: 'FAILED',
          provider: 'RESEND',
          errorDetails: error.message || JSON.stringify(error),
        },
      });

      return {
        success: false,
        error: error.message,
      };
    }

    const messageId = data?.id || `resend-${Date.now()}`;
    await prisma.emailLog.create({
      data: {
        recipientEmail: to,
        subject,
        templateType,
        status: 'SENT',
        provider: 'RESEND',
        providerMessageId: messageId,
      },
    });

    return {
      success: true,
      messageId,
      isSimulated: false,
    };
  } catch (err: any) {
    const errMsg = err?.message || 'Unknown email sending failure';
    await prisma.emailLog.create({
      data: {
        recipientEmail: to,
        subject,
        templateType,
        status: 'FAILED',
        provider: 'RESEND',
        errorDetails: errMsg,
      },
    });

    return {
      success: false,
      error: errMsg,
    };
  }
}
