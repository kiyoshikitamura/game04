import type { Passive, SkillMaster } from '@/domain/redesign/types';
export const STATUS_LABELS: Record<string, string> = { atk_up: '攻↑', def_up: '防↑', atk_down: '攻↓', def_down: '防↓', poison: '毒', stun: '行動不能', dot: '継続ダメージ', hot: '継続回復', shield: 'シールド', taunt: '被弾誘導', counter: '反撃', cleanse: '解除' };
export const TARGET_LABELS: Record<string, string> = { highest_atk_enemy: '戦闘中ATKが最大の付与可能敵', first: '先頭の敵', last: '最後尾の生存敵', lowest_hp: '残HP実数が最小の敵', highest_hp: 'HPの高い敵', random: 'ランダムな敵', all_enemies: '敵全体', lowest_ally: '残HP割合が低い味方', all_allies: '味方全体', self: '自身', dead_ally: '配置順最初の戦闘不能者', lowest_hp_ratio: '残HP割合が最低の敵', highest_hp_ratio: '残HP割合が最高の敵', first_ally: '付与・解除可能な味方の配置順', highest_atk_ally: '付与可能な味方の基礎ATK最大', counter_ally: '被弾誘導者優先、次に配置順', dot_ally: '継続ダメージ保持者優先' };
const passiveEffects: Record<string, string> = { P01: '同属性の味方ATK', P02: '同属性の味方DEF', P03: '生存味方の属性種類数に応じた自身ATK（表示は最大量）', P04: '本人以外の生存味方が異なる2属性以上のとき自身DEF', P05: '自身の通常攻撃ダメージ', P06: '自身の単体攻撃スキルダメージ', P07: '自身の全体攻撃スキルダメージ', P08: '能力低下中の敵への直接攻撃ダメージ', P09: '継続ダメージ状態の敵への直接攻撃ダメージ', P10: '自身が与える即時・継続回復（蘇生を除く）', P11: '自身が受ける即時・継続回復（蘇生を除く）', P12: '自身が付与するシールド量', P13: '自身の反撃ダメージ', P14: '低HP条件成立中の自身ATK', P15: '高HP条件成立中の自身DEF', P16: '能動ATK強化保持中の自身DEF' };
const elements: Record<string,string> = {fire:'火',water:'水',earth:'土',wind:'風',light:'光',dark:'闇'};
export function passiveDescription(passive: Passive) {
  const effect = passive.type ? passiveEffects[passive.type] : `${passive.target === 'party' ? '味方全体' : '自身'}の${passive.stat.toUpperCase()}`;
  return `所持者が生存中：${effect}${passive.targetElement ? `（${elements[passive.targetElement]}属性・本人を含む／同型・同属性は最強1つ）` : ''} +${Number(passive.percent.toFixed(2))}%${passive.type ? '。効果量・条件閾値は検証用仮値。条件は行動開始時に参照' : ''}`;
}
export function skillConditionText(skill: SkillMaster) { const value = skill.condition.value ?? .5; switch(skill.condition.type) { case 'hp_below': return `自身のHP ${value*100}%以下`; case 'ally_hp_below': return `味方のHP ${value*100}%以下`; case 'enemy_count': return `敵が${value}体以上`; case 'ally_dead': return '戦闘不能の味方がいる'; case 'every_n_actions': return `${value}行動ごと`; default: return '常時（対象・効果の付与可否も判定）'; } }
export const READINESS_REASONS: Record<string,string> = { reapply_unavailable: '同じスキルの効果が残っているため再付与不可', condition_unmet: '条件未達', insufficient_sp: 'SP不足' };

export const CLEANSE_LABELS: Record<string,string> = { buff:'能力強化', protection:'保護（シールド・継続回復・反撃・被弾誘導）', debuff:'能力低下', dot:'継続ダメージ', stun:'行動不能' };

export const LEGACY_SKILL_MAPPING_NOTICE = '旧所持IDと新しい効果・数値の対応が未確定のため発動保留。72候補は検証画面のみで接続しており、所持品・ガチャには追加していません。';
export function skillDescription(skill: SkillMaster, latest = true) { return latest && skill.unsupportedReason ? LEGACY_SKILL_MAPPING_NOTICE : skill.description; }
