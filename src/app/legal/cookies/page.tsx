import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";

export const metadata: Metadata = { title: "Cookie・アクセス解析 | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="Cookie・アクセス解析" updatedAt="2026年9月18日" returnToGame={from === "settings"}>
      <h2>利用する目的</h2>
      <p>ログイン状態の維持、ゲーム設定の保存、二重操作の防止、利用状況の把握のため、Cookieやブラウザの保存領域を利用します。</p>
      <ul>
        <li>認証・ゲーム設定：ログイン状態や表示設定を保存します。</li>
        <li>購入操作：同じ操作による重複した購入要求を防ぐため、操作の識別情報を利用します。</li>
        <li>利用状況・広告効果：アクセス元、広告の識別情報、ページ到達、ゲーム開始等を記録し、導線やサービスの改善に利用します。</li>
      </ul>
      <h2>保存と削除</h2>
      <p>タブを閉じるまで保持する情報と、ブラウザを閉じた後も保持する情報があります。ブラウザの設定から保存情報を削除できますが、ログイン状態や設定が失われる場合があります。未連携のゲームデータがある場合は、先にアカウントの連携状況をご確認ください。</p>
      <h2>外部サービス</h2>
      <p>認証・データ保存・配信等に外部サービスを利用します。広告事業者への情報送信、送信先・送信内容・停止方法については、正式公開時の利用サービスに合わせて掲載します。</p>
      <p><Link href={from === "settings" ? "/legal/privacy?from=settings" : "/legal/privacy"} replace={from === "settings"}>個人情報の取扱い</Link></p>
    </LegalPage>
  );
}
