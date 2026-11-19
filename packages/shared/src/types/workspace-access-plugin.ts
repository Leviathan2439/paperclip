/**
 * Request sent to plugins when an agent execution is being prepared.
 */
export interface ResolveWorkspaceAccessRequest {
  companyId: string;
  agentId: string;
  runId: string;
  issueId?: string | null;
  projectId?: string | null;
}

/**
 * Directory access requested by a plugin.
 * Paths are relative to an administrator-authorized storage root.
 */
export interface WorkspaceAccessDirectory {
  folderKey: string;
  path: string;
  access: "read" | "write";
  description?: string;
}

/**
 * Requested filesystem access for the current agent execution.
 *
 * Paperclip core must validate and authorize all directories.
 */
export interface ResolveWorkspaceAccessResult {
  directories: WorkspaceAccessDirectory[];
}

