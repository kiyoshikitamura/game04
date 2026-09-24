import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";

export const metadata: Metadata = { title: "有償通貨・購入品について | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="有償通貨・購入品について" updatedAt="2026年9月18日" returnToGame={from === "settings"}>
      <h2>ゲーム内での利用</h2>
      <p>ダイヤ（DIA）は本サービス内で利用するゲーム内通貨です。現金への換金、第三者への譲渡、サービス外への移転はできません。</p>
      <h2>有効期限</h2>
      <p>有償ダイヤおよび有料パックで購入した未使用の銭・アイテム・チケットは、最初のゲーム内付与から120日で失効します。プレゼント受取による期限の延長はありません。無償分にはこの期限を適用しません。</p>
      <p>有効期限の近い購入分から消費します。有償ダイヤから交換した銭・回復アイテムには元の期限を引き継ぎます。複数の期限を含む支払いは期限順に配分し、分割できない1個の交換品には先に使用した有償分の期限を適用します。</p>
      <p>使用後に獲得した武将・装備・育成結果、回復済みAP・BP・RP、ガチャポイントは、この期限による失効対象ではありません。</p>
      <h2>購入前の確認</h2>
      <p>商品内容・税込価格・購入回数の上限・有効期限を購入画面で確認してください。有償・無償の内訳と期限別の数量は所持画面で確認できます。</p>
      <h2>法令に基づく表示</h2>
      <p>資金決済法に基づく表示の要否と掲載内容は、販売条件と発行・管理方法を確認したうえで、販売開始までに確定します。</p>
      <p><Link href={from === "settings" ? "/legal/tokusho?from=settings" : "/legal/tokusho"} replace={from === "settings"}>販売条件・返品について</Link></p>
    </LegalPage>
  );
}
