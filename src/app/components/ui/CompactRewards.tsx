import type { ComponentProps } from 'react';
import { RewardList } from './Game04DataDisplay';

/** Display summary only. The enclosing button opens the complete named rewards. */
export default function CompactRewards({items,limit=2}:{items:ComponentProps<typeof RewardList>['items'];limit?:number}) {
  return <span className="g4-compact-rewards">{items.slice(0,limit).map(item=><span key={item.key}><img src={item.image||undefined} alt={item.name}/><b>×{item.amount.toLocaleString()}</b></span>)}{items.length>limit&&<small>＋{items.length-limit}件</small>}</span>;
}
