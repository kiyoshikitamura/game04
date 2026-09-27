"""Read formal battle image alpha bounds; never alter or re-encode the source artwork."""
import json
from pathlib import Path
from PIL import Image
art=json.loads(Path('src/theme/local-characters.json').read_text(encoding='utf-8'))
roster=json.loads(Path('src/theme/sengoku-characters.json').read_text(encoding='utf-8'))
result={}
for item in art:
    master=next((r for r in roster if r['characterId']==item['id']),None)
    src=item.get('battle')
    if not master or master['runtimeRarity'] not in ('SR','SSR') or not src: continue
    image=Image.open(Path('public'+src)).convert('RGBA')
    width,height=image.size
    bounds=image.getchannel('A').point(lambda n:255 if n>24 else 0).getbbox()
    if abs(width/height-4/3)<.02 and bounds:
        result[src]={'width':width,'height':height,'bounds':list(bounds),'rarity':master['runtimeRarity']}
Path('src/theme/enemy-art-bounds.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(f'{len(result)} formal SR/SSR 4:3 battle assets')
