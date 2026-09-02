import { NextResponse } from "next/server";
import { isCorrelationId } from "@/lib/observability/contract";
import { validateTechnicalSignal } from "@/lib/observability/sanitize";
import { writeTechnicalSignal } from "@/lib/observability/server";

const maximumBodyBytes = 16 * 1024;

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);
  const acceptedOrigins = new Set([requestUrl.origin]);
  if (forwardedHost) acceptedOrigins.add(`${forwardedProtocol}://${forwardedHost}`);
  if (origin && !acceptedOrigins.has(origin)) {
    return NextResponse.json({ accepted: false, reason: "origin" }, { status: 403 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > maximumBodyBytes) {
    return NextResponse.json({ accepted: false, reason: "size" }, { status: 413 });
  }

  const source = await request.text();
  if (Buffer.byteLength(source, "utf8") > maximumBodyBytes) {
    return NextResponse.json({ accepted: false, reason: "size" }, { status: 413 });
  }

  let candidate: unknown;
  try {
    candidate = JSON.parse(source);
  } catch {
    return NextResponse.json({ accepted: false, reason: "format" }, { status: 400 });
  }

  const signal = validateTechnicalSignal(candidate);
  if (!signal) {
    return NextResponse.json({ accepted: false, reason: "contract" }, { status: 400 });
  }

  const headerCorrelation = request.headers.get("x-correlation-id");
  if (headerCorrelation && (!isCorrelationId(headerCorrelation) || headerCorrelation !== signal.correlationId)) {
    return NextResponse.json({ accepted: false, reason: "correlation" }, { status: 400 });
  }

  writeTechnicalSignal(signal);
  return NextResponse.json({ accepted: true, eventId: signal.eventId, correlationId: signal.correlationId });
}
