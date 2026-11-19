import {
  pgTable,
  uuid,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { departments } from "./departments.js";

export const departmentResponsibilities = pgTable(
  "department_responsibilities",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),

    templateKey: text("template_key").notNull(),

    name: text("name").notNull(),

    description: text("description"),

    enabled: boolean("enabled").notNull().default(false),

    tasks: jsonb("tasks")
      .$type<string[]>()
      .notNull()
      .default([]),

    procedures: jsonb("procedures")
      .$type<string[]>()
      .notNull()
      .default([]),

    skills: jsonb("skills")
      .$type<string[]>()
      .notNull()
      .default([]),

    suggestedTools: jsonb("suggested_tools")
      .$type<string[]>()
      .notNull()
      .default([]),

    configuration: jsonb("configuration")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    departmentIdx: index("department_responsibilities_department_idx")
      .on(table.departmentId),

    departmentTemplateUq: uniqueIndex(
      "department_responsibilities_department_template_uq"
    ).on(table.departmentId, table.templateKey),
  }),
);
