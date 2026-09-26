"""Rebuild auditable v2 candidate data; no production ID or pool mapping."""
import json,re,pathlib,sys,hashlib
root=pathlib.Path(__file__).resolve().parents[1]
source=pathlib.Path(sys.argv[1]) if len(sys.argv)>1 else root/'docs/product/GAME04_BALANCE_AUTHORITY_V2_2026-09-20.md'
s=source.read_text(); roster=json.loads((root/'src/theme/sengoku-characters.json').read_text())
elements=dict(zip('火水土風光闇',['fire','water','earth','wind','light','dark']))
assign=[]
for line in s.splitlines():
 cells=[c.strip() for c in line.strip('|').split('|')]
 if len(cells)==7 and cells[0].startswith('char_') and re.fullmatch(r'P\d\d',cells[-1]):
  el,role=cells[5].split('／'); assign.append(dict(id=cells[0],name=cells[1],rarity=cells[2],element=elements[el],role=role,passiveType=cells[6]))
assert len(assign)==45
for a in assign:
 r=next(r for r in roster if r['characterId']==a['id']);assert r['name']==a['name'] and r['sourceRarity']==a['rarity']
def metrics(v):return [{'label':k,'value':float(n),'unit':u} for k,n,u in re.findall(r'([^／:]+):([\d.]+)(%|件)',v)]
skills=[];rows=[]
for line in s.splitlines():
 c=[v.strip() for v in line.strip('|').split('|')]
 if not re.fullmatch(r'SKD\d{3}',c[0]):continue
 if len(c)==8:
  rare,el=c[2].split('/');sp0,sp10=map(int,c[3].split('→'))
  skills.append(dict(designId=c[0],id='qa_balance_v2_'+c[0].lower(),name=c[1],rarity=rare,element=elements[el],sp0=sp0,sp10=sp10,effects0=metrics(c[4]),effects10=metrics(c[5]),duration=None if c[6]=='—' else int(c[6]),targetDescription=c[7],legacyId=None,imageStatus='UNMAPPED_PLACEHOLDER'))
 elif len(c)==6 and c[2].isdigit():rows.append(dict(designId=c[0],lb=int(c[2]),sp=int(c[3]),burstSp=int(c[4]),displayEffects=metrics(c[5])))
assert len(skills)==72 and len(rows)==792
for x in skills:
 for lb in range(11):
  row=next(r for r in rows if r['designId']==x['designId'] and r['lb']==lb)
  assert len(row['displayEffects'])==len(x['effects0'])
  for a,b,v in zip(x['effects0'],x['effects10'],row['displayEffects']):assert abs(a['value']+(b['value']-a['value'])*(lb/10)**1.25-v['value'])<=.005001
out=dict(version='PREVIEW_PROVISIONAL_BALANCE_V2_20260920',status='PREVIEW_PROVISIONAL',sourceSha256=hashlib.sha256(s.encode()).hexdigest(),assignments=assign,skills=skills,lbDisplayRows=rows)
(root/'src/domain/redesign/data/balance-v2.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Generated 45 fixed assignments; 72 candidates; 792 display rows. No legacy ID mapping or gacha changes.')
