
/**
 * Request sent to a plugin before an agent execution starts.
 */
export interface ResolveRunContextRequest {
  companyId: string;
  agentId: string;
  runId: string;
  projectId?: string | null;
  issueId?: string | null;
}

/**
 * One instruction document contributed by a plugin.
 */
export interface RunContextContribution {
  key: string;
  content: string;
  version: string;
}

/**
 * Context supplied by a plugin for the current execution.
 */
export interface ResolveRunContextResult {
  contributions: RunContextContribution[];
}
