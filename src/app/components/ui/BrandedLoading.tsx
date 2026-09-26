"use client";
import Game04Loading from './Game04Loading';
export default function BrandedLoading({className='',label='戦国の世界を準備中'}:{className?:string;label?:string}){return <div className={`branded-loading ${className}`}><Game04Loading context="screen" label={label} branded/></div>;}