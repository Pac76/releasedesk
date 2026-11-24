"use client";

import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabaseConfig,
  type SupabasePublicConfig,
} from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createClient(
  config: SupabasePublicConfig = getSupabaseConfig(),
) {
  return createBrowserClient<Database>(config.url, config.publishableKey);
}

