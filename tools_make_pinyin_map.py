"""홈페이지 중국어 → 한어병음 사전 만들기 (윤희쌤 규칙: 한자는 무조건 병음과 함께)

python -X utf8 tools_make_pinyin_map.py
- 사이트의 .js / .html 에 나오는 중국어 글을 모두 찾아서 pinyin-map.js 를 만들어요.
- 소책자와 같은 고친 읽기(christmas/소책자/build_booklet.py 의 _FIX)를 써요.
- 새 중국어 글을 넣었으면 이 스크립트를 다시 돌리세요. (사전에 없는 글자도 글자 하나씩은 읽어 줘요)
"""
import glob, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, r"C:\workspace\yem\christmas\소책자")
from pypinyin import pinyin, Style  # noqa: E402
import build_booklet as BB  # noqa: E402

HAN = re.compile(r"[\u4e00-\u9fff]+")


def read(text):
    out, i = [], 0
    while i < len(text):
        hit = next((k for k in BB._FIX if text.startswith(k, i)), None)
        if hit:
            out += BB._FIX[hit]; i += len(hit); continue
        j = i
        while j < len(text) and not any(text.startswith(k, j) for k in BB._FIX):
            j += 1
        out += [p[0] for p in pinyin(text[i:j], style=Style.TONE)]
        i = j
    return out


runs, chars = {}, {}
for f in glob.glob(os.path.join(HERE, "*.js")) + glob.glob(os.path.join(HERE, "*.html")):
    if os.path.basename(f) in ("pinyin-map.js",):
        continue
    for r in HAN.findall(open(f, encoding="utf-8", errors="ignore").read()):
        if r not in runs:
            runs[r] = " ".join(read(r))
for r in runs:
    for c, p in zip(r, runs[r].split(" ")):
        chars.setdefault(c, p)
# 한 글자 사전에 넣어 둘 자주 쓰는 글자 (사용자 글 · 새 글 대비)
for c in "的一是不了人我在有他这中大来上个国到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现分将外但身些与高意进把法此实回二理美点月明其种声全工己话儿者向情部正名定女问力机给等几很业最间新什打便位因重被走电四第门相次东政海口使教西再平真听世气信北少关并内加化由却代军产入先山五太水万市眼体别处总才场师书比住员九笑性通目华报立马命张活难神数件安表原车白应路期叫死常提感金何更反合放做系计或司利受光王果亲界及今京务制解各任至清物台象记边共风战干接它许八特觉望直服毛林题建南度统色字请交爱让认算论百吃义科怎元社术结六功指思非流每青管夫连远资队跟带花快条院变联言权往展该领传近留红治决周保达办运武半候七必城父强步完革深区即求品士转量空甚众技轻程告江语英基派满式李息写呢识极令黄德收脸钱党倒未持取设始版双历越史商千片容研像找友孩站广改议形委早房音火际则首单据导影失拿网香似斯专石若兵弟谁校读志飞观争究包组造落视济喜离虽坏兴切团害声救福恩耶稣圣灵爱罪赞美祷告礼拜唱歌羊牧星王博士马槽婴孩天使":
    chars.setdefault(c, read(c)[0])

js = ("/* 자동 생성 (site/tools_make_pinyin_map.py): 홈페이지 중국어 한자 → 한어병음. 글 전체 읽기(R)와 글자 하나 읽기(C) */\n"
      f"window.YEM_PY = {{ R: {json.dumps(runs, ensure_ascii=False, separators=(',', ':'))},\n"
      f"  C: {json.dumps(chars, ensure_ascii=False, separators=(',', ':'))} }};\n")
open(os.path.join(HERE, "pinyin-map.js"), "w", encoding="utf-8").write(js)
print(len(runs), "runs,", len(chars), "chars,", round(len(js.encode()) / 1024), "KB")
