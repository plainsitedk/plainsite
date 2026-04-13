export default {
  async fetch(request, env) {

    if (request.method === 'OPTIONS') {
      return corsHeaders();
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return json({ ok: false }, 400);
    }

    // Validate token
    const token = formData.get('_token');
    if (!token) return json({ ok: false }, 400);

    const recipient = await env.FORM_TOKENS.get(token);
    if (!recipient) return json({ ok: false }, 403);

    // Collect form fields (skip internal _ fields)
    const fields = [];
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith('_') && String(value).trim()) {
        fields.push({ key, value: String(value).trim() });
      }
    }

    // Use submitter's email as reply-to if present
    const replyTo = formData.get('email') || null;

    // Build email
    const html = buildHtml(fields);
    const text = fields.map(({ key, value }) => `${label(key)}: ${value}`).join('\n\n');

    const payload = {
      from: 'Plainsite Forms <forms@plainsite.dk>',
      to: recipient,
      subject: 'Ny henvendelse fra din hjemmeside',
      html,
      text,
    };
    if (replyTo) payload.reply_to = replyTo;

    // Send via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) return json({ ok: false }, 500);
    return json({ ok: true });
  },
};

function buildHtml(fields) {
  const rows = fields.map(({ key, value }) => `
    <tr>
      <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#666;white-space:nowrap;vertical-align:top;border-bottom:1px solid #f0f0f0;">${label(key)}</td>
      <td style="padding:10px 16px;font-size:14px;color:#1a1a1a;border-bottom:1px solid #f0f0f0;">${value}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:32px;font-family:sans-serif;background:#f5f5f5;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e8e8;">
    <div style="background:#0A6B46;padding:20px 24px;">
      <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Plainsite</p>
      <h1 style="margin:4px 0 0;font-size:18px;color:#fff;font-weight:600;">Ny henvendelse</h1>
    </div>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <div style="padding:16px 24px;background:#fafafa;border-top:1px solid #f0f0f0;">
      <p style="margin:0;font-size:11px;color:#aaa;">Sendt via plainsite forms · Svar direkte på denne email for at kontakte afsenderen</p>
    </div>
  </div>
</body>
</html>`;
}

function label(key) {
  const labels = {
    name: 'Navn',
    email: 'Email',
    message: 'Besked',
    package: 'Pakke',
    business: 'Specialitet',
    phone: 'Telefon',
  };
  return labels[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '));
}

function corsHeaders() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
