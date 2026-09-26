'use client';
import './list-controls.css';
export type ListOption = {value:string;label:string};
export default function ListControls({query,onQuery,filter,onFilter,filters,sort,onSort,sorts,count}: {query:string;onQuery:(value:string)=>void;filter:string;onFilter:(value:string)=>void;filters:ListOption[];sort:string;onSort:(value:string)=>void;sorts:ListOption[];count:number}) {
  return <div className="g4-list-controls">
    <label>名前で検索<input type="search" value={query} onChange={e=>onQuery(e.target.value)} /></label>
    <div><label>絞り込み<select aria-label="絞り込み" value={filter} onChange={e=>onFilter(e.target.value)}><option value="">すべて</option>{filters.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
      <label>並び順<select aria-label="並び順" value={sort} onChange={e=>onSort(e.target.value)}>{sorts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label></div>
    <span role="status">{count.toLocaleString('ja-JP')}件</span>
  </div>;
}
