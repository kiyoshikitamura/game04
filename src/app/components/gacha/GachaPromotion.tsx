const names={normal:'通常登用・毎日1回10連無料',character:'姫武将 特選登用・R以上確定',skill:'戦技 特選登用・R以上確定',equipment:'武具 特選登用・R以上確定'};
/** Selected offer only; never part of title/tutorial loading gates. */
export default function GachaPromotion({kind}:{kind:keyof typeof names}){return <img className="g4-gacha-promotion" src={`/assets/promotions/b15/${kind}.png`} width={1280} height={640} alt={names[kind]} loading="lazy" decoding="async"/>}
