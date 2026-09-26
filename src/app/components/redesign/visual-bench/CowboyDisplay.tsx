'use client';
import {useId} from 'react';
import art from '@/theme/local-characters.json';
import crops from '@/theme/character-cowboy-crops.json';
import './CowboyDisplay.css';
/** Shared head-to-thigh framing; measured source bounds are independent of text. */
export default function CowboyDisplay({characterId,name}:{characterId:string;name:string}) {
  const clipId=useId();
  const source=art.find(row=>row.id===characterId)?.full;
  const crop=crops.find(row=>row.id===characterId);
  if(!source||!crop)return null;
  return <svg className="g4-cowboy" viewBox={`${crop.x} ${crop.y} ${crop.width} ${crop.height}`} preserveAspectRatio="xMidYMax meet" role="img" aria-label={name} data-character={characterId}>
    <defs><clipPath id={clipId}><rect x={crop.x} y={crop.y} width={crop.width} height={crop.height}/></clipPath></defs>
    <image href={source} width={crop.naturalWidth} height={crop.naturalHeight} clipPath={`url(#${clipId})`}/>
  </svg>;
}
