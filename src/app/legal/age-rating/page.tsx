import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";

export const metadata: Metadata = { title: "年齢・課金について | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="年齢・課金について" updatedAt="2026年9月24日" returnToGame={from === "settings"}>
      <h2>未成年の方へ</h2>
      <p>未成年の方は、本サービスの利用と有料商品の購入について、保護者などの法定代理人の同意を得てください。</p>
      <h2>購入前にご確認ください</h2>
      <ul>
        <li>商品内容、税込価格、購入回数の上限、有効期限。</li>
        <li>有償・無償輝石の区分と、使用する通貨・チケット。</li>
        <li>登用の提供割合、対象となる武将・技・装備、天井の条件。</li>
      </ul>
      <p>商品内容が反映されない場合は、繰り返し購入せず、購入履歴を確認してお問い合わせください。</p>
      <p>対象年齢および年齢別の購入制限の案内は、正式公開までに掲載します。</p>
      <p><Link href={from === "settings" ? "/legal/contact?from=settings" : "/legal/contact"}>お問い合わせ</Link></p>
    </LegalPage>
  );
}
