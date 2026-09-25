export const TUTORIAL_VERSION = 'tutorial-fixed-20260925';
export const STARTERS = ['char_joe_01', 'char_daimon_01', 'char_aoi_01'] as const;
export const STARTER_SKILLS = ['SKD003', 'SKD039', 'SKD035'] as const;
export const BACKGROUNDS = {
  oda: '/bg/approved-20260925/ssr-char_reiji_01.webp',
  uesugi: '/bg/approved-20260925/ssr-char_koharu_01.webp',
  tokugawa: '/bg/approved-20260925/ssr-char_karen_01.webp',
  guide: '/bg/approved-20260925/ssr-char_ageha_01.webp',
  battle: '/bg/approved-20260925/ssr-char_leo_01.webp',
};
export const SCENES = [
  { id: 'world-1', cast: ['char_reiji_01'], background: BACKGROUNDS.oda, text: '時は戦国。\n各地の武将が領地を争い、天下を狙う時代。\n織田信長もまた、その頂へと歩みを進めていた。' },
  { id: 'world-2', cast: ['char_koharu_01', 'char_go_01'], background: BACKGROUNDS.uesugi, text: '己の義を貫く者。力で乱世を切り拓く者。\n上杉謙信、武田信玄――\nそれぞれの信念が、戦場でぶつかり合う。' },
  { id: 'world-3', cast: ['char_ageha_01', 'char_karen_01'], background: BACKGROUNDS.tokugawa, text: '才覚で駆け上がる豊臣秀吉。\n機を待ち、着実に力を蓄える徳川家康。\nそして今、あなたも天下を目指す旅に出る。' },
  { id: 'welcome', text: 'わしが豊臣秀吉じゃ！\nおぬしも立身出世を望む者だな。\n戦に出る前に、わしが心得を教えてやろう。' },
  { id: 'companions', text: '一人では天下は獲れん。頼れる仲間が必要じゃ。\nちょうど、おぬしに紹介したい武将が三人おる。\nさっそく迎え入れるがよい！' },
  { id: 'characters', text: '北条氏康・井伊直政・お市が仲間になった！' },
  { id: 'techniques', text: '仲間が集まったら、次は「技」じゃ。\n敵を攻める技、傷を癒やす技、仲間を奮い立たせる技。\nどう組み合わせるかが、戦の勝敗を分けるぞ。' },
  { id: 'skills-intro', text: 'この三人に持たせる技を、わしが選んでおいた。\nまずはこの三つを使ってみるがよい！' },
  { id: 'skills', text: '土割り・応急手当・鬨の声を手に入れた！' },
  { id: 'equip', text: '仲間も技も、持っているだけでは力を発揮せん。\n武将を部隊に入れ、技を装備するのじゃ。\nまずは「おまかせ」で整えてみよ。', button: 'おまかせ編成・装備' },
  { id: 'equipped', text: '出陣の準備が整いました。\n北条氏康：土割り\n井伊直政：応急手当\nお市：鬨の声' },
  { id: 'practice', text: 'うむ、支度はできたようじゃな。\nさっそく模擬戦といこう。\n相手は伊達政宗じゃ！' },
  { id: 'sp', text: '最後に、戦で大切な「SP」を覚えておけ。\nSPが貯まれば、バーストで技を連発できるのじゃ。\nその力、実際に確かめてみよ！', button: '模擬戦を始める' },
  { id: 'battle', text: '' },
  { id: 'victory', text: 'よくやった！\n今のがバーストじゃ。技の連発、見事だったぞ。\n……そうじゃ。最後に、おぬしの名を教えてくれ。' },
  { id: 'name', text: 'あなたの名前を入力してください。', button: 'この名前で始める' },
  { id: 'farewell', text: 'では、〇〇！\n仲間とともに戦を重ね、己の道を切り拓け。\n天下を獲る旅へ、いざ向かうのじゃ！', button: '天下への旅を始める' },
] as const;
export const FIRST_SORTIE_TEXT = 'まずは出陣して、最初の戦に挑みましょう。';
export const FIRST_DEFEAT_TEXT = '勝てないときは、部隊を強くする機会です。\n任務を進めながら武将を雇用・育成し、技や装備を整えましょう。\n各地の戦を突破し、天下統一を目指しましょう！';
