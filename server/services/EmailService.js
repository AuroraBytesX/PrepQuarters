/*
 * Email Delivery Service
 * PrepQuarters Engineering Platform
 * Handles outbound contact form delivery to tapashidhar2004@gmail.com
 * and secure 6-digit password reset OTP codes via SMTP (Nodemailer) or Resend API.
 */

const nodemailer = require("nodemailer");
const { cleanDisallowedChars } = require("./SanitizationHelper");

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const DEFAULT_RECEIVER = "tapashidhar2004@gmail.com";

/**
 * Validates syntax of an email address.
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Reusable SMTP transporter helper with connection pooling and fast timeouts.
 */
function getSmtpTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  const cleanUser = process.env.SMTP_USER.trim();
  const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, ""); // Strip all spaces from app passwords
  const host = process.env.SMTP_HOST || (cleanUser.includes("@gmail.com") ? "smtp.gmail.com" : "localhost");
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: cleanUser,
      pass: cleanPass,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Dispatches contact inquiry to tapashidhar2004@gmail.com using the active email transport.
 */
async function sendContactEmail({ name = "Candidate", email = "", message = "" }) {
  const cleanName = cleanDisallowedChars(String(name).trim() || "Candidate");
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanMessage = cleanDisallowedChars(String(message).trim());
  const recipient = process.env.CONTACT_RECEIVER_EMAIL || DEFAULT_RECEIVER;
  const timestamp = new Date().toUTCString();

  if (!isValidEmail(cleanEmail)) {
    return {
      success: false,
      delivered: false,
      error: "Invalid sender email address.",
      message: "Please enter a valid email address.",
    };
  }

  if (!cleanMessage || cleanMessage.length < 5) {
    return {
      success: false,
      delivered: false,
      error: "Message too short.",
      message: "Message must contain at least 5 characters.",
    };
  }

  const subject = `PrepQuarters Contact: New Message from ${cleanName}`;
  const textContent = `
PrepQuarters Contact Inquiry
=============================
Sender Name:  ${cleanName}
Sender Email: ${cleanEmail}
Date / Time:  ${timestamp}
Recipient:    ${recipient}

Message Content:
---------------------------------------------
${cleanMessage}
---------------------------------------------

GitHub: https://github.com/AuroraBytesX/PrepQuarters
`.trim();

  const htmlContent = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; color: #1e293b;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">PrepQuarters Contact Inquiry</h2>
    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">New message received from PrepQuarters Web Portal</p>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
    <tr>
      <td style="padding: 6px 0; color: #64748b; width: 120px; font-weight: 600;">Sender Name:</td>
      <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${cleanName}</td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Sender Email:</td>
      <td style="padding: 6px 0; color: #059669; font-weight: 700;"><a href="mailto:${cleanEmail}" style="color: #059669; text-decoration: none;">${cleanEmail}</a></td>
    </tr>
    <tr>
      <td style="padding: 6px 0; color: #64748b; font-weight: 600;">Submitted At:</td>
      <td style="padding: 6px 0; color: #475569;">${timestamp}</td>
    </tr>
  </table>

  <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
    <p style="font-size: 13px; color: #64748b; margin: 0 0 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
    <p style="font-size: 15px; color: #0f172a; line-height: 1.6; margin: 0; white-space: pre-wrap;">${cleanMessage}</p>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 12px; color: #94a3b8;">
    <p style="margin: 0;">Repository: <a href="https://github.com/AuroraBytesX/PrepQuarters" style="color: #10b981; text-decoration: none;">https://github.com/AuroraBytesX/PrepQuarters</a></p>
  </div>
</div>
`.trim();

  // 1. Check for Resend API Key
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "PrepQuarters <onboarding@resend.dev>",
          to: [recipient],
          reply_to: cleanEmail,
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        console.log(`[EMAIL_DELIVERY_SUCCESS] Dispatched via Resend API to ${recipient} (ID: ${resendData.id})`);
        return {
          success: true,
          delivered: true,
          provider: "resend",
          messageId: resendData.id,
          recipient,
          message: "Message sent successfully to support.",
        };
      }
    } catch (err) {
      console.error(`[EMAIL_DELIVERY_ERROR] Resend API fetch failed:`, err.message);
    }
  }

  // 2. Check for SMTP Configuration (Gmail SMTP)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const cleanUser = process.env.SMTP_USER.trim();
      const info = await transporter.sendMail({
        from: `"${cleanName} via PrepQuarters" <${cleanUser}>`,
        to: recipient,
        replyTo: cleanEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[EMAIL_DELIVERY_SUCCESS] Dispatched via SMTP to ${recipient} (MessageID: ${info.messageId})`);
      return {
        success: true,
        delivered: true,
        provider: "smtp",
        messageId: info.messageId,
        recipient,
        message: "Message sent successfully to support.",
      };
    } catch (err) {
      console.error(`[EMAIL_DELIVERY_ERROR] SMTP delivery failed:`, err.message);
      return {
        success: false,
        delivered: false,
        error: err.message,
        message: "Email delivery failed to connect to SMTP provider.",
      };
    }
  }

  console.warn(
    `[EMAIL_CONFIG_NOTICE] EMAIL DELIVERY BLOCKED - MISSING ENVIRONMENT VARIABLE: Requires SMTP_USER & SMTP_PASS or RESEND_API_KEY in server/.env.\n` +
    `[CONTACT_SUBMISSION_RECORDED] From: ${cleanName} <${cleanEmail}> -> To: ${recipient} | Length: ${cleanMessage.length} chars`
  );

  return {
    success: false,
    delivered: false,
    configured: false,
    recipient,
    error: "EMAIL DELIVERY BLOCKED - MISSING ENVIRONMENT VARIABLE",
    missingConfig: ["SMTP_USER", "SMTP_PASS", "RESEND_API_KEY"],
    message: "Email delivery blocked: Missing SMTP_USER and SMTP_PASS or RESEND_API_KEY in server configuration.",
  };
}

/**
 * Sends a 6-digit password reset verification code to the user's email.
 */
async function sendPasswordResetEmail({ email = "", name = "Candidate", resetCode = "" }) {
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = cleanDisallowedChars(String(name).trim() || "Candidate");
  const cleanCode = String(resetCode).trim();
  const timestamp = new Date().toUTCString();

  if (!isValidEmail(cleanEmail) || !cleanCode) {
    return {
      success: false,
      delivered: false,
      error: "Invalid email or reset code.",
    };
  }

  const subject = `PrepQuarters Password Reset Code: ${cleanCode}`;
  const textContent = `
PrepQuarters Security Alert: Password Reset Request
===================================================
Hello ${cleanName},

We received a request to reset the password for your PrepQuarters account (${cleanEmail}).

Your 6-Digit Password Reset Verification Code:
---------------------------------------------
>> ${cleanCode} <<
---------------------------------------------

This verification code is valid for 15 minutes.
Enter this code in the password recovery window along with your new password.

If you did not request this password reset, please ignore this email. Your password will remain unchanged.

Security & Support: https://github.com/AuroraBytesX/PrepQuarters
`.trim();

  const htmlContent = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 28px; color: #1e293b;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #0f172a; margin: 0; font-size: 20px;">PrepQuarters Security Verification</h2>
    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Password Reset Authorization Code</p>
  </div>

  <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 16px;">
    Hello <strong>${cleanName}</strong>,
  </p>

  <p style="font-size: 14px; color: #334155; line-height: 1.5; margin: 0 0 20px;">
    We received a request to reset your password for <strong>${cleanEmail}</strong>. Use the 6-digit verification code below to authorize your new password:
  </p>

  <div style="text-align: center; margin: 24px 0;">
    <div style="font-family: 'JetBrains Mono', Consolas, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #059669; background: #f0fdf4; border: 2px dashed #10b981; padding: 14px 28px; border-radius: 10px; display: inline-block;">
      ${cleanCode}
    </div>
  </div>

  <div style="background: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
    <p style="font-size: 12px; color: #64748b; margin: 0; line-height: 1.5;">
      <strong>Note:</strong> This verification code will expire in <strong>15 minutes</strong>. Never share this code with anyone. If you did not request this password reset, your account is safe and no action is required.
    </p>
  </div>

  <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center;">
    <p style="margin: 0;">PrepQuarters Engineering Platform &bull; <a href="https://github.com/AuroraBytesX/PrepQuarters" style="color: #10b981; text-decoration: none;">GitHub Repository</a></p>
  </div>
</div>
`.trim();

  // 1. Resend API Transport
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM_EMAIL || "PrepQuarters Security <security@resend.dev>",
          to: [cleanEmail],
          subject,
          text: textContent,
          html: htmlContent,
        }),
      });

      const resendData = await resendRes.json();
      if (resendRes.ok) {
        console.log(`[RESET_EMAIL_SUCCESS] Verification code dispatched via Resend to ${cleanEmail}`);
        return { success: true, delivered: true, provider: "resend", messageId: resendData.id };
      }
    } catch (err) {
      console.error(`[RESET_EMAIL_ERROR] Resend delivery failed:`, err.message);
    }
  }

  // 2. SMTP Transport (Gmail / Custom SMTP)
  const transporter = getSmtpTransporter();
  if (transporter) {
    try {
      const cleanUser = process.env.SMTP_USER.trim();
      const info = await transporter.sendMail({
        from: `"PrepQuarters Security" <${cleanUser}>`,
        to: cleanEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`[RESET_EMAIL_SUCCESS] Verification code dispatched via SMTP to ${cleanEmail} (ID: ${info.messageId})`);
      return { success: true, delivered: true, provider: "smtp", messageId: info.messageId };
    } catch (err) {
      console.error(`[RESET_EMAIL_ERROR] SMTP password reset email failed:`, err.message);
      return { success: false, delivered: false, error: err.message };
    }
  }

  console.warn(`[RESET_EMAIL_NOTICE] No SMTP/API provider configured to dispatch password reset code.`);
  return { success: false, delivered: false, error: "No email transport configured." };
}

module.exports = {
  isValidEmail,
  sendContactEmail,
  sendPasswordResetEmail,
};
