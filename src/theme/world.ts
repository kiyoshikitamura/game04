/** 表示専用。GAME03由来の地域ID・条件・数値・保存値には適用しない。 */
export const GAME04_CHAPTERS = [
  {
    "id": "shinjuku",
    "name": "尾張",
    "title": "第一章　出会いの旗",
    "order": 1
  },
  {
    "id": "shibuya",
    "name": "美濃",
    "title": "第二章　墨俣の灯",
    "order": 2
  },
  {
    "id": "ikebukuro",
    "name": "近江",
    "title": "第三章　誓いの湖",
    "order": 3
  },
  {
    "id": "roppongi",
    "name": "京洛",
    "title": "第四章　花と策謀",
    "order": 4
  },
  {
    "id": "akihabara",
    "name": "甲斐",
    "title": "第五章　風林の試練",
    "order": 5
  },
  {
    "id": "kawasaki",
    "name": "越後",
    "title": "第六章　雪解けの義",
    "order": 6
  },
  {
    "id": "yokohama",
    "name": "天下分け目",
    "title": "第七章　暁の約束",
    "order": 7
  }
] as const;
export function game04WorldText(value: unknown): string {
  return String(value ?? "")
    .replaceAll("新宿", "尾張")
    .replaceAll("渋谷", "美濃")
    .replaceAll("池袋", "近江")
    .replaceAll("六本木", "京洛")
    .replaceAll("秋葉原", "甲斐")
    .replaceAll("川崎", "越後")
    .replaceAll("横浜", "天下分け目")
    .replace(/TRIBE[ :]*NEON(?: REIGN)?/gi, "戦国姫艶武")
    .replace(/TRIBE/gi, "同盟")
    .replaceAll("ギルドマスター", "盟主")
    .replaceAll("ギルド", "同盟")
    .replaceAll("ストリート", "戦場")
    .replaceAll("東京", "乱世");
}
export function game04TownName(id: string): string {
  return GAME04_CHAPTERS.find(chapter => chapter.id === id.toLowerCase())?.name || game04WorldText(id);
}

const STAGE_NAMES: Record<string, readonly string[]> = {
  shinjuku: ['尾張の街道', '川向こうの砦', '尾張の境陣'],
  shibuya: ['美濃の渡し場', '墨俣の川砦', '稲葉山への道'],
  ikebukuro: ['近江の湖畔', '湖を結ぶ山道', '誓いの湖城'],
  roppongi: ['京洛の門前', '花影の路地', '都を守る大門'],
  akihabara: ['甲斐の山関', '風渡る林道', '風林の要塞'],
  kawasaki: ['越後の雪街道', '義を試す峠', '雪原の本陣'],
  yokohama: ['天下分け目の先陣', '霧晴れる戦野', '暁の決戦'],
};
const STAGE_DESCRIPTIONS: Record<string, readonly string[]> = {
  shinjuku: ['街道の不安を払い、民の暮らしを守る。', '川向こうの砦を越え、新しい約束を結ぶ。', '美濃へ続く境の陣を突破する。'],
  shibuya: ['人と物資を運ぶ渡し場を取り戻す。', '川沿いの砦で仲間と息を合わせる。', '山城への道を開き、明日へ灯をつなぐ。'],
  ikebukuro: ['湖畔の集落に忍び寄る争いを収める。', '山道の陣を崩さず、互いを支えて進む。', '湖を望む城で、交わした誓いを示す。'],
  roppongi: ['都の門前の騒ぎを収め、旗を示す。', '花影の路地で、策に隠れた望みを見抜く。', '都の大門を越え、己の答えを示す。'],
  akihabara: ['山道の関を越え、次の戦いへの備えを整える。', '林の誘いに惑わされず、自らの間合いで進む。', '積み重ねた備えで、甲斐の要を突破する。'],
  kawasaki: ['雪に閉ざされた里へ続く道を開く。', '厳しい峠で仲間と旗を支え合う。', '雪原の本陣を越え、皆で帰る道を守る。'],
  yokohama: ['幾つもの約束を背負い、先陣へ進む。', 'それぞれの旗が並び立つ未来を目指す。', '共に夜明けを迎えるため、最後の陣に挑む。'],
};
/** 現行q_<town>_<1..3>とcanonical QUEST_<TOWN>_<DIFFICULTY>を同じ表示へ解決。 */
export function game04QuestPresentation(questId: string, fallbackName: unknown = '', fallbackDescription: unknown = '') {
  const legacy = /^q_([a-z]+)_([123])$/.exec(questId);
  const canonical = /^QUEST_([A-Z]+)_(EASY|NORMAL|HARD)$/.exec(questId);
  const town = legacy?.[1] || canonical?.[1]?.toLowerCase() || '';
  const stageIndex = legacy ? Number(legacy[2]) - 1 : ['EASY', 'NORMAL', 'HARD'].indexOf(canonical?.[2] || '');
  return {
    name: STAGE_NAMES[town]?.[stageIndex] || game04WorldText(fallbackName),
    description: STAGE_DESCRIPTIONS[town]?.[stageIndex] || game04WorldText(fallbackDescription),
  };
}
