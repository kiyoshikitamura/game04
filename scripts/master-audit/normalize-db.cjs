const fs=require('fs');
const {clean,keyed}=require('./runtime.cjs');
function normalize(rows,products){const d=Object.fromEntries(rows.map(r=>[r.key,r.data]));for(const k of ['runtime','acquisition_conversion','formal_gacha','territory','quest65','release_manifest'])if(!d[k])throw Error('missing master '+k);
 const catalog=require('./runtime.cjs').collect().billing,ids=new Set([...catalog.packs,...catalog.diamonds,catalog.vip].map(x=>x.id));
 return {runtime:Object.fromEntries(['energyMax','energyRecoverySeconds','vipDays'].map(k=>[k,d.runtime[k]])),acquisition:d.acquisition_conversion,formalGacha:d.formal_gacha,territoryPolicy:Object.fromEntries(['levels','destinations','unlockStageId','initialExp','legacyMigrationExp','levelCap','version'].map(k=>[k,d.territory[k]])),billingProducts:keyed(products.map(x=>x.row??x).filter(x=>ids.has(x.id))),namedAssetSkillIds:d.release_manifest.skills.map(x=>x.id).sort(),quest65:JSON.parse(JSON.stringify(d.quest65,(k,v)=>k==='image'?'':v)),invasionMasters:keyed(d.territory.raidMasters.filter(x=>/^TI0[1-5]$/.test(x.id)))};
}
module.exports={normalize};if(require.main===module){fs.writeFileSync(process.argv[4],JSON.stringify(normalize(JSON.parse(fs.readFileSync(process.argv[2])),JSON.parse(fs.readFileSync(process.argv[3]))),null,2)+'\n');}
