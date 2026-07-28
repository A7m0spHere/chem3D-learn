import { access, copyFile, mkdir, readdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distRoot = path.join(frontendRoot, "dist");
const clientRoot = path.join(distRoot, "client");
const serverRoot = path.join(distRoot, "server");
const workerSource = path.join(
  frontendRoot,
  "deployment",
  "sites-worker.mjs",
);

await access(path.join(distRoot, "index.html"));
await rm(clientRoot, { force: true, recursive: true });
await rm(serverRoot, { force: true, recursive: true });
await mkdir(clientRoot, { recursive: true });

const entries = await readdir(distRoot, { withFileTypes: true });
for (const entry of entries) {
  if ([".openai", "client", "server"].includes(entry.name)) {
    continue;
  }

  await rename(
    path.join(distRoot, entry.name),
    path.join(clientRoot, entry.name),
  );
}

await mkdir(serverRoot, { recursive: true });
await copyFile(workerSource, path.join(serverRoot, "index.js"));
