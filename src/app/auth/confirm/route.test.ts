// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { GET } from "@/app/auth/confirm/route";
import {
  AUTH_RESPONSE_HEADERS,
  captureSupabaseResponse,
  type SupabaseResponseContext,
} from "@/lib/supabase/response";

type CreateClientOptions = {
  responseContext: SupabaseResponseContext;
};

function expectNoCacheHeaders(response: Response) {
  expect(response.headers.get("cache-control")).toBe(
    AUTH_RESPONSE_HEADERS["cache-control"],
  );
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("pragma")).toBe("no-cache");
}

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects an invalid token without leaking details", async () => {
    createClientMock.mockResolvedValue({
      auth: {
        verifyOtp: vi.fn().mockResolvedValue({
          error: { message: "private provider detail" },
        }),
      },
    });

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/auth/confirm?token_hash=hash&type=email",
      ),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?notice=confirmation_error",
    );
    expect(response.headers.get("location")).not.toContain("private");
    expectNoCacheHeaders(response);
  });

  it("returns refreshed cookies and Supabase cache headers on success", async () => {
    const verifyOtp = vi.fn();
    createClientMock.mockImplementation(
      async ({ responseContext }: CreateClientOptions) => {
        verifyOtp.mockImplementation(async () => {
          captureSupabaseResponse(
            responseContext,
            [
              {
                name: "sb-test-auth-token",
                options: { httpOnly: true, path: "/", sameSite: "lax" },
                value: "refreshed-token",
              },
            ],
            AUTH_RESPONSE_HEADERS,
          );
          return { error: null };
        });

        return { auth: { verifyOtp } };
      },
    );

    const response = await GET(
      new NextRequest(
        "http://localhost:3000/auth/confirm?token_hash=hash&type=email&next=%2F%2Fattacker.example",
      ),
    );

    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "hash",
      type: "email",
    });
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
    expect(response.headers.get("set-cookie")).toContain(
      "sb-test-auth-token=refreshed-token",
    );
    expectNoCacheHeaders(response);
  });
});
