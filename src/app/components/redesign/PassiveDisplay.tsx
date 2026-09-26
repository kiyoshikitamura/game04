import type { Passive, Rarity } from '@/domain/redesign/types';
import { BALANCE_V2_CONFIG } from '@/domain/redesign/balanceV2Masters';
import { InfoRow } from '../ui/Game04DataDisplay';

const elements: Record<string,string> = {fire:'火',water:'水',earth:'土',wind:'風',light:'光',dark:'闇'};
const effects: Record<string,string> = {
  P01:'同属性の味方の攻撃力',P02:'同属性の味方の防御力',P03:'自身の攻撃力（属性数に応じた最大量）',P04:'自身の防御力',
  P05:'通常攻撃ダメージ',P06:'単体攻撃スキルダメージ',P07:'全体攻撃スキルダメージ',P08:'対象への直接攻撃ダメージ',P09:'対象への直接攻撃ダメージ',
  P10:'与える回復量（即時・継続／蘇生を除く）',P11:'受ける回復量（即時・継続／蘇生を除く）',P12:'付与するシールド量',P13:'反撃ダメージ',P14:'自身の攻撃力',P15:'自身の防御力',P16:'自身の防御力',
};
export default function PassiveDisplay({passive,rarity}:{passive?:Passive;rarity:Rarity}) {
  if(!passive)return <section className="g4g-passive"><h3>パッシブ</h3><p>{rarity==='N'?'パッシブなし':'パッシブ情報を確認できません'}</p></section>;
  const specific:Record<string,string>={P03:'生存している味方の属性数に応じて変動',P04:'自身以外の生存味方が2属性以上',P08:'攻撃対象が能力低下中',P09:'攻撃対象が継続ダメージ中',P14:`自身のHPが${BALANCE_V2_CONFIG.lowHpThreshold*100}%以下`,P15:`自身のHPが${BALANCE_V2_CONFIG.highHpThreshold*100}%以上`,P16:'自身が能動的な攻撃力強化を保持中'};
  const condition='所持者が生存中'+(specific[passive.type??'']?'・'+specific[passive.type??'']:'');
  return <section className="g4g-passive"><h3>パッシブ <small>Lv.{passive.level??0}</small></h3>
    <h4>{passive.name.replaceAll('ATK','攻撃力').replaceAll('DEF','防御力')}</h4>
    <dl><InfoRow label="種別" value={passive.target==='party'?'味方支援':'自己強化'}/>
      <InfoRow label="発動条件" value={condition}/>
      <InfoRow label="効果" value={`${effects[passive.type??'']??passive.name} +${Number(passive.percent.toFixed(2))}%`}/>
      {passive.targetElement&&<InfoRow label="対象" value={`${elements[passive.targetElement]}属性の味方（本人を含む）。同型・同属性は最も強い1つを適用`}/>}</dl>
    <p className="rd-muted">条件は行動開始時に判定します。</p>
  </section>;
}
