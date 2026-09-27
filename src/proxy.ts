import { NextRequest, NextResponse } from "next/server";

const challengeHeaders = {
  "WWW-Authenticate": 'Basic realm="TRIBE NEON KPI", charset="UTF-8"',
  "Cache-Control": "no-store",
};

function unauthorized() {
  return new NextResponse("Authentication required", { status: 401, headers: challengeHeaders });
}

export function proxy(request: NextRequest) {
  // Internal KPI tools are served only from development / Preview deployments.
  // This does not decide which database supplies the read-only KPI data.
  if (process.env.VERCEL_ENV === "production") {
    return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const expectedUser = process.env.KPI_BASIC_AUTH_USER;
  const expectedPassword = process.env.KPI_BASIC_AUTH_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return new NextResponse("KPI authentication is not configured", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return unauthorized();

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return unauthorized();
    const user = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (user !== expectedUser || password !== expectedPassword) return unauthorized();
  } catch {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/kpi/:path*", "/api/admin/kpi/:path*"],
};
