import type { Metadata } from "next";
import LegalPage from "../LegalPage";
import Link from "next/link";
import SupportContact from "../SupportContact";
import { GAME04_LEGAL, pendingLegalValue } from "../legalConfig";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | 戦国姫艶武",
  description: "戦国姫艶武の特定商取引法に基づく表記です。",
};

type TokushoPageProps = { searchParams: Promise<{ from?: string }> };

export default async function TokushoPage({ searchParams }: TokushoPageProps) {
  const { from } = await searchParams;
  return (
    <LegalPage title="特定商取引法に基づく表記" updatedAt="2026年9月24日" returnToGame={from === "settings"}>
      <h2>販売事業者</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.operator)}</p>
      <h2>代表者または通信販売業務責任者</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.representative)}</p>
      <h2>所在地</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.address)}</p>
      <h2>電話番号</h2>
      <p>{pendingLegalValue(GAME04_LEGAL.phone)}</p>
      <h2>連絡先</h2>
      <p><SupportContact returnToGame={from === "settings"} /></p>
      <h2>販売URL</h2>
      <p>{GAME04_LEGAL.serviceUrl ? <a href={GAME04_LEGAL.serviceUrl}>{GAME04_LEGAL.serviceUrl}</a> : pendingLegalValue(null)}</p>

      <h2>販売価格</h2>
      <p>各商品の販売価格は、それぞれの商品ページおよび購入手続き画面に税込価格で表示します。</p>
      <p>
        商品として販売する「輝石」は、戦国姫艶武内でのみ利用できるゲーム内通貨であり、
        現金への換金、第三者への譲渡およびサービス外への移転はできません。
      </p>
      <p>ゲーム内の一部のキャラクター、アイテムその他のコンテンツ・サービスは、購入済みの輝石を消費して取得します。</p>

      <h2>VIP・パックの販売条件</h2>
      <p>VIPは税込480円・720時間の買い切りで、自動更新はありません。有効中は再購入できず、終了後に再購入できます。初回パックは通算1回、育成パック・覚醒・LBパック・ガチャパックは各通算3回までです。</p>
      <p><Link href={from === "settings" ? "/legal/payments?from=settings" : "/legal/payments"}>VIPの付与時期・購入品の詳細</Link></p>

      <h2>受付可能な決済手段</h2>
      <p>クレジットカードその他、購入手続き画面に表示される決済方法。</p>
      <p>決済は決済代行事業者を通じて処理されます。</p>

      <h2>商品代金以外に必要な料金</h2>
      <p>商品代金以外に運営者が請求する料金はありません。</p>
      <p>
        ただし、本サービスの利用に必要なインターネット接続料金、通信料金その他利用者が契約する通信サービスに係る料金は、
        利用者の負担となります。
      </p>

      <h2>支払時期</h2>
      <p>
        各決済方法の支払時期は購入手続き画面に表示します。
        具体的な引落時期等は、利用する決済事業者またはカード会社等の定めによります。
      </p>

      <h2>商品の提供時期</h2>
      <p>決済事業者による支払成功の確認後、原則として速やかにゲーム内へ反映します。購入画面から戻っただけでは反映されない場合があります。</p>
      <p>通信障害、システム障害その他の事情により反映まで時間を要する場合があります。</p>

      <h2>商品の提供方法</h2>
      <p>購入した輝石その他の商品は、本サービス内の利用者アカウントまたはゲームデータへ付与されます。</p>

      <h2>有効期限・使用条件</h2>
      <p>輝石は無償分から先に使用します。有償輝石および購入品の期限条件・交換品への期限引継ぎは、販売開始までに確定して購入前に表示します。現時点の草案は、有償商品の販売開始を案内するものではありません。</p>

      <h2>返品・キャンセル・返金</h2>
      <p>デジタルコンテンツの性質上、商品提供後の利用者都合による返品、キャンセルまたは返金は原則としてお受けしておりません。</p>
      <p>
        ただし、法令上返金その他の対応が必要となる場合、重複決済その他運営者の責めに帰すべき事由がある場合、
        または運営者が別途対応を定めた場合は、この限りではありません。
      </p>

      <h2>動作環境</h2>
      <p>本サービスはWebブラウザ上で動作します。</p>
      <p>推奨環境その他の最新の動作環境は、本サービス内に表示する案内に従うものとします。</p>
    </LegalPage>
  );
}
