// Worker entry. Static files (index.html) are served automatically.
// This script only handles the /api/songs API.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/songs") {
      if (request.method === "GET")  return listSongs(env);
      if (request.method === "POST") return addSong(request, env);
      return new Response("Method not allowed", { status: 405 });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function listSongs(env) {
  const { results } = await env.DB
    .prepare("SELECT id, name, title, performer, url, comment, created_at FROM songs ORDER BY id DESC")
    .all();
  return Response.json(results);
}

async function addSong(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid JSON");
  }

  const name      = (body.name || "").trim();
  const title     = (body.title || "").trim();
  const performer = (body.performer || "").trim();
  const link      = (body.url || "").trim();
  const comment   = (body.comment || "").trim();

  if (!name || !title || !performer) return bad("Name, title, and performer are required.");
  if (name.length > 60 || title.length > 120 || performer.length > 120)
    return bad("One of the fields is too long.");
  if (link && !/^https?:\/\/.+/i.test(link)) return bad("Link must start with http:// or https://");
  if (link.length > 500) return bad("Link is too long.");
  if (comment.length > 2000) return bad("Comment is too long.");

  await env.DB
    .prepare("INSERT INTO songs (name, title, performer, url, comment) VALUES (?, ?, ?, ?, ?)")
    .bind(name, title, performer, link || null, comment || null)
    .run();

  return Response.json({ ok: true }, { status: 201 });
}

const bad = (message) => Response.json({ error: message }, { status: 400 });
