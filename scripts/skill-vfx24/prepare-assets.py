"""Reproducible crops from visually reviewed boundaries; never threshold alpha."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/verification/skill-vfx24/source'
DEST = ROOT / 'public/battle-effects/skill-vfx24'
# Individually reviewed sheet boundaries, expressed in source canvas coordinates.
# Dark sweep's left part is notably wider; tempest's left part is much narrower.
BOUNDARIES = [.55,.55,.50,.53,.55,.53,.51,.50,.50,.55,.49,.40,.655,.56,.50,.35,.49,.51,.52,.50,.50,.42,.59,.51]
manifest = json.loads((SOURCE/'manifest.json').read_text(encoding='utf-8'))
report=[]
for entry, boundary in zip(manifest, BOUNDARIES, strict=True):
    source=SOURCE/entry['file']
    assert hashlib.sha256(source.read_bytes()).hexdigest()==entry['sha256']
    image=Image.open(source).convert('RGBA')
    x=round(image.width*boundary)
    folder=DEST/entry['effect_id']; folder.mkdir(parents=True,exist_ok=True)
    parts=[]
    for part,box in [('lead',(0,0,x,image.height)),('hit',(x,0,image.width,image.height))]:
        crop=image.crop(box)
        bounds=crop.getchannel('A').getbbox()
        crop=crop.crop(bounds)
        crop.thumbnail((900,900),Image.Resampling.LANCZOS)
        crop=ImageOps.expand(crop,border=24,fill=(0,0,0,0))
        output=folder/f'{part}.webp'
        crop.save(output,format='WEBP',quality=90,method=6,exact=True,alpha_quality=100)
        parts.append(dict(part=part,box=box,alphaBounds=bounds,size=crop.size,bytes=output.stat().st_size,sha256=hashlib.sha256(output.read_bytes()).hexdigest()))
    report.append(dict(effectId=entry['effect_id'],sourceSha256=entry['sha256'],boundary=x,parts=parts))
(ROOT/'docs/verification/skill-vfx24/crops.json').write_text(json.dumps(report,indent=2)+'\n')
print(f'{len(report)} sources verified; {sum(len(r["parts"]) for r in report)} alpha-preserving WebP parts; {sum(p["bytes"] for r in report for p in r["parts"]):,} bytes')
