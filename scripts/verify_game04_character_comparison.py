"""Contact sheets are visual evidence, not a pixel-equivalence claim."""
from PIL import Image, ImageDraw
from pathlib import Path
root = Path('docs/verification/character-20260923')
refs = Path('docs/design/character/2026-09-23/corrected')
groups = [
 ('01-character-list-detail-baseline.jpg', ['character-list','character-detail','character-detail-end']),
 ('02-deck-formation-skill-equipment-baseline.jpg', ['deck','formation','skill-list','equipment-list']),
 ('03-character-growth-actions-baseline.jpg', ['character-growth','character-awaken','character-unlock']),
 ('04-character-growth-results-baseline.jpg', ['character-result','character-awaken-result','character-unlock-result']),
 ('05-skill-equipment-growth-actions-baseline.jpg', ['skill-detail','equipment-growth','equipment-detail']),
 ('06-skill-equipment-growth-results-baseline.jpg', ['skill-result','equipment-result','equipment-lb-result']),
]
for i, (ref, names) in enumerate(groups, 1):
    reference = Image.open(refs / ref).convert('RGB')
    reference.thumbnail((1560, 1100))
    thumbs = [(name, Image.open(root / f'fixture-{name}-390x844.png').convert('RGB')) for name in names]
    width = max(reference.width, sum(im.width for _, im in thumbs))
    height = reference.height + 100 + max(im.height for _, im in thumbs)
    out = Image.new('RGB', (width, height), '#141217')
    draw = ImageDraw.Draw(out)
    draw.text((10, 8), 'CORRECTED REFERENCE: ' + ref, fill='white')
    out.paste(reference, (0, 30))
    x = 0
    for name, im in thumbs:
        draw.text((x+6, reference.height+42), 'QA FIXTURE: '+name, fill='white')
        out.paste(im, (x, reference.height+66))
        x += im.width
    out.save(root / f'comparison-{i:02}.jpg', quality=88)
print('Six corrected-reference / fixture contact sheets generated.')
