import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  captureSupabaseResponse,
  type SupabaseResponseContext,
} from "@/lib/supabase/response";
import type { Database } from "@/types/database";

type CreateClientOptions = {
  responseContext?: SupabaseResponseContext;
};

export async function createClient(options: CreateClientOptions = {}) {
  const config = getSupabaseConfig();
  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet, headers) {
        if (options.responseContext) {
          captureSupabaseResponse(
            options.responseContext,
            cookiesToSet,
            headers,
          );
        }

        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The RD-003 proxy will
          // refresh sessions and copy cookie/cache headers onto its response.
        }
      },
    },
  });
}

