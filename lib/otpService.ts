// lib/otpService.ts
// Pluggable OTP delivery service.
// ─────────────────────────────────────────────────────────────────────────────
// To connect a real provider:
//   MSG91:      Set MSG91_AUTH_KEY + MSG91_TEMPLATE_ID in .env.local
//   Twilio SMS: Set TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_PHONE_NUMBER
//   WhatsApp:   Set WHATSAPP_API_KEY (Interakt / Twilio WhatsApp Business API)
//
// In development (no keys set): OTP is logged to the terminal console.
// ─────────────────────────────────────────────────────────────────────────────

export async function sendOtp(phone: string, otp: string): Promise<void> {
  const isDev = process.env.NODE_ENV !== 'production';

  // ─── MSG91 (recommended for India) ────────────────────────────────────────
  if (process.env.MSG91_AUTH_KEY) {
    const response = await fetch('https://api.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': process.env.MSG91_AUTH_KEY,
      },
      body: JSON.stringify({
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${phone}`, // India prefix
        otp,
      }),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`MSG91 error: ${err}`);
    }
    return;
  }

  // ─── Twilio SMS (international) ───────────────────────────────────────────
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const body = new URLSearchParams({
      To:   `+91${phone}`,
      From: process.env.TWILIO_PHONE_NUMBER!,
      Body: `Your Seematra OTP is: ${otp}. Valid for 10 minutes. Do not share this with anyone.`,
    });
    const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Twilio error: ${err}`);
    }
    return;
  }

  // ─── Development fallback — log to console ────────────────────────────────
  if (isDev) {
    console.log(`\n🔐 [DEV OTP] Phone: +91${phone} → OTP: ${otp}\n`);
    return;
  }

  // Production without a configured provider
  throw new Error('No OTP provider configured. Set MSG91_AUTH_KEY or TWILIO_ACCOUNT_SID in .env.local');
}
