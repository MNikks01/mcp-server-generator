import { NextResponse } from "next/server";
import type { IR } from "@/lib/engine/ir/types";
import { build } from "@/lib/engine/generator/build";
import { getUserId } from "@/lib/identity";
import { getStore } from "@/lib/db/store";

export const runtime = "nodejs";

// Push a saved generation to a new GitHub repo. Free & open source — available to
// everyone. The token is supplied per request (a GitHub PAT with `repo` scope) and
// never stored. Uses the REST Contents API (no extra dependency). Production: replace
// the pasted token with GitHub OAuth.
function gh(path: string, token: string, init?: RequestInit) {
  return fetch("https://api.github.com" + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers ?? {}),
    },
  });
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: { code: "no_session", message: "Load the app first." } }, { status: 401 });
  const store = getStore();

  const body = await req.json().catch(() => ({}) as Record<string, unknown>);
  const generationId = body.generationId as string | undefined;
  const repoName = body.repoName as string | undefined;
  const isPrivate = Boolean(body.private);
  const token = (body.token as string | undefined) || process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json({ error: { code: "token_required", message: "Provide a GitHub token with `repo` scope." } }, { status: 400 });
  }

  const rec = generationId ? await store.getGeneration(generationId) : null;
  if (!rec || rec.userId !== userId) {
    return NextResponse.json({ error: { code: "not_found", message: "Generation not found." } }, { status: 404 });
  }

  const meRes = await gh("/user", token);
  if (!meRes.ok) return NextResponse.json({ error: { code: "bad_token", message: "Invalid GitHub token." } }, { status: 401 });
  const owner = (await meRes.json()).login as string;
  const name = (repoName || rec.name).replace(/[^a-zA-Z0-9._-]/g, "-");

  const createRes = await gh("/user/repos", token, {
    method: "POST",
    body: JSON.stringify({ name, private: isPrivate, auto_init: false }),
  });
  if (!createRes.ok && createRes.status !== 422 /* already exists */) {
    return NextResponse.json({ error: { code: "repo_failed", message: `Could not create repo (${createRes.status}).` } }, { status: 502 });
  }

  const result = await build(rec.ir as IR);
  for (const [filePath, content] of Object.entries(result.files)) {
    const put = await gh(`/repos/${owner}/${name}/contents/${filePath}`, token, {
      method: "PUT",
      body: JSON.stringify({ message: `add ${filePath}`, content: Buffer.from(content).toString("base64") }),
    });
    if (!put.ok) {
      return NextResponse.json({ error: { code: "push_failed", message: `Failed to push ${filePath} (${put.status}).` } }, { status: 502 });
    }
  }

  return NextResponse.json({ repoUrl: `https://github.com/${owner}/${name}` });
}
