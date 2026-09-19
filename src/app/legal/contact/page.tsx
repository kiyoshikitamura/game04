import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import { GAME04_LEGAL } from "../legalConfig";

export const metadata: Metadata = { title: "お問い合わせ | 戦国姫艶武", robots: { index: false, follow: false } };

type PageProps = { searchParams: Promise<{ from?: string }> };

export default async function Page({ searchParams }: PageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="お問い合わせ" updatedAt="2026年9月18日" returnToGame={from === "settings"}>
      <h2>お問い合わせ窓口</h2>
      {GAME04_LEGAL.supportEmail ? <p><a href={`mailto:${GAME04_LEGAL.supportEmail}?subject=${encodeURIComponent("戦国姫艶武 お問い合わせ")}`}>{GAME04_LEGAL.supportEmail}</a></p> : <p>正式公開に向けて窓口を準備しています。開発確認中の不具合は、このゲームをご案内した連絡先へお知らせください。</p>}
      <h2>不具合の報告に必要な情報</h2>
      <p>状況を確認するため、以下の情報をお知らせください。</p>
      <ol>
        <li>プレイヤー名・確認できる場合はプレイヤーID。</li>
        <li>発生日時と、操作していた画面。</li>
        <li>行った操作、期待した動作、実際に起きたこと。</li>
        <li>端末・OS・ブラウザ、表示されたエラーや画面の画像。</li>
        <li>購入に関する場合は商品名・購入日時・注文番号。</li>
      </ol>
      <p>パスワード、認証コード、クレジットカード番号は送らないでください。購入が反映されないときは再購入を繰り返さず、購入履歴をご確認ください。</p>
      <h2>ログイン・引き継ぎの問題</h2>
      <p>問題が起きている画面を残し、「はじめから」やブラウザのデータ削除を行う前にご連絡ください。</p>
      <h2>個人情報・権利に関するお問い合わせ</h2>
      <p>個人情報の開示等の請求、権利に関するご連絡も同じ窓口で受け付ける予定です。</p>
    </LegalPage>
  );
}
