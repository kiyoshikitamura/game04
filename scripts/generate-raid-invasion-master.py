"""Extract adopted invasion tables verbatim; combat assembly is in raidInvasionMaster.ts."""
import json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
s=(root/'docs/product/master_sources_20260921/invasion.md').read_text()
rows=[[v.strip() for v in l.strip('|').split('|')] for l in s.splitlines() if l.startswith('|')]
num=lambda s:int(s.replace(',',''))
candidates=[]; fixed=[]; hp=[]; castlehp=[]
for r in rows:
 if len(r)==4 and re.fullmatch(r'\d+',r[0]) and re.fullmatch(r'\d+-\d+/\d+',r[1]):
  skills=[]
  for part in r[3].split('／'):
   skills.append(re.findall(r'SKD\d+',part))
  candidates.append(dict(level=int(r[0]),source=r[1],names=r[2].split('→'),skills=skills))
 if len(r)==11 and r[0].startswith('TI'):
  castle,level,pos=r[0].split('/')
  fixed.append(dict(castleId=castle,level=int(level),order=int(pos)-1,name=r[1],role=r[2],enemyLevel=int(r[3]),hp=num(r[4]),atk=num(r[5]),defense=num(r[6]),count=int(r[7]),sp=int(r[8].split('/')[0]),skills=['SKD'+n for n in re.findall(r'\d+',r[9])]))
 # Table actually 10 columns
 if len(r)==10 and r[0].startswith('TI'):
  castle,level,pos=r[0].split('/')
  fixed.append(dict(castleId=castle,level=int(level),order=int(pos)-1,name=r[1],role=r[2],enemyLevel=int(r[3]),hp=num(r[4]),atk=num(r[5]),defense=num(r[6]),count=int(r[7]),sp=int(r[8].split('/')[0]),skills=['SKD'+n for n in re.findall(r'\d+',r[9])]))
 if len(r)==6 and re.fullmatch(r'\d+-\d+/\d+',r[2]):hp.append(dict(castle=r[0],level=int(r[1]),source=r[2],enemyLevel=int(r[3]),referenceHp=num(r[4]),sharedHp=num(r[5])))
 if len(r)==5 and r[0] in ['岡崎城','長浜城','春日山城','躑躅ヶ崎館','安土城']:castlehp.append(dict(castle=r[0],values=[num(v) for v in r[1:]]))
assert len(candidates)==24 and len(fixed)==39 and len(hp)==120 and len(castlehp)==5,(len(candidates),len(fixed),len(hp),len(castlehp))
original=[]
for filename in ['area04_05.md','area06.md','area07_08.md','area09_10.md']:
 for line in (root/'docs/product/master_sources_20260921'/filename).read_text().splitlines():
  if not line.startswith('|'):continue
  r=[v.strip() for v in line.strip('|').split('|')]
  if not re.fullmatch(r'\d+-\d+/\d+/\d+',r[0]):continue
  if not any(r[0].rsplit('/',1)[0]==c['source'] for c in candidates):continue
  offset=1 if len(r)==12 else 0
  original.append(dict(id=r[0],name=r[1],level=int(r[3]),hp=num(r[4+offset]),atk=num(r[5+offset]),defense=num(r[6+offset]),count=int(r[7+offset]),sp=int(r[8+offset].split('/')[1]),source=filename))
assert len(original)==sum(len(c['names']) for c in candidates)
(root/'src/domain/redesign/data/raid-invasion.json').write_text(json.dumps(dict(version='invasion-20260921-section10',candidates=candidates,fixed=fixed,normalHp=hp,fixedHp=castlehp,original=original),ensure_ascii=False,indent=2)+'\n')
