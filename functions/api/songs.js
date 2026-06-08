
// Cloudflare Pages Function — routed at /api/songs
export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare("SELECT id, name, title, performer, url, created_at FROM songs ORDER BY id DESC")
    .all();
  return Response.json(results);
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }

  const name = (body.name || "").trim();
  const title = (body.title || "").trim();
  const performer = (body.performer || "").trim();
  const url = (body.url || "").trim();

  if (!name || !title || !performer) return bad("Name, title, and performer are required.");
  if (name.length > 60 || title.length > 120 || performer.length > 120)
    return bad("One of the fields is too long.");
  if (url && !/^https?:\/\/.+/i.test(url)) return bad("Link must start with http:// or https://");
  if (url.length > 500) return bad("Link is too long.");

  await env.DB
    .prepare("INSERT INTO songs (name, title, performer, url) VALUES (?, ?, ?, ?)")
    .bind(name, title, performer, url || null)
    .run();

  return Response.json({ ok: true }, { status: 201 });
}

const bad = (message) => Response.json({ error: message }, { status: 400 });
