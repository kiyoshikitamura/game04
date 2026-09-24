import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";

export const metadata: Metadata = { title: "有償通貨・購入品について | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="有償通貨・購入品について" updatedAt="2026年9月24日" returnToGame={from === "settings"}>
      <h2>ゲーム内での利用</h2>
      <p>輝石は本サービス内で利用するゲーム内通貨です。現金への換金、第三者への譲渡、サービス外への移転はできません。</p>
      <h2>有効期限</h2>
      <p>輝石は無償分から先に使用します。有償輝石および購入品の期限条件・交換品への期限引継ぎは、販売開始までに確定して購入前に表示します。現時点の草案は、有償商品の販売開始を案内するものではありません。</p>
      <h2>VIP（30日）</h2>
      <p>VIPは税込480円の買い切り商品です。自動更新はありません。有効期間は購入成立から720時間で、有効中の再購入はできません。期間終了後に再購入できます。</p>
      <p>期間中は対象バトルのスキップ・3倍速を利用できます。無償輝石100個を購入成立時に1回、その後24時間ごとに付与し、合計30回・3,000個となります。最終付与は購入成立から696時間後です。ログインや手動受取は不要です。</p>
      <h2>購入回数の上限</h2>
      <p>初回パックは通算1回、育成パック・覚醒・LBパック・ガチャパックは各通算3回までです。月が変わっても購入回数はリセットされません。</p>
      <h2>購入前の確認</h2>
      <p>商品内容・税込価格・購入回数の上限・有効期限を購入画面で確認してください。有償・無償の内訳と期限別の数量は、販売開始までにゲーム内で確認できるようにします。</p>
      <h2>法令に基づく表示</h2>
      <p>資金決済法に基づく表示の要否と掲載内容は、販売条件と発行・管理方法を確認したうえで、販売開始までに確定します。</p>
      <p><Link href={from === "settings" ? "/legal/tokusho?from=settings" : "/legal/tokusho"}>販売条件・返品について</Link></p>
    </LegalPage>
  );
}
