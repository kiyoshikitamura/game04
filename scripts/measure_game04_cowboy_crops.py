"""Measure existing transparent full art. Does not modify source images.
Per-asset head/ornament bounds and thigh endpoints live in the shared crop table.
Run from repository root with Pillow available.
"""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
art = json.loads((root / 'src/theme/local-characters.json').read_text(encoding='utf-8'))
# Composition corrections for the reviewed poses; remaining assets use the common crop.
endpoints = {'char_ageha_01': .64, 'char_reiji_01': .64, 'char_koharu_01': .60,
             'char_go_01': .63, 'char_joe_01': .64}
crops = []
for row in art:
    im = Image.open(root / 'public' / row['full'].lstrip('/')).convert('RGBA')
    alpha = im.getchannel('A').point(lambda value: 255 if value > 8 else 0)
    left, top, right, bottom = alpha.getbbox()
    cut = round(top + (bottom - top) * endpoints.get(row['id'], .67))
    upper = alpha.crop((0, top, im.width, cut)).getbbox()
    left, right, y = max(0, upper[0] - 8), min(im.width, upper[2] + 8), max(0, top - 8)
    crops.append(dict(id=row['id'], x=left, y=y, width=right-left, height=cut-y,
                      naturalWidth=im.width, naturalHeight=im.height))
(root / 'src/theme/character-cowboy-crops.json').write_text(
    json.dumps(crops, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
