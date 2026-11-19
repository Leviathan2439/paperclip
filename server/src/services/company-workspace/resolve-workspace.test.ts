
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { resolveWorkspace } from "./resolve-workspace.js";

function testWorkspace(
  mounts: Array<{
    source: string;
    target: string;
    access: string;
  }>,
  run: (root: string, manifest: string) => void
) {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "company-workspace-")
  );

  try {
    fs.mkdirSync(path.join(root, "shared"));
    const manifest = path.join(root, "manifest.json");

    fs.writeFileSync(
      manifest,
      JSON.stringify({
        schemaVersion: 1,
        name: "Test Workspace",
        mounts,
      })
    );

    run(root, manifest);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

describe("Company Workspace Resolver", () => {
  it("accepts an authorized directory", () => {
    testWorkspace(
      [{ source: "shared", target: "company", access: "read" }],
      (root, manifest) => {
        const result = resolveWorkspace(root, manifest);

        expect(result).toHaveLength(1);
        expect(result[0].target).toBe("company");
        expect(result[0].access).toBe("read");
      }
    );
  });

  it("rejects directory traversal", () => {
    testWorkspace(
      [{ source: "../outside", target: "company", access: "read" }],
      (root, manifest) => {
        expect(() => resolveWorkspace(root, manifest)).toThrow();
      }
    );
  });

  it("rejects invalid permissions", () => {
    testWorkspace(
      [{ source: "shared", target: "company", access: "admin" }],
      (root, manifest) => {
        expect(() => resolveWorkspace(root, manifest)).toThrow();
      }
    );
  });

  it("rejects duplicate mount targets", () => {
    testWorkspace(
      [
        { source: "shared", target: "company", access: "read" },
        { source: "shared", target: "company", access: "write" },
      ],
      (root, manifest) => {
        expect(() => resolveWorkspace(root, manifest)).toThrow();
      }
    );
  });

  it("rejects symlinks escaping company storage", () => {
    testWorkspace(
      [{ source: "escape", target: "company", access: "read" }],
      (root, manifest) => {
        fs.symlinkSync(os.tmpdir(), path.join(root, "escape"));

        expect(() => resolveWorkspace(root, manifest)).toThrow();
      }
    );
  });
});


