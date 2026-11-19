
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { buildLocalProcessSandboxSpawnTarget } from "./local-process-sandbox.js";

describe("authorized company filesystem access", () => {
  it.runIf(process.platform === "linux")(
    "enforces read, write, and denied directories",
    async () => {
      const root = await fs.mkdtemp(
        path.join(os.tmpdir(), "paperclip-grants-")
      );

      try {
        const workspace = path.join(root, "workspace");
        const shared = path.join(root, "shared");
        const tasks = path.join(root, "tasks");
        const secret = path.join(root, "secret");

        for (const dir of [workspace, shared, tasks, secret]) {
          await fs.mkdir(dir);
        }

        await fs.writeFile(path.join(shared, "policy.txt"), "PUBLIC");
        await fs.writeFile(path.join(secret, "private.txt"), "SECRET");

        const script = `
          test "$(cat "$1/policy.txt")" = "PUBLIC" || exit 10
          (echo MODIFIED > "$1/policy.txt") 2>/dev/null && exit 11
          echo CREATED > "$2/result.txt" || exit 12
          test ! -e "$3/private.txt" || exit 13
        `;

        const target = await buildLocalProcessSandboxSpawnTarget({
          executable: "/usr/bin/sh",
          args: ["-c", script, "sandbox-test", shared, tasks, secret],
          cwd: workspace,
          options: {
            workspaceDir: workspace,
            filesystemScope: "workspace",
            authorizedPaths: [
              { path: shared, access: "ro" },
              { path: tasks, access: "rw" },
            ],
          },
        });

        const result = spawnSync(target.command, target.args, {
          cwd: target.cwd,
          env: { ...process.env, ...target.env },
          encoding: "utf8",
        });

        expect(result.status, result.stderr).toBe(0);
        expect(await fs.readFile(path.join(shared, "policy.txt"), "utf8"))
          .toBe("PUBLIC");
        expect(await fs.readFile(path.join(tasks, "result.txt"), "utf8"))
          .toBe("CREATED\n");
      } finally {
        await fs.rm(root, { recursive: true, force: true });
      }
    }
  );

  it.runIf(process.platform === "linux")(
    "rejects overlapping read and write grants",
    async () => {
      const root = await fs.mkdtemp(
        path.join(os.tmpdir(), "paperclip-overlap-")
      );

      try {
        const workspace = path.join(root, "workspace");
        const shared = path.join(root, "shared");
        const nested = path.join(shared, "private");

        await fs.mkdir(workspace);
        await fs.mkdir(nested, { recursive: true });

        await expect(buildLocalProcessSandboxSpawnTarget({
          executable: "/usr/bin/true",
          args: [],
          cwd: workspace,
          options: {
            workspaceDir: workspace,
            filesystemScope: "workspace",
            authorizedPaths: [
              { path: shared, access: "ro" },
              { path: nested, access: "rw" },
            ],
          },
        })).rejects.toThrow("Conflicting authorized filesystem mount");
      } finally {
        await fs.rm(root, { recursive: true, force: true });
      }
    }
  );
});

