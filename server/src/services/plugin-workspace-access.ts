
import { and, eq } from "drizzle-orm";
import {
  plugins,
  pluginCompanySettings,
  type Db,
} from "@paperclipai/db";
import type {
  ResolveWorkspaceAccessRequest,
  ResolveWorkspaceAccessResult,
} from "@paperclipai/shared";
import type { PluginWorkerManager } from "./plugin-worker-manager.js";

const MAX_DIRECTORIES = 32;
const TIMEOUT_MS = 5_000;

export interface PluginWorkspaceAccessRequest {
  pluginId: string;
  folderKey: string;
  path: string;
  access: "read" | "write";
  description?: string;
}

export async function resolvePluginWorkspaceAccess(
  db: Db,
  manager: PluginWorkerManager | undefined,
  request: ResolveWorkspaceAccessRequest,
): Promise<PluginWorkspaceAccessRequest[]> {
  if (!manager) return [];

  const installed = await db.select().from(plugins)
    .where(eq(plugins.status, "ready"));

  const disabled = await db.select({
    pluginId: pluginCompanySettings.pluginId,
  }).from(pluginCompanySettings).where(and(
    eq(pluginCompanySettings.companyId, request.companyId),
    eq(pluginCompanySettings.enabled, false),
  ));

  const disabledIds = new Set(disabled.map(row => row.pluginId));

  const eligible = installed.filter(plugin =>
    !disabledIds.has(plugin.id) &&
    plugin.manifestJson.workspaceAccess === true &&
    plugin.manifestJson.capabilities.includes("agents.workspace.access")
  ).sort((a, b) => a.id.localeCompare(b.id));

  const directories: PluginWorkspaceAccessRequest[] = [];

  for (const plugin of eligible) {
    const result: ResolveWorkspaceAccessResult = await manager.call(
      plugin.id,
      "resolveWorkspaceAccess",
      request,
      TIMEOUT_MS,
    );

    if (!result || !Array.isArray(result.directories)) {
      throw new Error(`Invalid workspace access result from ${plugin.id}`);
    }

    if (result.directories.length > MAX_DIRECTORIES) {
      throw new Error(`Too many workspace directories from ${plugin.id}`);
    }

    for (const directory of result.directories) {
      if (
        !directory ||
        typeof directory.folderKey !== "string" ||
        directory.folderKey.length === 0 ||
        directory.folderKey.length > 100 ||
        typeof directory.path !== "string" ||
        directory.path.length === 0 ||
        directory.path.length > 1024 ||
        !["read", "write"].includes(directory.access) ||
        (
          directory.description !== undefined &&
          (
            typeof directory.description !== "string" ||
            directory.description.length > 300
          )
        )
      ) {
        throw new Error(`Invalid workspace directory from ${plugin.id}`);
      }

      directories.push({
        pluginId: plugin.id,
        folderKey: directory.folderKey,
        path: directory.path,
        access: directory.access,
        description: directory.description,
      });
    }
  }

  return directories;
}
