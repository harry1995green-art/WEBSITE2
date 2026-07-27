import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

// On Railway/Render/Fly, mount a persistent volume and point UPLOAD_DIR at
// it (e.g. /data/uploads) so photos survive redeploys. Falls back to
// public/uploads for local dev, which Next also happens to serve statically.
const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(file: File, subdir: string) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).replace(/[^a-zA-Z0-9.]/g, "").slice(0, 10);
  const filename = `${crypto.randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/api/uploads/${subdir}/${filename}`;
}

export async function deleteUploadedFile(url: string) {
  if (!url.startsWith("/api/uploads/")) return;
  const relative = url.slice("/api/uploads/".length);
  await unlink(resolveUploadPath(relative)).catch(() => {});
}

// Resolves a request path (already split on "/") to a file inside
// UPLOAD_ROOT, rejecting any attempt to escape it via "..".
export function resolveUploadPath(relative: string) {
  const filePath = path.join(UPLOAD_ROOT, relative);
  if (!filePath.startsWith(UPLOAD_ROOT)) {
    throw new Error("Invalid upload path");
  }
  return filePath;
}
