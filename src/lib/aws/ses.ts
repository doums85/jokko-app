// ┌─────────────────────────────────────────────────────────┐
// │                  AWS SES Configuration                  │
// │                                                         │
// │  SES client and email sending utilities                │
// └─────────────────────────────────────────────────────────┘

import { SESClient, SendEmailCommand, SendTemplatedEmailCommand } from "@aws-sdk/client-ses";
import { render } from "@react-email/render";
import type { ReactElement } from "react";

// Initialize SES client
export const sesClient = new SESClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || "noreply@example.com";
export const SES_FROM_NAME = process.env.SES_FROM_NAME || "Jokko";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send a basic HTML email using SES
 */
export async function sendEmail(params: SendEmailParams): Promise<void> {
  const command = new SendEmailCommand({
    Source: params.from || `${SES_FROM_NAME} <${SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
    },
    Message: {
      Subject: {
        Data: params.subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: params.html,
          Charset: "UTF-8",
        },
        ...(params.text && {
          Text: {
            Data: params.text,
            Charset: "UTF-8",
          },
        }),
      },
    },
    ...(params.replyTo && {
      ReplyToAddresses: [params.replyTo],
    }),
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

interface SendReactEmailParams {
  to: string | string[];
  subject: string;
  react: ReactElement;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using a React Email component
 */
export async function sendReactEmail(params: SendReactEmailParams): Promise<void> {
  const html = await render(params.react, {
    pretty: true,
  });

  const text = await render(params.react, {
    plainText: true,
  });

  await sendEmail({
    to: params.to,
    subject: params.subject,
    html,
    text,
    from: params.from,
    replyTo: params.replyTo,
  });
}

interface SendTemplatedEmailParams {
  to: string | string[];
  templateName: string;
  templateData: Record<string, any>;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using an SES template
 * Note: Templates must be created in AWS SES console first
 */
export async function sendTemplatedEmail(params: SendTemplatedEmailParams): Promise<void> {
  const command = new SendTemplatedEmailCommand({
    Source: params.from || `${SES_FROM_NAME} <${SES_FROM_EMAIL}>`,
    Destination: {
      ToAddresses: Array.isArray(params.to) ? params.to : [params.to],
    },
    Template: params.templateName,
    TemplateData: JSON.stringify(params.templateData),
    ...(params.replyTo && {
      ReplyToAddresses: [params.replyTo],
    }),
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error("Error sending templated email:", error);
    throw new Error("Failed to send templated email");
  }
}
