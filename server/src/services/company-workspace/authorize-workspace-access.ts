
import { promises as fs } from "node:fs";
import { and, eq } from "drizzle-orm";
import {
  plugins,
  pluginCompanySettings,
  type Db,
} from "@paperclipai/db";
import {
  getStoredLocalFolders,
  inspectPluginLocalFolder,
  requireLocalFolderDeclaration,
  resolvePluginLocalFolderPath,
} from "../plugin-local-folders.js";
import type { PluginWorkspaceAccessRequest } from "../plugin-workspace-access.js";

export interface AuthorizedWorkspaceDirectory {
  pluginId: string;
  folderKey: string;
  path: string;
  access: "read" | "write";
  description?: string;
}

export async function authorizeWorkspaceAccess(
  db: Db,
  companyId: string,
  requests: PluginWorkspaceAccessRequest[],
): Promise<AuthorizedWorkspaceDirectory[]> {
  const authorized: AuthorizedWorkspaceDirectory[] = [];

  for (const request of requests) {
    const [plugin] = await db.select().from(plugins)
      .where(eq(plugins.id, request.pluginId));

    if (!plugin || plugin.status !== "ready") {
      throw new Error("Workspace access plugin is unavailable");
    }

    const [settings] = await db.select()
      .from(pluginCompanySettings)
      .where(and(
        eq(pluginCompanySettings.pluginId, request.pluginId),
        eq(pluginCompanySettings.companyId, companyId),
      ));

    if (settings?.enabled === false) {
      throw new Error("Workspace access plugin is disabled");
    }

    const declaration = requireLocalFolderDeclaration(
      plugin.manifestJson.localFolders,
      request.folderKey,
    );

    const stored = getStoredLocalFolders(settings?.settingsJson);
    const status = await inspectPluginLocalFolder({
      folderKey: request.folderKey,
      declaration,
      storedConfig: stored[request.folderKey] ?? null,
    });

    if (!status.configured || !status.realPath || !status.readable || !status.healthy) {
      throw new Error(`Workspace folder unavailable: ${request.folderKey}`);
    }

    if (
      request.access === "write" &&
      (status.access !== "readWrite" || !status.writable)
    ) {
      throw new Error(`Workspace folder is not writable: ${request.folderKey}`);
    }

    const resolved = await resolvePluginLocalFolderPath(
      status.realPath,
      request.path,
      { mustExist: true },
    );

    const stat = await fs.stat(resolved.realPath);
    if (!stat.isDirectory()) {
      throw new Error(`Workspace path is not a directory: ${request.path}`);
    }

    authorized.push({
      pluginId: request.pluginId,
      folderKey: request.folderKey,
      path: resolved.realPath,
      access: request.access,
      description: request.description,
    });
  }

  return authorized;
}
