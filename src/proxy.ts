import { NextResponse } from "next/server";

// KPI viewing is public in development / Preview at the owner's request.
// The KPI API still reads production aggregates using server-only credentials.
export function proxy() {
  if (process.env.VERCEL_ENV === "production") {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/kpi/:path*", "/api/admin/kpi/:path*"],
};
