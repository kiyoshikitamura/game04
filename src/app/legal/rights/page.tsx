import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";
import { GAME04_LEGAL, pendingLegalValue } from "../legalConfig";

export const metadata: Metadata = { title: "権利表記・運営者情報 | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="権利表記・運営者情報" updatedAt="2026年9月18日" returnToGame={from === "settings"}>
      <h2>コンテンツの権利</h2>
      <p>本サービスの画像、文章、音声、プログラム等に関する権利は、運営者または正当な権利を有する第三者に帰属します。利用規約で認められる範囲を超えて利用することはできません。</p>
      <h2>運営主体</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.operator)}</p>
      <h2>著作権者・クレジット</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.rightsHolder)}</p>
      <p>使用素材の権利者および必要な個別クレジットは、確認後に掲載します。</p>
      <h2>公式サイト</h2>
      <p>{GAME04_LEGAL.serviceUrl ? <a href={GAME04_LEGAL.serviceUrl}>{GAME04_LEGAL.serviceUrl}</a> : pendingLegalValue(null)}</p>
      <p><Link href="/legal/contact">権利に関するお問い合わせ</Link></p>
    </LegalPage>
  );
}
