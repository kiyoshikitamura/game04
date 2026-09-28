import './game04-ui.css';
import BrandedLoading from './BrandedLoading';
import ScreenState from './ScreenState';

/** Startup has no game chrome yet. Never leave an error behind a loading layer. */
export default function Game04EntryState({error,maintenance=false,onRetry}:{error?:string;maintenance?:boolean;onRetry?:()=>void}){
 if(!error&&!maintenance)return <BrandedLoading/>;
 return <main className="g4-entry-state"><ScreenState kind={maintenance?'locked':'error'} title={maintenance?'現在メンテナンス中です':'ゲームデータを確認できませんでした'} message={error} actionLabel={!maintenance&&onRetry?'再試行':undefined} onAction={onRetry}/></main>;
}
