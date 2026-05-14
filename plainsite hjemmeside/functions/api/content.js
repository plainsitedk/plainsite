const ADMIN_PASSWORD = 'FJDK ii843';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

function auth(request) {
  const header = request.headers.get('Authorization') || '';
  const token = header.replace('Bearer ', '').trim();
  return token === ADMIN_PASSWORD;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: cors });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const meta = url.searchParams.get('meta');
  const site = url.searchParams.get('site');

  // GET /api/content?meta=sites → sites list
  if (meta === 'sites') {
    const raw = await env.BLOG_KV.get('admin:sites');
    return json(raw ? JSON.parse(raw) : []);
  }

  // GET /api/content?site=xxx&meta=schema → field schema
  if (site && meta === 'schema') {
    const raw = await env.BLOG_KV.get(`content:${site}:_schema`);
    return json(raw ? JSON.parse(raw) : []);
  }

  // GET /api/content?site=xxx → all field values as flat object
  if (site) {
    const schemaRaw = await env.BLOG_KV.get(`content:${site}:_schema`);
    const schema = schemaRaw ? JSON.parse(schemaRaw) : [];
    const result = {};
    await Promise.all(
      schema.map(async (field) => {
        const val = await env.BLOG_KV.get(`content:${site}:${field.id}`);
        result[field.id] = val !== null ? val : (field.default || '');
      })
    );
    return json(result);
  }

  return json({ error: 'Missing query params' }, 400);
}

export async function onRequestPut({ request, env }) {
  if (!auth(request)) return json({ error: 'Unauthorized' }, 401);

  const body = await request.json();

  // {sites: [...]} → save sites list
  if (body.sites !== undefined) {
    await env.BLOG_KV.put('admin:sites', JSON.stringify(body.sites));
    return json({ ok: true });
  }

  // {site, schema: [...]} → save field schema
  if (body.site && body.schema !== undefined) {
    await env.BLOG_KV.put(`content:${body.site}:_schema`, JSON.stringify(body.schema));
    return json({ ok: true });
  }

  // {site, key, value} → save single field value
  if (body.site && body.key !== undefined && body.value !== undefined) {
    await env.BLOG_KV.put(`content:${body.site}:${body.key}`, body.value);
    return json({ ok: true });
  }

  return json({ error: 'Invalid body' }, 400);
}
