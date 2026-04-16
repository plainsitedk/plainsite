const ADMIN_PASSWORD = 'FJDK ii843';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
  return header.replace('Bearer ', '').trim() === ADMIN_PASSWORD;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Blog API
    if (url.pathname === '/api/blog') {
      if (request.method === 'GET') {
        const raw = await env.BLOG_KV.get('posts');
        const posts = raw ? JSON.parse(raw) : [];
        return json(posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      if (request.method === 'POST') {
        if (!auth(request)) return json({ error: 'Unauthorized' }, 401);
        const body = await request.json();
        const raw = await env.BLOG_KV.get('posts');
        const posts = raw ? JSON.parse(raw) : [];
        const post = {
          id: 'post_' + Date.now(),
          title: body.title || '',
          content: body.content || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        posts.push(post);
        await env.BLOG_KV.put('posts', JSON.stringify(posts));
        return json(post, 201);
      }

      if (request.method === 'PUT') {
        if (!auth(request)) return json({ error: 'Unauthorized' }, 401);
        const body = await request.json();
        const raw = await env.BLOG_KV.get('posts');
        const posts = raw ? JSON.parse(raw) : [];
        const idx = posts.findIndex(p => p.id === body.id);
        if (idx < 0) return json({ error: 'Not found' }, 404);
        posts[idx] = { ...posts[idx], title: body.title, content: body.content, updatedAt: new Date().toISOString() };
        await env.BLOG_KV.put('posts', JSON.stringify(posts));
        return json(posts[idx]);
      }

      if (request.method === 'DELETE') {
        if (!auth(request)) return json({ error: 'Unauthorized' }, 401);
        const body = await request.json();
        const raw = await env.BLOG_KV.get('posts');
        const posts = raw ? JSON.parse(raw) : [];
        await env.BLOG_KV.put('posts', JSON.stringify(posts.filter(p => p.id !== body.id)));
        return json({ ok: true });
      }
    }

    // Static assets fallback
    return env.ASSETS.fetch(request);
  }
};
