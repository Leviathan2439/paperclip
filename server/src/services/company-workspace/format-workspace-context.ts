
import type { AuthorizedWorkspaceDirectory } from "./authorize-workspace-access.js";

export function formatWorkspaceContext(
  directories: AuthorizedWorkspaceDirectory[],
): string {
  if (directories.length === 0) return "";

  const lines = [
    "## Authorized Company Workspace",
    "",
    "The following directories are available for company work.",
    "Use their absolute paths when reading or writing files.",
    "Do not create substitute directories in your isolated workspace.",
    "Read directories are read-only; Write directories permit modifications.",
  ];

  for (const access of ["read", "write"] as const) {
    const matching = directories.filter(
      (directory) => directory.access === access,
    );

    if (matching.length === 0) continue;

    lines.push("", `### ${access === "read" ? "Read" : "Write"}`);

    for (const directory of matching) {
      lines.push(`- \`${directory.path.replace(/`/g, "")}\``);

      if (directory.description) {
        const description = directory.description
          .replace(/[\r\n]+/g, " ")
          .trim();

        lines.push(`  ${description}`);
      }
    }
  }

  return lines.join("\n");
}
