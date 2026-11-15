import { and, eq, inArray } from "drizzle-orm";
import {
  plugins,
  pluginCompanySettings,
  type Db,
} from "@paperclipai/db";
import type {
  ResolveRunContextRequest,
  ResolveRunContextResult,
} from "@paperclipai/shared";
import type { PluginWorkerManager } from "./plugin-worker-manager.js";

const MAX_CONTRIBUTIONS = 16;
const MAX_CONTENT_LENGTH = 32_768;
const TIMEOUT_MS = 5_000;

export async function resolvePluginRunContext(
  db: Db,
  manager: PluginWorkerManager | undefined,
  request: ResolveRunContextRequest,
): Promise<ResolveRunContextResult> {
  if (!manager) return { contributions: [] };

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
    plugin.manifestJson.runContext === true &&
    plugin.manifestJson.capabilities.includes("agents.context.provide")
  ).sort((a, b) => a.id.localeCompare(b.id));

  const contributions: ResolveRunContextResult["contributions"] = [];

  for (const plugin of eligible) {
    const result = await manager.call(
      plugin.id,
      "resolveRunContext",
      request,
      TIMEOUT_MS,
    );

    if (!result || !Array.isArray(result.contributions)) {
      throw new Error(`Invalid run context result from ${plugin.id}`);
    }

    if (result.contributions.length > MAX_CONTRIBUTIONS) {
      throw new Error(`Too many context contributions from ${plugin.id}`);
    }

    for (const contribution of result.contributions) {
      if (
        !contribution ||
        typeof contribution.key !== "string" ||
        !/^[a-zA-Z0-9_-]{1,64}$/.test(contribution.key) ||
        typeof contribution.version !== "string" ||
        contribution.version.length > 128 ||
        typeof contribution.content !== "string" ||
        contribution.content.length > MAX_CONTENT_LENGTH
      ) {
        throw new Error(`Invalid context contribution from ${plugin.id}`);
      }

      contributions.push({
        key: `${plugin.id}:${contribution.key}`,
        version: contribution.version,
        content: contribution.content,
      });
    }
  }

  return { contributions };
}
