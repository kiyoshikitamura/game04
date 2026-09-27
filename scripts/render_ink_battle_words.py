from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path('public/battle-effects/ink-burst');root.mkdir(parents=True,exist_ok=True)
import shutil
for p in Path('scratch/burst-ui/assets').glob('*.png'):shutil.copyfile(p,root/p.name)
font=ImageFont.truetype(str(Path('scratch/burst-ui/font/玉ねぎ楷書激無料版v7改.ttf')),180)
for name,text in [('battle-start','戦開始！！')]+[(f'wave-{i}',f'第{i}派') for i in range(1,31)]+[(f'combo-{i}',f'{i}連撃') for i in range(1,6)]:
 box=font.getbbox(text,stroke_width=3);im=Image.new('RGBA',(box[2]-box[0]+40,box[3]-box[1]+40));ImageDraw.Draw(im).text((20-box[0],20-box[1]),text,font=font,fill='#fff0cc',stroke_width=3,stroke_fill='#46120b');im.save(root/(name+'.png'))
Path('scratch/burst-ui/font-license-utf8.txt').write_text(Path('scratch/burst-ui/font/readme.txt').read_bytes().decode('cp932'),encoding='utf8')
