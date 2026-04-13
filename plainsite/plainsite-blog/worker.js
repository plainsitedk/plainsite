const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // POST /login
    if (path === '/login' && request.method === 'POST') {
      const { password } = await request.json();
      if (password === env.BLOG_PASSWORD) {
        return json({ ok: true, token: env.BLOG_TOKEN });
      }
      return json({ ok: false }, 401);
    }

    // GET /posts — offentlig liste
    if (path === '/posts' && request.method === 'GET') {
      const index = await env.BLOG_POSTS.get('index');
      return json(index ? JSON.parse(index) : []);
    }

    // GET /posts/:slug — offentligt opslag
    if (path.startsWith('/posts/') && request.method === 'GET') {
      const slug = path.slice(7);
      const post = await env.BLOG_POSTS.get(`post:${slug}`);
      if (!post) return json({ error: 'Not found' }, 404);
      return json(JSON.parse(post));
    }

    // Alle nedenstående kræver auth
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token !== env.BLOG_TOKEN) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }

    // POST /posts — opret
    if (path === '/posts' && request.method === 'POST') {
      const { title, content } = await request.json();
      const slug = slugify(title) + '-' + Date.now();
      const post = { slug, title, content, date: new Date().toISOString().slice(0, 10) };

      await env.BLOG_POSTS.put(`post:${slug}`, JSON.stringify(post));

      const indexRaw = await env.BLOG_POSTS.get('index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      index.unshift({ slug, title, date: post.date });
      await env.BLOG_POSTS.put('index', JSON.stringify(index));

      return json({ ok: true, slug });
    }

    // PUT /posts/:slug — opdater
    if (path.startsWith('/posts/') && request.method === 'PUT') {
      const slug = path.slice(7);
      const existing = await env.BLOG_POSTS.get(`post:${slug}`);
      if (!existing) return json({ error: 'Not found' }, 404);

      const { title, content } = await request.json();
      const post = { ...JSON.parse(existing), title, content };
      await env.BLOG_POSTS.put(`post:${slug}`, JSON.stringify(post));

      const indexRaw = await env.BLOG_POSTS.get('index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      const i = index.findIndex(p => p.slug === slug);
      if (i !== -1) index[i].title = title;
      await env.BLOG_POSTS.put('index', JSON.stringify(index));

      return json({ ok: true });
    }

    // DELETE /posts/:slug — slet
    if (path.startsWith('/posts/') && request.method === 'DELETE') {
      const slug = path.slice(7);
      await env.BLOG_POSTS.delete(`post:${slug}`);

      const indexRaw = await env.BLOG_POSTS.get('index');
      const index = indexRaw ? JSON.parse(indexRaw) : [];
      await env.BLOG_POSTS.put('index', JSON.stringify(index.filter(p => p.slug !== slug)));

      return json({ ok: true });
    }

    return json({ error: 'Not found' }, 404);
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/æ/g, 'ae').replace(/ø/g, 'oe').replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
