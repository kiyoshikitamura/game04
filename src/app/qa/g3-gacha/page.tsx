import { notFound } from "next/navigation";
import { isQaHarnessAvailable } from "@/domain/presentation/qaHarness";
import G3GachaHarness from "./G3GachaHarness";

export const dynamic = "force-dynamic";

export default async function G3GachaQaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (process.env.VERCEL_ENV === "production" || !isQaHarnessAvailable(process.env.NEXT_PUBLIC_APP_ENV, process.env.NODE_ENV)) notFound();
  const params = await searchParams;
  if (params.viewport === "360" || params.viewport === "390") {
    const width = Number(params.viewport);
    return <main style={{ minHeight: "100dvh", padding: 12, background: "#120d09", color: "#ead3aa" }}><p>スマートフォン幅の表示確認：{width}px（保存なし）</p><iframe title="GAME04 ガチャ スマートフォン表示" src="/qa/g3-gacha" style={{ display: "block", width, height: 780, border: "1px solid #ad8150", margin: "0 auto" }} /></main>;
  }
  return <G3GachaHarness />;
}
