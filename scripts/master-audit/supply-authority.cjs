const fs=require('fs'),path=require('path'),assert=require('assert/strict');
// Independent expected values from the user-approved prose table.
const rows=fs.readFileSync(path.resolve(__dirname,'../../docs/product/GAME04_RAID_SUPPLY_FIX_2026-09-25.md'),'utf8').split('\n').map(l=>l.split('|').slice(1,-1).map(s=>s.trim()));
const areas=Object.fromEntries(rows.filter(r=>/^\d+$/.test(r[0])).map(r=>{const parse=s=>{const m=s.match(/^(\d+)%×(\d+)$/);assert(m,s);return {chance:Number(m[1])/100,amount:Number(m[2])}};return [r[0],{encounterChance:parseFloat(r[1])/100,SR:parse(r[2]),SSR:parse(r[3]),defeatSoul:Number(r[4])}]}));
const castles=Object.fromEntries(rows.filter(r=>/^TI0[1-5]$/.test(r[0])).map(r=>[r[0],Number(r[2])]));assert.equal(Object.keys(areas).length,10);assert.equal(Object.keys(castles).length,5);
module.exports={areas,castles};
