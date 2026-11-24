// @vitest-environment node

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

let migrationSql = "";

beforeAll(() => {
  const migrationsDirectory = join(process.cwd(), "supabase", "migrations");
  const migrationFile = readdirSync(migrationsDirectory).find((file) =>
    file.endsWith("_initial_release_schema.sql"),
  );

  if (!migrationFile) {
    throw new Error("The initial ReleaseDesk schema migration is missing.");
  }

  migrationSql = readFileSync(join(migrationsDirectory, migrationFile), "utf8")
    .toLowerCase()
    .replace(/\s+/g, " ");
});

describe("ReleaseDesk migration security contract", () => {
  it("enables RLS and removes default client grants", () => {
    expect(migrationSql).toContain(
      "alter table public.projects enable row level security",
    );
    expect(migrationSql).toContain(
      "alter table public.work_items enable row level security",
    );
    expect(migrationSql).toContain(
      "revoke all on table public.projects, public.work_items from anon, authenticated",
    );
  });

  it("uses separate policies and complete update checks", () => {
    expect(migrationSql).not.toMatch(/for all/);
    expect(migrationSql.match(/create policy/g)).toHaveLength(8);
    expect(migrationSql).toMatch(
      /create policy "projects_update_own".*for update.*using.*with check/,
    );
    expect(migrationSql).toMatch(
      /create policy "work_items_update_own_project".*for update.*using.*with check/,
    );
  });

  it("enforces work-item ownership with a composite foreign key", () => {
    expect(migrationSql).toContain(
      "foreign key (project_id, owner_id) references public.projects (id, owner_id) on delete cascade",
    );
    expect(migrationSql).toContain("(select auth.uid()) = owner_id");
  });

  it("never grants client access to privileged roles or broad operations", () => {
    expect(migrationSql).not.toMatch(/grant all/);
    expect(migrationSql).not.toMatch(/grant .* to anon/);
    expect(migrationSql).not.toContain("service_role");
  });
});

