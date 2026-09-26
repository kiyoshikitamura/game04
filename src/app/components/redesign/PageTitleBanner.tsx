import './PageTitleBanner.css';
export const PAGE_TITLE_ART = {quest:['出陣','sortie'],raid:['共闘','coop'],territory:['領土侵攻戦','territory-invasion'],character:['武将','character'],gacha:['召喚','summon'],mission:['任務','mission'],shop:['商店','shop']} as const;
export default function PageTitleBanner({page,id}:{page:keyof typeof PAGE_TITLE_ART;id?:string}){const [label,asset]=PAGE_TITLE_ART[page];return <h2 id={id} className="g4-page-title"><img src={'/assets/versioned/sengoku-'+asset+'-banner-v1.png'} width={1200} height={200} alt={label}/></h2>;}
