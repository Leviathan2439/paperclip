import { api } from "./client";

export interface ResponsibilityTemplate {
  key: string;
  name: string;
  description: string;
  tasks: string[];
  procedures: string[];
  skills: string[];
  suggestedTools: string[];
}

export interface DepartmentTemplate {
  key: string;
  name: string;
  description: string;
  responsibilities: ResponsibilityTemplate[];
}

export interface SavedResponsibility {
  id: string;
  templateKey: string;
  enabled: boolean;
}

export interface SavedDepartment {
  id: string;
  templateKey: string | null;
  name: string;
  enabled: boolean;
  responsibilities: SavedResponsibility[];
}

const base = (companyId: string) =>
  `/companies/${encodeURIComponent(companyId)}/departments`;

export const departmentsApi = {
  catalog: () =>
    api.get<DepartmentTemplate[]>("/departments/catalog"),

  list: (companyId: string) =>
    api.get<SavedDepartment[]>(base(companyId)),

  toggleDepartment: (
    companyId: string,
    key: string,
    enabled: boolean
  ) =>
    api.put<SavedDepartment>(
      `${base(companyId)}/${encodeURIComponent(key)}`,
      { enabled }
    ),

  toggleResponsibility: (
    companyId: string,
    departmentKey: string,
    responsibilityKey: string,
    enabled: boolean
  ) =>
    api.put<SavedResponsibility>(
      `${base(companyId)}/${encodeURIComponent(departmentKey)}/responsibilities/${encodeURIComponent(responsibilityKey)}`,
      { enabled }
    ),
};
