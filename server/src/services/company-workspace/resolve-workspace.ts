
import fs from "node:fs";
import path from "node:path";

type Access = "read" | "write";

type Mount = {
  source: string;
  target: string;
  access: Access;
};

type WorkspaceManifest = {
  schemaVersion: number;
  name: string;
  mounts: Mount[];
};

export function resolveWorkspace(
  companyRoot: string,
  manifestPath: string
) {
  const root = fs.realpathSync(companyRoot);

  const manifest: WorkspaceManifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf8")
  );

  if (manifest.schemaVersion !== 1) {
    throw new Error("Unsupported manifest version");
  }

  if (!Array.isArray(manifest.mounts)) {
    throw new Error("Invalid mounts configuration");
  }

  const targets = new Set<string>();

  return manifest.mounts.map((mount) => {
    if (
      !mount ||
      typeof mount.source !== "string" ||
      typeof mount.target !== "string" ||
      !["read", "write"].includes(mount.access)
    ) {
      throw new Error("Invalid mount definition");
    }

    if (
      path.isAbsolute(mount.source) ||
      !mount.source.trim() ||
      mount.source.split(/[\\/]/).includes("..")
    ) {
      throw new Error("Invalid source path");
    }

    if (
      !/^[a-zA-Z0-9_-]+$/.test(mount.target) ||
      targets.has(mount.target)
    ) {
      throw new Error("Invalid or duplicate target");
    }

    targets.add(mount.target);

    const source = fs.realpathSync(
      path.join(root, mount.source)
    );

    if (
      !source.startsWith(root + path.sep) ||
      !fs.statSync(source).isDirectory()
    ) {
      throw new Error("Source outside company workspace");
    }

    return {
      source,
      target: mount.target,
      access: mount.access,
    };
  });
}

