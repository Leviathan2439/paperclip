
import fs from "node:fs/promises";
import path from "node:path";
import { resolveWorkspace } from "./resolve-workspace.js";

export async function prepareCompanyWorkspace(input: {
  companyRoot: string;
  manifestPath: string;
  runtimeRoot: string;
  runId: string;
}) {
  const { companyRoot, manifestPath, runtimeRoot, runId } = input;

  if (!/^[a-zA-Z0-9_-]+$/.test(runId)) {
    throw new Error("Invalid run ID");
  }

  const mounts = resolveWorkspace(companyRoot, manifestPath);
  const base = path.join(runtimeRoot, runId);

  // Only initialize a new runtime directory.
  // Never overwrite an existing agent workspace.
  await fs.mkdir(runtimeRoot, { recursive: true });
  await fs.mkdir(base, { recursive: true });  



  for (const mount of mounts) {
    const target = path.join(base, mount.target);

    try {
      await fs.symlink(mount.source, target, "dir");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;

      const existing = await fs.readlink(target);
      if (existing !== mount.source) {
        throw new Error(`Workspace mount conflict: ${mount.target}`);
      }
    }    
  }

  return {
    cwd: base,
    directories: Object.fromEntries(
      mounts.map((mount) => [
        mount.target,
        {
          path: path.join(base, mount.target),
          access: mount.access,
        },
      ])
    ),
  };
}

