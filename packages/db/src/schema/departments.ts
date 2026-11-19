import {
  type AnyPgColumn,
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { companies } from "./companies.js";
import { agents } from "./agents.js";

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),

    templateKey: text("template_key"),
    name: text("name").notNull(),
    enabled: boolean("enabled").notNull().default(true),

    purpose: text("purpose"),

    responsibilities: jsonb("responsibilities")
      .$type<string[]>()
      .notNull()
      .default([]),

    objectives: jsonb("objectives")
      .$type<string[]>()
      .notNull()
      .default([]),

    operatingPrinciples: jsonb("operating_principles")
      .$type<string[]>()
      .notNull()
      .default([]),

    configuration: jsonb("configuration")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    leadAgentId: uuid("lead_agent_id")
      .references(() => agents.id, { onDelete: "set null" }),

    parentDepartmentId: uuid("parent_department_id")
      .references((): AnyPgColumn => departments.id, {
        onDelete: "set null",
      }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    companyIdx: index("departments_company_idx")
      .on(table.companyId),

    companyEnabledIdx: index("departments_company_enabled_idx")
      .on(table.companyId, table.enabled),

    companyTemplateUq: uniqueIndex("departments_company_template_uq")
      .on(table.companyId, table.templateKey),
  }),
);
