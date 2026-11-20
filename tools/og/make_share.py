# 카톡 · 문자 링크 미리보기: 찬양곡 · 찬양 묶음 · 스토리북마다 그림과 공유 주소를 만들어요.
#   그림: assets/og/s/<key>.jpg (1200x630)   주소: /listen/<묶음>/<곡>, /set/<묶음>, /book/<책>  → 열면 홈페이지 그 쪽으로 이동
#   실행: python -X utf8 tools/og/make_share.py   (site 폴더에서)
import io, json, os, html
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SITE = 'https://yem-brown.vercel.app'
D = json.load(io.open(os.path.join(ROOT, 'tools/og/share_data.json'), encoding='utf-8'))
F = 'C:/Windows/Fonts/'
W, H = 1200, 630
BG = (20, 17, 42)
GOLD = (233, 194, 122)

SONG_KO = {
    0: '하늘에 계신 우리 아버지', 1: '주는 나의 모든 것', 2: '주님, 주의 이름을 높이 올려요', 3: '주님께 외쳐라', 4: '놀라운 은혜',
    5: '하나님의 선하심', 6: '오직 한 길', 7: '잠잠히 (주님 안에)', 8: '바다 (발이 빠질지라도)', 9: '길을 만드시는 분',
    10: '위엄의 왕', 11: '구원하기에 능하신 주', 12: '주님이 살아 계시기에', 13: '사슴이 시냇물을 찾듯이', 14: '주님이 행하신 모든 일',
    15: '우리 하나님', 16: '나의 모든 것으로', 17: '내 마음의 눈을 여소서', 18: '예배하러 내가 왔어요', 19: '왕 중의 왕',
    20: '오, 그 이름을 찬양하라 (부활)', 21: '오 거룩한 밤', 22: '오라, 모든 신실한 자들아',
}

def font(name, size):
    return ImageFont.truetype(F + name, size)

def wrap(d, text, fnt, maxw):
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=fnt) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur); cur = w
    lines.append(cur)
    return lines

def card(img_path, kicker, title, sub, pill, out):
    im = Image.new('RGB', (W, H), BG)
    # 오른쪽 그림: 비율 그대로 (자르지 않고 높이에 맞춤)
    pic = Image.open(os.path.join(ROOT, img_path)).convert('RGB')
    pw = round(pic.width * H / pic.height)
    pic = pic.resize((pw, H), Image.LANCZOS)
    x0 = W - pw
    mask = Image.new('L', (pw, H), 255)
    md = ImageDraw.Draw(mask)
    fade = 70  # 왼쪽 가장자리만 살짝 흐리게 (인물은 가리지 않아요)
    for x in range(fade):
        md.line([(x, 0), (x, H)], fill=int(255 * (x / fade) ** 1.3))
    im.paste(pic, (x0, 0), mask)
    # 왼쪽 어두운 그라데이션 + 작은 별
    ov = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    for x in range(0, 470):
        a = int(255 * max(0, 1 - x / 470) ** 0.6)
        od.line([(x, 0), (x, H)], fill=BG + (a,))
    for (sx, sy, r) in [(60, 90, 2), (300, 60, 2), (420, 540, 2), (120, 470, 2), (520, 120, 1), (250, 300, 1), (600, 580, 2)]:
        od.ellipse([sx - r, sy - r, sx + r, sy + r], fill=(255, 240, 200, 200))
    im = Image.alpha_composite(im.convert('RGBA'), ov)
    d = ImageDraw.Draw(im)
    L, maxw = 52, 400
    # 위: 작은 머리글
    fk = font('malgunbd.ttf', 20)
    ky = 62
    for ln in wrap(d, kicker, fk, maxw):
        d.text((L, ky), ln, font=fk, fill=GOLD); ky += 30
    # 영어 제목 (줄 바꿈, 길면 글씨 줄이기)
    hangul = any('가' <= ch <= '힣' for ch in title)
    for size in (66, 58, 52, 46, 42):
        ft = font('malgunbd.ttf' if hangul else 'seguibl.ttf', size)
        lines = wrap(d, title, ft, maxw)
        if len(lines) <= 3 and all(d.textlength(l, font=ft) <= maxw for l in lines):
            break
    y = ky + 18
    for ln in lines:
        d.text((L, y), ln, font=ft, fill='white')
        y += int(size * 1.12)
    # 우리말 뜻
    y += 12
    fs = font('malgunbd.ttf', 28)
    for ln in wrap(d, sub, fs, maxw):
        d.text((L, y), ln, font=fs, fill=(243, 220, 176))
        y += 40
    # 알약 단추
    y += 22
    fp = font('malgunbd.ttf', 22)
    while d.textlength(pill, font=fp) > maxw - 40 and fp.size > 16:
        fp = font('malgunbd.ttf', fp.size - 1)
    tw = d.textlength(pill, font=fp)
    d.rounded_rectangle([L, y, L + tw + 44, y + 50], radius=25, fill=(40, 34, 70), outline=(233, 194, 122), width=2)
    d.text((L + 22, y + 10), pill, font=fp, fill=(255, 217, 138))
    # 아래: 사이트 이름
    d.text((L, H - 58), 'YEM 영어예배부  ·  yem-brown.vercel.app', font=font('malgunbd.ttf', 18), fill=(200, 190, 220))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.convert('RGB').save(out, quality=86, optimize=True)

def page(path, title, desc, img, target):
    t, ds = html.escape(title), html.escape(desc)
    url = f'{SITE}/{path}'
    body = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{t}</title>
<meta name="description" content="{ds}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="YEM 영어예배부">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{ds}">
<meta property="og:image" content="{SITE}/{img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{url}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{t}">
<meta name="twitter:description" content="{ds}">
<meta name="twitter:image" content="{SITE}/{img}">
<link rel="icon" type="image/png" href="/assets/yunhee/favicon.png">
<link rel="apple-touch-icon" href="/assets/app/apple-touch-180.png">
<meta http-equiv="refresh" content="0; url=/#{target}">
<script>location.replace('/#{target}');</script>
<style>body{{margin:0;min-height:100vh;display:grid;place-items:center;background:#1a1530;color:#ffd98a;font-family:sans-serif}}a{{color:#ffd98a}}</style>
</head>
<body><p><a href="/#{target}">{t} 으로 가는 중…</a></p></body>
</html>
'''
    p = os.path.join(ROOT, path, 'index.html')
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(body)

V = '1'  # 그림을 바꾸면 숫자를 올려요 (카톡이 옛 그림을 기억하지 않게)
sets = {s['id']: s for s in D['sets']}
songs = {s['no']: s for s in D['songs']}
songs[0] = {'no': 0, 'title': D['prayer']['title'], 'ko': D['prayer']['ko'], 'set': 'prayer'}
made = []
for no, s in sorted(songs.items()):
    st = sets.get(s['set'], {'id': 'prayer', 'name': '마치는 찬양 · 주기도문'})
    kick = 'YEM PRAISE · PRAYER' if no == 0 else f"YEM PRAISE SONG · #{no}"
    tr = SONG_KO.get(no, s['ko'])
    pill = '♪ 곡 들어보기' if tr == s['ko'] else f"♪ 우리말 찬양 · {s['ko']}"
    key = f'song-{no}'
    card(f'assets/banner/song-{no}.webp', kick, s['title'], f'“{tr}”', pill, os.path.join(ROOT, f'assets/og/s/{key}.jpg'))
    head = '주기도문' if no == 0 else f'#{no}'
    page(f"listen/{st['id']}/{no}", f"{head} {s['title']} · {s['ko']} | YEM 찬양",
         '원어민 찬양을 듣고 영어 가사를 한 줄씩 따라 불러요. YEM 영어예배부', f'assets/og/s/{key}.jpg?v={V}', f"listen/{st['id']}/{no}")
    made.append(key)
for sid, st in sets.items():
    first = st['songs'][0]
    names = ' · '.join(songs[n]['title'] for n in st['songs'])
    key = f'set-{sid}'
    card(f'assets/banner/song-{first}.webp', f"YEM PRAISE SONGS · {st['tag']}", st['name'].split(' ', 1)[1] if ' ' in st['name'] else st['name'],
         names, f"♪ {len(st['songs'])}곡 함께 불러요", os.path.join(ROOT, f'assets/og/s/{key}.jpg'))
    page(f'set/{sid}', f"{st['name']} | YEM 찬양", f"{names} — 원어민 찬양을 듣고 따라 불러요.", f'assets/og/s/{key}.jpg?v={V}', f'set/{sid}')
    made.append(key)
for b in D['books']:
    key = f"book-{b['bk']}"
    card(f"assets/books/b{b['bk']}/banner.webp", f"YEM BIBLE STORYBOOK · BOOK {b['bk']}", b['title'], b['ko'],
         '♪ 원어민 목소리로 들어요', os.path.join(ROOT, f'assets/og/s/{key}.jpg'))
    page(f"book/{b['bk']}", f"Book {b['bk']} {b['title']} · {b['ko']} | YEM 성경동화",
         '영어 · 중국어 원어민 목소리로 듣는 YEM 바이블 스토리북 E-북', f'assets/og/s/{key}.jpg?v={V}', f"book/{b['bk']}")
    made.append(key)
print(len(made), 'cards')
