import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { departmentsApi } from "../api/departments";

type Toggle =
  | { kind: "department"; departmentKey: string; enabled: boolean }
  | {
      kind: "responsibility";
      departmentKey: string;
      responsibilityKey: string;
      enabled: boolean;
    };

export function Departments() {
  const { selectedCompanyId } = useCompany();
  const queryClient = useQueryClient();

  const catalog = useQuery({
    queryKey: ["department-catalog"],
    queryFn: departmentsApi.catalog,
  });

  const saved = useQuery({
    queryKey: ["departments", selectedCompanyId],
    queryFn: () => departmentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const mutation = useMutation({
    mutationFn: async (change: Toggle): Promise<void> => {
      if (!selectedCompanyId) {
        throw new Error("Select a company first");
      }

      if (change.kind === "department") {
        await departmentsApi.toggleDepartment(
          selectedCompanyId,
          change.departmentKey,
          change.enabled
        );
        return;
      }

      if (change.kind !== "responsibility") {
        throw new Error("Invalid responsibility action");
      }

      await departmentsApi.toggleResponsibility(
        selectedCompanyId,
        change.departmentKey,
        change.responsibilityKey,
        change.enabled
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["departments", selectedCompanyId],
      });
    },
  });

  if (!selectedCompanyId) {
    return <div className="p-6">Select a company first.</div>;
  }

  if (catalog.isPending || saved.isPending) {
    return <div className="p-6">Loading departments...</div>;
  }

  if (catalog.isError || saved.isError) {
    return (
      <div className="p-6 text-red-500">
        {String(catalog.error?.message ?? saved.error?.message)}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enable departments and select the responsibilities your
          company needs. Employees can be assigned later.
        </p>
      </div>

      {mutation.isError && (
        <div role="alert" className="text-sm text-red-500">
          Unable to save: {mutation.error.message}
        </div>
      )}

      {catalog.data?.map((department) => {
        const current = saved.data?.find(
          (item) => item.templateKey === department.key
        );

        const enabled = current?.enabled ?? false;

        return (
          <section
            key={department.key}
            className="rounded-lg border p-5"
          >
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={enabled}
                disabled={mutation.isPending || saved.isFetching}
                onChange={(event) =>
                  mutation.mutate({
                    kind: "department",
                    departmentKey: department.key,
                    enabled: event.target.checked,
                  })
                }
              />
              <span>
                <span className="block font-semibold">
                  {department.name}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {department.description}
                </span>
              </span>
            </label>

            {enabled ? (
              <div className="ml-7 mt-4 space-y-3 border-l pl-4">
                <div className="text-sm font-medium">
                  Responsibilities
                </div>

                {department.responsibilities.map((responsibility) => {
                  const selected = current?.responsibilities.find(
                    (item) => item.templateKey === responsibility.key
                  );

                  return (
                    <label
                      key={responsibility.key}
                      className="flex cursor-pointer items-start gap-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected?.enabled ?? false}
                        disabled={mutation.isPending || saved.isFetching}
                        onChange={(event) =>
                          mutation.mutate({
                            kind: "responsibility",
                            departmentKey: department.key,
                            responsibilityKey: responsibility.key,
                            enabled: event.target.checked,
                          })
                        }
                      />
                      <span>
                        <span className="block text-sm font-medium">
                          {responsibility.name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {responsibility.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <div className="ml-7 mt-3 text-xs text-muted-foreground">
                {department.responsibilities
                  .map((item) => item.name)
                  .join(" · ")}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
