// Worker entry. Static files (index.html) are served automatically.
// This script only handles the /api/songs API.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/songs") {
      if (request.method === "GET")  return listSongs(env);
      if (request.method === "POST") return addSong(request, env);
      if (request.method === "PUT")  return updateSong(request, env);
      return new Response("Method not allowed", { status: 405 });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function listSongs(env) {
  const { results } = await env.DB
    .prepare("SELECT id, name, title, performer, url, info_url, comment, created_at FROM songs ORDER BY id DESC")
    .all();
  return Response.json(results);
}

// shared field reading + validation for add and update
function readFields(body) {
  const f = {
    name:      (body.name || "").trim(),
    title:     (body.title || "").trim(),
    performer: (body.performer || "").trim(),
    link:      (body.url || "").trim(),
    infoLink:  (body.info_url || "").trim(),
    comment:   (body.comment || "").trim(),
  };
  if (!f.name || !f.title || !f.performer) return { error: "Name, title, and artist are required." };
  if (f.name.length > 60 || f.title.length > 120 || f.performer.length > 120)
    return { error: "One of the fields is too long." };
  if (f.link && !/^https?:\/\/.+/i.test(f.link)) return { error: "Song link must start with http:// or https://" };
  if (f.infoLink && !/^https?:\/\/.+/i.test(f.infoLink)) return { error: "Info link must start with http:// or https://" };
  if (f.link.length > 500 || f.infoLink.length > 500) return { error: "A link is too long." };
  if (f.comment.length > 2000) return { error: "Comment is too long." };
  return { fields: f };
}

async function addSong(request, env) {
  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON"); }

  const { fields: f, error } = readFields(body);
  if (error) return bad(error);

  await env.DB
    .prepare("INSERT INTO songs (name, title, performer, url, info_url, comment) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(f.name, f.title, f.performer, f.link || null, f.infoLink || null, f.comment || null)
    .run();

  return Response.json({ ok: true }, { status: 201 });
}

async function updateSong(request, env) {
  let body;
  try { body = await request.json(); } catch { return bad("Invalid JSON"); }

  const id = parseInt(body.id, 10);
  if (!id) return bad("Missing or invalid id.");

  const { fields: f, error } = readFields(body);
  if (error) return bad(error);

  await env.DB
    .prepare("UPDATE songs SET name=?, title=?, performer=?, url=?, info_url=?, comment=? WHERE id=?")
    .bind(f.name, f.title, f.performer, f.link || null, f.infoLink || null, f.comment || null, id)
    .run();

  return Response.json({ ok: true });
}

const bad = (message) => Response.json({ error: message }, { status: 400 });
