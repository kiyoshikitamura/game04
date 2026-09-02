export type RouteAccess =
  | { mode: "offline" }
  | { mode: "authenticated"; userId: string }
  | { mode: "redirect"; reason: "session-required" | "session-error" };

export function decideProtectedRouteAccess(input: {
  configured: boolean;
  userId?: string | null;
  authError?: boolean;
}): RouteAccess {
  if (!input.configured) return { mode: "offline" };
  if (input.authError) return { mode: "redirect", reason: "session-error" };
  if (!input.userId) return { mode: "redirect", reason: "session-required" };
  return { mode: "authenticated", userId: input.userId };
}
