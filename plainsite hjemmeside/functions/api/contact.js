const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const { name, email, phone, message } = body;
  if (!name || !email) {
    return new Response(JSON.stringify({ error: 'Navn og e-mail er påkrævet' }), {
      status: 422, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  const text = [
    `Navn: ${name}`,
    `E-mail: ${email}`,
    phone ? `Telefon: ${phone}` : null,
    message ? `\nBesked:\n${message}` : null,
  ].filter(Boolean).join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'plainsite kontakt <noreply@plainsite.dk>',
      to: ['kontakt@plainsite.dk'],
      reply_to: email,
      subject: `Ny henvendelse fra ${name}`,
      text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return new Response(JSON.stringify({ error: `Resend fejl: ${err}` }), {
      status: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }

  // Track lead in kundeportal (fire-and-forget)
  try {
    await fetch('https://kunde.plainsite.dk/api/track-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host: 'plainsite.dk' }),
    });
  } catch {}

  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
