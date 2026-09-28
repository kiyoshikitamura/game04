from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root=Path(__file__).resolve().parents[3]
out=Path(__file__).resolve().parent
font_path=root/'public/fonts/game04/NotoSansJP.woff2'
font=ImageFont.truetype(str(font_path),18)
small=ImageFont.truetype(str(font_path),13)
head=ImageFont.truetype(str(font_path),24)
original=Image.open(root/'docs/design/home/2026-09-23/01-home-approved.jpeg').convert('RGB')
dialog=Image.open(root/'docs/design/home/2026-09-23/02-switch-dialog-approved.jpeg').convert('RGB')
cases=[('normal','01 通常',original.crop((0,0,512,1024)),'home-normal-final.jpg','正式人物・既存アイコン・数値は本体データ。'),('encounter','02 共闘発生',original.crop((512,0,1024,1024)),'home-encounter-v2.jpg','正式Masterで用意したQA共闘を実API表示。'),('lower','03 同一ページ下部',original.crop((1024,0,1536,1024)),'home-encounter-final.jpg','本体は共闘通知がある状態の下部スクロール。'),('switch','04 統合切替Dialog',dialog,'home-switch-final.jpg','本体の所持5体・背景12件は正式データ差。')]
panels=[]
for key,title,mock,actual_file,note in cases:
    mock=mock.resize((390,round(mock.height*390/mock.width)),Image.Resampling.LANCZOS)
    actual=Image.open(out/actual_file).convert('RGB')
    assert actual.width==390,(actual_file,actual.size)
    canvas=Image.new('RGB',(814,984),'#1b181d')
    d=ImageDraw.Draw(canvas)
    d.text((12,9),title,font=head,fill='#f0d394')
    d.text((12,46),'承認モック（幅390pxへ比例縮小）',font=font,fill='#ffffff')
    d.text((412,46),'本体（390px実寸・無加工）',font=font,fill='#ffffff')
    d.rectangle((12,77,401,920),fill='#353039')
    d.rectangle((412,77,801,920),fill='#353039')
    canvas.paste(mock,(12,77));canvas.paste(actual,(412,77))
    d.text((12,933),'画像全体を保持。高さ比の差は余白で表示。',font=small,fill='#c7c1ca')
    d.text((12,956),note,font=small,fill='#c7c1ca')
    canvas.save(out/f'comparison-{key}.jpg',quality=95)
    panels.append(canvas)
combined=Image.new('RGB',(1640,1980),'#100d11')
for i,panel in enumerate(panels):combined.paste(panel,((i%2)*826,(i//2)*996))
combined.save(out/'comparison-four-states.jpg',quality=95)
print('Saved 4 paired comparisons and comparison-four-states.jpg; no source images changed.')
