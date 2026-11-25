// @vitest-environment node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  fileURLToPath(new URL("../../../supabase/migrations/20261125115553_repository_intelligence.sql", import.meta.url)),
  "utf8",
).toLowerCase();

describe("repository intelligence migration security contract", () => {
  it("creates immutable owner-scoped snapshots with composite ownership", () => {
    expect(migration).toContain("create table public.repository_snapshots");
    expect(migration).toContain("foreign key (project_id, owner_id)");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.repository_snapshots from anon, authenticated");
    expect(migration).toContain("grant select, insert on table public.repository_snapshots to authenticated");
    expect(migration).not.toMatch(/grant[^;]*(update|delete)[^;]*repository_snapshots/);
  });

  it("uses separate select/insert policies and an owner-derived atomic capture function", () => {
    expect(migration).toContain("for select");
    expect(migration).toContain("for insert");
    expect(migration).toContain("with check");
    expect(migration).toContain("security invoker");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("owner_id = (select auth.uid())");
    expect(migration).toContain("insert into public.repository_snapshots");
  });
});
