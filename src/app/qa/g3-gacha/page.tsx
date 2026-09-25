import { notFound } from "next/navigation";
import { isQaHarnessAvailable } from "@/domain/presentation/qaHarness";
import G3GachaHarness from "./G3GachaHarness";

export const dynamic = "force-dynamic";

export default function G3GachaQaPage() {
  if (process.env.VERCEL_ENV === "production" || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
  return <G3GachaHarness />;
}
