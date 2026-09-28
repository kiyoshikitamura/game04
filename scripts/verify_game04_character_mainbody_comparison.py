"""Compare corrected references with verified fixed-Preview mainbody screenshots."""
import json
from pathlib import Path
from PIL import Image, ImageDraw
root=Path('docs/verification/character-20260923')
report=json.loads((root/'fresh-mainbody-browser.json').read_text())
assert report.get('complete') is True and report.get('reload',{}).get('pass') is True
assert {'save_deck','character_level','character_awaken','character_unlock','skill_level','equipment_level','equipment_lb'} <= {a['action'] for a in report['actions'] if a['status']==200}
refs=Path('docs/design/character/2026-09-23/corrected')
groups=[
 ('01-character-list-detail-baseline.jpg',['character-list','character-detail','character-detail-end']),
 ('02-deck-formation-skill-equipment-baseline.jpg',['deck','formation','skill-list','equipment-list']),
 ('03-character-growth-actions-baseline.jpg',['character-growth','character-awaken','character-unlock']),
 ('04-character-growth-results-baseline.jpg',['character-result','character-awaken-result','character-unlock-result']),
 ('05-skill-equipment-growth-actions-baseline.jpg',['skill-detail','equipment-growth','equipment-detail']),
 ('06-skill-equipment-growth-results-baseline.jpg',['skill-result','equipment-result','equipment-lb-result']),
]
for i,(reference,names) in enumerate(groups,1):
    ref=Image.open(refs/reference).convert('RGB');ref.thumbnail((1560,1100))
    shots=[(name,Image.open(root/f'mainbody-{name}-390x844.png').convert('RGB')) for name in names]
    width=max(ref.width,sum(im.width for _,im in shots));height=ref.height+100+max(im.height for _,im in shots)
    canvas=Image.new('RGB',(width,height),'#141217');draw=ImageDraw.Draw(canvas)
    draw.text((10,8),'CORRECTED REFERENCE: '+reference,fill='white');canvas.paste(ref,(0,30));x=0
    for name,im in shots:
        draw.text((x+6,ref.height+42),'LIVE MAINBODY: '+name,fill='white');canvas.paste(im,(x,ref.height+66));x+=im.width
    canvas.save(root/f'mainbody-comparison-{i:02}.jpg',quality=88)
print('Six fixed-Preview live-mainbody comparison sheets generated.')
