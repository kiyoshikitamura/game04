"""Measure enemy artwork without changing it. Square art retains its approved standard layout.
Non-square artwork needs bounds, including characters whose battle variant falls back to full art.
"""
import json
from pathlib import Path
from PIL import Image
art=json.loads(Path('src/theme/local-characters.json').read_text(encoding='utf-8'))
roster=json.loads(Path('src/theme/sengoku-characters.json').read_text(encoding='utf-8'))
result={}
audit=[]
for item in art:
    master=next(r for r in roster if r['characterId']==item['id'])
    src=item.get('battle') or item['full']
    image=Image.open(Path('public'+src)).convert('RGBA')
    width,height=image.size
    bounds=image.getchannel('A').point(lambda n:255 if n>24 else 0).getbbox()
    if not bounds:
        raise ValueError(f'Empty enemy artwork: {src}')
    square=abs(width/height-1)<.02
    if not square:
        result[src]={'width':width,'height':height,'bounds':list(bounds),'rarity':master['runtimeRarity']}
    audit.append({'id':item['id'],'name':item['name'],'source':src,'width':width,'height':height,'layout':'square-standard' if square else 'measured','fallback':not item.get('battle')})
Path('src/theme/enemy-art-bounds.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
out=Path('docs/verification/enemy-art-coverage-20260929')
out.mkdir(parents=True,exist_ok=True)
(out/'assets.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'{len(art)} checked, {len(result)} non-square measured, {len(art)-len(result)} square standard')
