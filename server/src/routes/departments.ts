import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import type { Db } from "@paperclipai/db";
import {
  departments,
  departmentResponsibilities,
} from "@paperclipai/db";

import { DEPARTMENT_CATALOG } from
  "@paperclipai/db/responsibility-catalog";

import {
  assertBoard,
  assertCompanyAccess,
} from "./authz.js";

import { notFound } from "../errors.js";

const toggleSchema = z.object({
  enabled: z.boolean(),
}).strict();

const idSchema = z.string().uuid();

export function departmentRoutes(db: Db) {
  const router = Router();

  // Available department and responsibility templates.
  router.get("/departments/catalog", (req, res) => {
    assertBoard(req);
    res.json(DEPARTMENT_CATALOG);
  });

  // Saved selections for a company.
  router.get("/companies/:companyId/departments", async (req, res) => {
    const companyId = idSchema.parse(req.params.companyId);
    assertCompanyAccess(req, companyId);

    const savedDepartments = await db
      .select()
      .from(departments)
      .where(eq(departments.companyId, companyId));

    const results = await Promise.all(
      savedDepartments.map(async (department) => {
        const responsibilities = await db
          .select()
          .from(departmentResponsibilities)
          .where(
            eq(departmentResponsibilities.departmentId, department.id)
          );

        return { ...department, responsibilities };
      })
    );

    res.json(results);
  });

  // Enable or disable a department.
  router.put(
    "/companies/:companyId/departments/:key",
    async (req, res) => {
      assertBoard(req);

      const companyId = idSchema.parse(req.params.companyId);
      assertCompanyAccess(req, companyId);

      const { enabled } = toggleSchema.parse(req.body);
      const key = req.params.key as string;

      const template = DEPARTMENT_CATALOG.find(
        (item) => item.key === key
      );

      if (!template) throw notFound("Department template not found");

      const [department] = await db
        .insert(departments)
        .values({
          companyId,
          templateKey: template.key,
          name: template.name,
          purpose: template.description,
          enabled,
        })
        .onConflictDoUpdate({
          target: [departments.companyId, departments.templateKey],
          set: {
            enabled,
            updatedAt: new Date(),
          },
        })
        .returning();

      res.json(department);
    }
  );

  // Enable or disable a responsibility.
  router.put(
    "/companies/:companyId/departments/:key/responsibilities/:responsibilityKey",
    async (req, res) => {
      assertBoard(req);

      const companyId = idSchema.parse(req.params.companyId);
      assertCompanyAccess(req, companyId);

      const { enabled } = toggleSchema.parse(req.body);
      const departmentKey = req.params.key as string;
      const responsibilityKey = req.params.responsibilityKey as string;

      const template = DEPARTMENT_CATALOG.find(
        (item) => item.key === departmentKey
      );

      if (!template) throw notFound("Department template not found");

      const responsibility = template.responsibilities.find(
        (item) => item.key === responsibilityKey
      );

      if (!responsibility) {
        throw notFound("Responsibility template not found");
      }

      const [department] = await db
        .select()
        .from(departments)
        .where(
          and(
            eq(departments.companyId, companyId),
            eq(departments.templateKey, departmentKey)
          )
        )
        .limit(1);

      if (!department || !department.enabled) {
        throw notFound("Enabled department not found");
      }

      const [saved] = await db
        .insert(departmentResponsibilities)
        .values({
          departmentId: department.id,
          templateKey: responsibility.key,
          name: responsibility.name,
          description: responsibility.description,
          tasks: responsibility.tasks,
          procedures: responsibility.procedures,
          skills: responsibility.skills,
          suggestedTools: responsibility.suggestedTools,
          enabled,
        })
        .onConflictDoUpdate({
          target: [
            departmentResponsibilities.departmentId,
            departmentResponsibilities.templateKey,
          ],
          set: {
            enabled,
            updatedAt: new Date(),
          },
        })
        .returning();

      res.json(saved);
    }
  );

  return router;
}
