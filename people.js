/* 성경 인물 73명 — 영어 이름 · 우리말 이름 · 발음 · 인물 설명 · 성경 출처 · 그림
   인물 설명은 YEM이 아이들 눈높이로 새로 쓴 글이고, 그림은 아래 portrait()가 코드로 그립니다.
   그림 정보: g = 'm'(남) / 'f'(여), s = 피부, h = 머리색, b = 수염(0 없음 · 1 짧게 · 2 길게),
   w = 머리 장식(veil 베일 · crown 왕관 · turban 터번 · helmet 투구 · band 머리띠 · halo 빛), c = 옷, c2 = 장식 색, e = 상징 그림, y = 어린이 */
(() => {
  const SK = ['#f7d7b8', '#ecbf96', '#d9a477'];
  const HR = { br: '#5b3a24', bk: '#2b2220', gy: '#a3a09b', wh: '#ece8e0', rd: '#b5532e', lt: '#9a6a32' };
  const P = (id, t, en, ko, ipa, read, desc, ref, look) => ({ id, t, en, ko, ipa, read, desc, ref, ...look });

  const OT = [
    P('adam', 'OT', 'Adam', '아담', '/ˈædəm/', '애덤', '하나님이 흙으로 처음 만드신 사람', '창세기 2:7-25', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#7fb069', e: '🌳' }),
    P('eve', 'OT', 'Eve', '하와', '/iːv/', '이브', '아담의 아내, 모든 사람의 어머니', '창세기 2:18-3:20', { g: 'f', s: SK[1], h: HR.br, c: '#9ccf7a', e: '🍎' }),
    P('cain', 'OT', 'Cain', '가인', '/keɪn/', '케인', '아담과 하와의 첫아들, 화를 참지 못한 형', '창세기 4:1-16', { g: 'm', s: SK[1], h: HR.rd, c: '#b07a4f', e: '🌾', y: 1 }),
    P('abel', 'OT', 'Abel', '아벨', '/ˈeɪbəl/', '에이블', '정성을 다해 하나님께 제물을 드린 동생', '창세기 4:1-10', { g: 'm', s: SK[0], h: HR.br, c: '#c9d6a3', e: '🐑', y: 1 }),
    P('noah', 'OT', 'Noah', '노아', '/ˈnoʊə/', '노아', '하나님 말씀대로 큰 방주를 지은 사람', '창세기 6:9-9:17', { g: 'm', s: SK[1], h: HR.wh, b: 2, c: '#6b8fb8', e: '🚢' }),
    P('abraham', 'OT', 'Abraham', '아브라함', '/ˈeɪbrəhæm/', '에이브러햄', '하나님을 믿고 길을 떠난 믿음의 조상', '창세기 12:1-9', { g: 'm', s: SK[1], h: HR.gy, b: 2, w: 'turban', c: '#c98b4f', c2: '#efe1c4', e: '⭐' }),
    P('sarah', 'OT', 'Sarah', '사라', '/ˈserə/', '세라', '아흔 살에 아들 이삭을 낳고 크게 웃은 엄마', '창세기 21:1-7', { g: 'f', s: SK[1], h: HR.gy, w: 'veil', c: '#d98aa6', c2: '#f3d9e2', e: '😄' }),
    P('isaac', 'OT', 'Isaac', '이삭', '/ˈaɪzək/', '아이작', '‘웃음’이라는 이름을 가진 약속의 아들', '창세기 22:1-19', { g: 'm', s: SK[0], h: HR.br, c: '#8fb3d9', e: '🔥', y: 1 }),
    P('rebekah', 'OT', 'Rebekah', '리브가', '/rɪˈbekə/', '리베카', '낙타에게도 물을 길어 준 친절한 여인', '창세기 24장', { g: 'f', s: SK[1], h: HR.bk, w: 'veil', c: '#e0a458', c2: '#f7e3c0', e: '🐫' }),
    P('jacob', 'OT', 'Jacob', '야곱', '/ˈdʒeɪkəb/', '제이컵', '꿈에서 하늘 사다리를 본 이스라엘의 아버지', '창세기 28:10-22', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#9c7bb5', e: '🪜' }),
    P('rachel', 'OT', 'Rachel', '라헬', '/ˈreɪtʃəl/', '레이철', '양 떼를 돌보던 야곱의 사랑하는 아내', '창세기 29:1-30', { g: 'f', s: SK[0], h: HR.bk, c: '#f0b8c8', e: '🐑' }),
    P('joseph-ot', 'OT', 'Joseph', '요셉', '/ˈdʒoʊzɪf/', '조지프', '꿈을 꾸던 소년, 이집트의 총리가 되었어요', '창세기 37-50장', { g: 'm', s: SK[0], h: HR.br, c: '#e86b8a', c2: '#f5c542', e: '🌈', y: 1 }),
    P('moses', 'OT', 'Moses', '모세', '/ˈmoʊzɪz/', '모지즈', '홍해를 건너 이스라엘을 이끈 지도자', '출애굽기 14장', { g: 'm', s: SK[1], h: HR.wh, b: 2, c: '#c0392b', e: '🌊' }),
    P('aaron', 'OT', 'Aaron', '아론', '/ˈerən/', '에런', '모세를 도운 형, 첫 번째 대제사장', '출애굽기 4:14-16', { g: 'm', s: SK[1], h: HR.gy, b: 2, w: 'turban', c: '#4a6fa5', c2: '#f3f0e6', e: '🪔' }),
    P('miriam', 'OT', 'Miriam', '미리암', '/ˈmɪriəm/', '미리엄', '홍해를 건넌 뒤 소고 치며 찬양한 누나', '출애굽기 15:20-21', { g: 'f', s: SK[1], h: HR.bk, w: 'band', c: '#f2a65a', c2: '#e05d5d', e: '🪘' }),
    P('joshua', 'OT', 'Joshua', '여호수아', '/ˈdʒɑːʃuə/', '조슈아', '여리고 성을 돌아 무너뜨린 용감한 지도자', '여호수아 6장', { g: 'm', s: SK[1], h: HR.br, b: 1, w: 'helmet', c: '#8a9a5b', e: '🎺' }),
    P('caleb', 'OT', 'Caleb', '갈렙', '/ˈkeɪləb/', '케일럽', '여든다섯 살에도 “저 산을 주세요!” 외친 사람', '여호수아 14:6-14', { g: 'm', s: SK[2], h: HR.gy, b: 1, c: '#b5835a', e: '⛰️' }),
    P('rahab', 'OT', 'Rahab', '라합', '/ˈreɪhæb/', '레이햅', '정탐꾼을 숨겨 주고 붉은 줄을 매단 여인', '여호수아 2장', { g: 'f', s: SK[1], h: HR.bk, c: '#d64545', e: '🧵' }),
    P('deborah', 'OT', 'Deborah', '드보라', '/ˈdebərə/', '데버러', '종려나무 아래에서 백성을 재판한 여선지자', '사사기 4-5장', { g: 'f', s: SK[1], h: HR.br, w: 'veil', c: '#5fa38a', c2: '#d7efe6', e: '🌴' }),
    P('gideon', 'OT', 'Gideon', '기드온', '/ˈɡɪdiən/', '기디언', '300명의 용사와 항아리, 횃불로 이긴 사사', '사사기 7장', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#a0785a', e: '🏺' }),
    P('samson', 'OT', 'Samson', '삼손', '/ˈsæmsən/', '샘슨', '하나님이 주신 큰 힘을 가진 긴 머리 사사', '사사기 16장', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#c26a3d', e: '💪', long: 1 }),
    P('ruth', 'OT', 'Ruth', '룻', '/ruːθ/', '루스', '시어머니 나오미를 끝까지 따른 착한 며느리', '룻기 1:16-17', { g: 'f', s: SK[0], h: HR.lt, w: 'veil', c: '#e8b84a', c2: '#fbeec4', e: '🌾' }),
    P('naomi', 'OT', 'Naomi', '나오미', '/neɪˈoʊmi/', '네이오미', '룻을 딸처럼 사랑한 시어머니', '룻기 1장', { g: 'f', s: SK[1], h: HR.gy, w: 'veil', c: '#9b8bb4', c2: '#e6e0f0', e: '🏠' }),
    P('hannah', 'OT', 'Hannah', '한나', '/ˈhænə/', '해나', '눈물로 기도해서 사무엘을 얻은 엄마', '사무엘상 1장', { g: 'f', s: SK[0], h: HR.br, w: 'veil', c: '#7aa6c9', c2: '#e2eef7', e: '🙏' }),
    P('samuel', 'OT', 'Samuel', '사무엘', '/ˈsæmjuəl/', '새뮤얼', '“말씀하세요, 듣겠습니다” 대답한 아이', '사무엘상 3장', { g: 'm', s: SK[0], h: HR.br, c: '#f3efe2', e: '👂', y: 1 }),
    P('saul', 'OT', 'Saul', '사울', '/sɔːl/', '솔', '키가 크고 멋졌던 이스라엘의 첫 번째 왕', '사무엘상 10장', { g: 'm', s: SK[1], h: HR.bk, b: 1, w: 'crown', c: '#7d3c98', e: '👑' }),
    P('david', 'OT', 'David', '다윗', '/ˈdeɪvɪd/', '데이비드', '물맷돌로 골리앗을 이기고 찬양을 지은 왕', '사무엘상 17장', { g: 'm', s: SK[0], h: HR.rd, c: '#5dade2', e: '🎵', y: 1 }),
    P('goliath', 'OT', 'Goliath', '골리앗', '/ɡəˈlaɪəθ/', '걸라이어스', '하나님을 놀리다 소년 다윗에게 진 거인', '사무엘상 17장', { g: 'm', s: SK[2], h: HR.bk, b: 1, w: 'helmet', c: '#7f8c8d', e: '🛡️' }),
    P('jonathan', 'OT', 'Jonathan', '요나단', '/ˈdʒɑːnəθən/', '조너선', '다윗과 마음을 나눈 둘도 없는 친구', '사무엘상 18:1-4', { g: 'm', s: SK[0], h: HR.br, c: '#48a37a', e: '🏹' }),
    P('solomon', 'OT', 'Solomon', '솔로몬', '/ˈsɑːləmən/', '살러먼', '하나님께 지혜를 구한 지혜로운 왕', '열왕기상 3:5-14', { g: 'm', s: SK[1], h: HR.bk, b: 1, w: 'crown', c: '#2e86c1', e: '📜' }),
    P('elijah', 'OT', 'Elijah', '엘리야', '/ɪˈlaɪdʒə/', '일라이자', '기도로 하늘에서 불을 내린 선지자', '열왕기상 18장', { g: 'm', s: SK[2], h: HR.gy, b: 2, c: '#a67c52', e: '🔥' }),
    P('elisha', 'OT', 'Elisha', '엘리사', '/ɪˈlaɪʃə/', '일라이샤', '엘리야의 겉옷을 이어받은 선지자', '열왕기하 2장', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#6c8ebf', e: '🧥' }),
    P('isaiah', 'OT', 'Isaiah', '이사야', '/aɪˈzeɪə/', '아이제이아', '“내가 여기 있나이다, 나를 보내소서!”', '이사야 6:1-8', { g: 'm', s: SK[1], h: HR.gy, b: 2, c: '#5b7db1', e: '📣' }),
    P('jeremiah', 'OT', 'Jeremiah', '예레미야', '/ˌdʒerɪˈmaɪə/', '제러마이어', '백성을 위해 눈물로 기도한 선지자', '예레미야 1:4-10', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#8e7cc3', e: '💧' }),
    P('daniel', 'OT', 'Daniel', '다니엘', '/ˈdænjəl/', '대니얼', '사자 굴에서도 하나님이 지켜 주신 사람', '다니엘 6장', { g: 'm', s: SK[1], h: HR.bk, w: 'turban', c: '#c0392b', c2: '#f5d76e', e: '🦁' }),
    P('jonah', 'OT', 'Jonah', '요나', '/ˈdʒoʊnə/', '조나', '큰 물고기 배 속에서 사흘 동안 기도한 선지자', '요나 1-2장', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#48a9c5', e: '🐋' }),
    P('esther', 'OT', 'Esther', '에스더', '/ˈestər/', '에스터', '용기를 내어 백성을 구한 아름다운 왕비', '에스더 4:14-16', { g: 'f', s: SK[0], h: HR.bk, w: 'crown', c: '#af7ac5', e: '💎' }),
    P('job', 'OT', 'Job', '욥', '/dʒoʊb/', '조브', '큰 어려움 속에서도 하나님을 믿은 사람', '욥기 1:20-22', { g: 'm', s: SK[2], h: HR.gy, b: 2, c: '#a1887f', e: '🌤️' }),
  ];

  const NT = [
    P('jesus', 'NT', 'Jesus', '예수님', '/ˈdʒiːzəs/', '지저스', '우리를 사랑하셔서 이 땅에 오신 하나님의 아들', '요한복음 3:16', { g: 'm', s: SK[1], h: HR.br, b: 1, w: 'halo', c: '#fdfefe', c2: '#c0392b', e: '✝️', long: 1 }),
    P('mary', 'NT', 'Mary', '마리아', '/ˈmeri/', '메리', '천사의 말을 믿고 예수님을 낳은 엄마', '누가복음 1:26-38', { g: 'f', s: SK[0], h: HR.br, w: 'veil', c: '#3f7cc0', c2: '#9cc3ea', e: '👶' }),
    P('joseph-nt', 'NT', 'Joseph', '요셉', '/ˈdʒoʊzɪf/', '조지프', '마리아와 아기 예수님을 지킨 목수', '마태복음 1:18-25', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#a0785a', e: '🔨' }),
    P('elizabeth', 'NT', 'Elizabeth', '엘리사벳', '/ɪˈlɪzəbəθ/', '일리저버스', '세례 요한의 엄마, 마리아의 친척', '누가복음 1:39-45', { g: 'f', s: SK[1], h: HR.gy, w: 'veil', c: '#c39bd3', c2: '#efe3f5', e: '🤰' }),
    P('zechariah', 'NT', 'Zechariah', '사가랴', '/ˌzekəˈraɪə/', '제커라이어', '천사의 말에 말을 못 하게 된 제사장', '누가복음 1:5-25', { g: 'm', s: SK[1], h: HR.wh, b: 2, w: 'turban', c: '#5d6d7e', c2: '#f3f0e6', e: '🤫' }),
    P('john-baptist', 'NT', 'John the Baptist', '세례 요한', '/dʒɑːn ðə ˈbæptɪst/', '존 더 뱁티스트', '광야에서 “회개하라!” 외치며 세례를 준 사람', '마태복음 3:1-17', { g: 'm', s: SK[2], h: HR.bk, b: 2, c: '#8d6e4a', e: '🍯', long: 1 }),
    P('simeon', 'NT', 'Simeon', '시므온', '/ˈsɪmiən/', '시미언', '아기 예수님을 안고 하나님을 찬양한 할아버지', '누가복음 2:25-35', { g: 'm', s: SK[0], h: HR.wh, b: 2, c: '#85c1e9', e: '🕊️' }),
    P('anna', 'NT', 'Anna', '안나', '/ˈænə/', '애나', '성전에서 밤낮 기도한 여든네 살 선지자', '누가복음 2:36-38', { g: 'f', s: SK[1], h: HR.wh, w: 'veil', c: '#7fb3a5', c2: '#e3f1ec', e: '🕯️' }),
    P('peter', 'NT', 'Peter', '베드로', '/ˈpiːtər/', '피터', '물 위를 걸었던 어부 출신 제자', '마태복음 14:22-33', { g: 'm', s: SK[1], h: HR.gy, b: 1, c: '#3498db', e: '🎣' }),
    P('andrew', 'NT', 'Andrew', '안드레', '/ˈændruː/', '앤드루', '형 베드로를 예수님께 데려온 제자', '요한복음 1:40-42', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#1abc9c', e: '🐟' }),
    P('james', 'NT', 'James', '야고보', '/dʒeɪmz/', '제임스', '그물을 두고 바로 예수님을 따른 제자', '마태복음 4:21-22', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#e67e22', e: '🛶' }),
    P('john', 'NT', 'John', '요한', '/dʒɑːn/', '존', '예수님의 사랑을 많이 받은 제자', '요한복음 19:26-27', { g: 'm', s: SK[0], h: HR.br, c: '#e74c3c', e: '❤️', y: 1 }),
    P('matthew', 'NT', 'Matthew', '마태', '/ˈmæθjuː/', '매슈', '세금 걷던 일을 그만두고 예수님을 따른 제자', '마태복음 9:9-13', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#f1c40f', e: '💰' }),
    P('thomas', 'NT', 'Thomas', '도마', '/ˈtɑːməs/', '타머스', '부활하신 예수님을 보고 “나의 주님!” 고백한 제자', '요한복음 20:24-29', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#e59866', e: '✋' }),
    P('philip', 'NT', 'Philip', '빌립', '/ˈfɪlɪp/', '필립', '“와서 보라!” 친구를 예수님께 데려온 제자', '요한복음 6:5-7', { g: 'm', s: SK[1], h: HR.lt, b: 1, c: '#52be80', e: '🍞' }),
    P('nicodemus', 'NT', 'Nicodemus', '니고데모', '/ˌnɪkəˈdiːməs/', '니커디머스', '밤에 예수님을 찾아와 질문한 선생님', '요한복음 3:1-15', { g: 'm', s: SK[0], h: HR.gy, b: 2, w: 'turban', c: '#34495e', c2: '#d5d8dc', e: '🌙' }),
    P('zacchaeus', 'NT', 'Zacchaeus', '삭개오', '/zæˈkiːəs/', '재키어스', '키가 작아 나무 위에서 예수님을 본 세리', '누가복음 19:1-10', { g: 'm', s: SK[1], h: HR.br, b: 1, c: '#76b041', e: '🌳' }),
    P('lazarus', 'NT', 'Lazarus', '나사로', '/ˈlæzərəs/', '래저러스', '죽었다가 예수님 말씀에 다시 살아난 친구', '요한복음 11장', { g: 'm', s: SK[0], h: HR.br, c: '#f4f6f6', e: '🌅' }),
    P('martha', 'NT', 'Martha', '마르다', '/ˈmɑːrθə/', '마서', '예수님을 위해 정성껏 음식을 준비한 언니', '누가복음 10:38-42', { g: 'f', s: SK[1], h: HR.br, w: 'band', c: '#e57373', c2: '#fff3e0', e: '🍲' }),
    P('mary-magdalene', 'NT', 'Mary Magdalene', '막달라 마리아', '/ˈmeri ˈmæɡdəlin/', '메리 맥덜린', '부활하신 예수님을 가장 먼저 만난 여인', '요한복음 20:11-18', { g: 'f', s: SK[0], h: HR.rd, c: '#c0392b', e: '🌸' }),
    P('bartimaeus', 'NT', 'Bartimaeus', '바디매오', '/ˌbɑːrtɪˈmiːəs/', '바티미어스', '“예수님, 불쌍히 여겨 주세요!” 외쳐 눈을 뜬 사람', '마가복음 10:46-52', { g: 'm', s: SK[2], h: HR.gy, b: 1, c: '#a1887f', e: '👀' }),
    P('jairus', 'NT', 'Jairus', '야이로', '/ˈdʒaɪrəs/', '자이러스', '아픈 딸을 위해 예수님께 달려온 회당장', '마가복음 5:21-43', { g: 'm', s: SK[1], h: HR.bk, b: 1, w: 'turban', c: '#6c5ce7', c2: '#dcd6f7', e: '👧' }),
    P('judas', 'NT', 'Judas Iscariot', '가룟 유다', '/ˈdʒuːdəs ɪˈskæriət/', '주더스 이스캐리엇', '은 30개에 예수님을 판 제자', '마태복음 26:14-16', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#7f8c8d', e: '🪙' }),
    P('pilate', 'NT', 'Pontius Pilate', '빌라도', '/ˈpɑːnʃəs ˈpaɪlət/', '판셔스 파일럿', '예수님께 죄가 없음을 알면서도 손을 씻은 총독', '마태복음 27:11-26', { g: 'm', s: SK[0], h: HR.lt, c: '#b03a2e', e: '🏛️' }),
    P('stephen', 'NT', 'Stephen', '스데반', '/ˈstiːvən/', '스티븐', '얼굴이 천사처럼 빛난 첫 순교자', '사도행전 7장', { g: 'm', s: SK[0], h: HR.br, c: '#f7dc6f', e: '✨', y: 1 }),
    P('paul', 'NT', 'Paul', '바울', '/pɔːl/', '폴', '예수님을 만나 온 세상에 복음을 전한 사도', '사도행전 9:1-19', { g: 'm', s: SK[1], h: HR.bk, b: 1, c: '#2874a6', e: '✉️' }),
    P('barnabas', 'NT', 'Barnabas', '바나바', '/ˈbɑːrnəbəs/', '바너버스', '‘위로의 아들’, 친구들을 힘내게 한 사람', '사도행전 4:36-37', { g: 'm', s: SK[1], h: HR.br, b: 2, c: '#58d68d', e: '🤝' }),
    P('silas', 'NT', 'Silas', '실라', '/ˈsaɪləs/', '사일러스', '감옥에서도 바울과 함께 찬양한 친구', '사도행전 16:25-34', { g: 'm', s: SK[2], h: HR.bk, b: 1, c: '#5d6d7e', e: '🎶' }),
    P('timothy', 'NT', 'Timothy', '디모데', '/ˈtɪməθi/', '티머시', '할머니와 엄마에게 믿음을 배운 젊은 일꾼', '디모데후서 1:5', { g: 'm', s: SK[0], h: HR.lt, c: '#5dade2', e: '📖', y: 1 }),
    P('lydia', 'NT', 'Lydia', '루디아', '/ˈlɪdiə/', '리디아', '자주색 옷감을 팔고 집을 교회로 연 여인', '사도행전 16:14-15', { g: 'f', s: SK[1], h: HR.bk, w: 'veil', c: '#8e44ad', c2: '#d7bde2', e: '🧶' }),
    P('dorcas', 'NT', 'Dorcas', '도르가', '/ˈdɔːrkəs/', '도카스', '가난한 이웃에게 옷을 지어 준 착한 여인', '사도행전 9:36-43', { g: 'f', s: SK[1], h: HR.br, w: 'veil', c: '#e74c3c', c2: '#f9d6d2', e: '🪡' }),
    P('ananias', 'NT', 'Ananias', '아나니아', '/ˌænəˈnaɪəs/', '애너나이어스', '눈이 먼 사울에게 손을 얹어 기도한 제자', '사도행전 9:10-19', { g: 'm', s: SK[1], h: HR.gy, b: 2, c: '#a9cce3', e: '🙌' }),
    P('cornelius', 'NT', 'Cornelius', '고넬료', '/kɔːrˈniːliəs/', '코닐리어스', '하나님을 경외하고 기도한 로마 군대 대장', '사도행전 10장', { g: 'm', s: SK[0], h: HR.br, w: 'helmet', c: '#c0392b', e: '⚔️' }),
    P('priscilla', 'NT', 'Priscilla', '브리스길라', '/prɪˈsɪlə/', '프리실러', '남편 아굴라와 천막을 만들며 복음을 가르친 여인', '사도행전 18:1-3', { g: 'f', s: SK[0], h: HR.lt, w: 'band', c: '#f39c12', c2: '#fdebd0', e: '⛺' }),
    P('luke', 'NT', 'Luke', '누가', '/luːk/', '루크', '누가복음과 사도행전을 쓴 의사', '누가복음 1:1-4', { g: 'm', s: SK[0], h: HR.br, b: 1, c: '#48c9b0', e: '🩺' }),
  ];

  /* 띠 색: 구약은 초록·주황 계열, 신약은 파랑·분홍 계열로 돌려 가며 */
  const BAND_OT = ['#4caf7d', '#e0884f', '#6aa84f', '#d4a03a', '#3f9e8f'];
  const BAND_NT = ['#5b8fd6', '#e0778f', '#8b78d6', '#3fa6c8', '#d9708a'];
  const ALL = [...OT, ...NT].map((p, i) => ({
    ...p,
    no: i + 1,
    band: (p.t === 'OT' ? BAND_OT : BAND_NT)[i % 5],
  }));

  /* ---------- 그림: viewBox 0 0 100 100, id 없이 그려서 여러 장을 겹쳐도 안전 ---------- */
  function portrait(p, opts = {}) {
    const s = p.s, h = p.h, c = p.c, c2 = p.c2 || '#ffffff';
    const kid = !!p.y;
    const hy = kid ? 46 : 44; // 머리 중심
    const hr = kid ? 19 : 20;
    const out = [];
    if (opts.bg !== false) out.push(`<rect width="100" height="100" rx="14" fill="${opts.bg || '#fff8fb'}"/>`);
    if (p.w === 'halo') out.push(`<circle cx="50" cy="${hy - 4}" r="29" fill="#fff4c2"/><circle cx="50" cy="${hy - 4}" r="29" fill="none" stroke="#f5cd4f" stroke-width="3"/>`);
    // 긴 머리 (여자 · 삼손 · 예수님 · 세례 요한) — 머리 뒤로
    if ((p.g === 'f' || p.long) && p.w !== 'veil') out.push(`<path d="M${50 - hr - 4} ${hy} Q${50 - hr - 6} ${hy + 30} ${50 - hr + 2} ${hy + 34} L${50 + hr - 2} ${hy + 34} Q${50 + hr + 6} ${hy + 30} ${50 + hr + 4} ${hy} Z" fill="${h}"/>`);
    // 몸 · 옷
    out.push(`<path d="M14 100 Q16 ${hy + 26} 50 ${hy + 23} Q84 ${hy + 26} 86 100 Z" fill="${c}"/>`);
    out.push(`<path d="M42 ${hy + 23} L50 ${hy + 33} L58 ${hy + 23} Z" fill="${s}"/>`);
    if (p.c2 && p.w !== 'veil' && p.w !== 'turban' && p.w !== 'band') out.push(`<path d="M30 ${hy + 30} L70 100 L62 100 L26 ${hy + 34} Z" fill="${c2}" opacity=".9"/>`);
    if (p.w === 'helmet') out.push(`<path d="M24 100 L26 ${hy + 32} Q50 ${hy + 24} 74 ${hy + 32} L76 100 Z" fill="#b9c2cc" opacity=".85"/>`);
    // 베일 (머리 뒤)
    if (p.w === 'veil') out.push(`<path d="M${50 - hr - 7} ${hy + 2} Q${50 - hr - 8} ${hy - hr - 8} 50 ${hy - hr - 8} Q${50 + hr + 8} ${hy - hr - 8} ${50 + hr + 7} ${hy + 2} L${50 + hr + 12} ${hy + 40} L${50 - hr - 12} ${hy + 40} Z" fill="${c2}"/>`);
    // 귀 · 얼굴
    out.push(`<circle cx="${50 - hr}" cy="${hy + 2}" r="4" fill="${s}"/><circle cx="${50 + hr}" cy="${hy + 2}" r="4" fill="${s}"/>`);
    out.push(`<circle cx="50" cy="${hy}" r="${hr}" fill="${s}"/>`);
    // 머리카락 (윗부분)
    if (p.w !== 'veil' && p.w !== 'turban' && p.w !== 'helmet') {
      out.push(p.g === 'f' || p.long
        ? `<path d="M${50 - hr - 2} ${hy + 4} Q${50 - hr - 3} ${hy - hr - 3} 50 ${hy - hr - 3} Q${50 + hr + 3} ${hy - hr - 3} ${50 + hr + 2} ${hy + 4} Q${50 + hr - 4} ${hy - 8} 54 ${hy - 10} Q50 ${hy - 4} 44 ${hy - 10} Q${50 - hr + 4} ${hy - 8} ${50 - hr - 2} ${hy + 4} Z" fill="${h}"/>`
        : `<path d="M${50 - hr - 1} ${hy} Q${50 - hr - 1} ${hy - hr - 3} 50 ${hy - hr - 3} Q${50 + hr + 1} ${hy - hr - 3} ${50 + hr + 1} ${hy} Q${50 + hr - 4} ${hy - 10} 50 ${hy - 11} Q${50 - hr + 4} ${hy - 10} ${50 - hr - 1} ${hy} Z" fill="${h}"/>`);
    }
    // 베일 앞쪽 테두리
    if (p.w === 'veil') out.push(`<path d="M${50 - hr - 3} ${hy + 6} Q${50 - hr - 3} ${hy - hr - 4} 50 ${hy - hr - 4} Q${50 + hr + 3} ${hy - hr - 4} ${50 + hr + 3} ${hy + 6} Q${50 + hr - 2} ${hy - hr + 4} 50 ${hy - hr + 4} Q${50 - hr + 2} ${hy - hr + 4} ${50 - hr - 3} ${hy + 6} Z" fill="${c}"/><path d="M44 ${hy - hr + 4} Q50 ${hy - hr + 8} 56 ${hy - hr + 4}" stroke="${h}" stroke-width="3" fill="none"/>`);
    // 수염
    if (p.b) {
      const len = p.b === 2 ? 26 : 14;
      out.push(`<path d="M${50 - hr + 2} ${hy + 2} Q${50 - hr + 4} ${hy + len} 50 ${hy + len + 2} Q${50 + hr - 4} ${hy + len} ${50 + hr - 2} ${hy + 2} Q${50 + 10} ${hy + 12} 50 ${hy + 12} Q${50 - 10} ${hy + 12} ${50 - hr + 2} ${hy + 2} Z" fill="${h}"/>`);
    }
    // 눈 · 볼 · 입
    out.push(`<circle cx="43" cy="${hy + 1}" r="2.4" fill="#3a2a22"/><circle cx="57" cy="${hy + 1}" r="2.4" fill="#3a2a22"/>`);
    out.push(`<circle cx="43.8" cy="${hy + 0.2}" r=".8" fill="#fff"/><circle cx="57.8" cy="${hy + 0.2}" r=".8" fill="#fff"/>`);
    out.push(`<ellipse cx="38" cy="${hy + 7}" rx="3.6" ry="2.2" fill="#f28b9b" opacity=".55"/><ellipse cx="62" cy="${hy + 7}" rx="3.6" ry="2.2" fill="#f28b9b" opacity=".55"/>`);
    out.push(`<path d="M45 ${hy + 8} Q50 ${hy + 13} 55 ${hy + 8}" stroke="${p.b ? '#fff' : '#a0473f'}" stroke-width="2" fill="none" stroke-linecap="round"/>`);
    if (p.g === 'f') out.push(`<path d="M40.9 ${hy + 0.2} l-2.2 -1.3 M59.1 ${hy + 0.2} l2.2 -1.3" stroke="#3a2a22" stroke-width="1.1" stroke-linecap="round"/>`);
    // 머리 장식
    if (p.w === 'crown') out.push(`<path d="M${50 - 14} ${hy - hr + 2} L${50 - 15} ${hy - hr - 12} L${50 - 7} ${hy - hr - 4} L50 ${hy - hr - 14} L${50 + 7} ${hy - hr - 4} L${50 + 15} ${hy - hr - 12} L${50 + 14} ${hy - hr + 2} Z" fill="#f4c542" stroke="#d49b1e" stroke-width="1"/><circle cx="50" cy="${hy - hr - 3}" r="2" fill="#e74c3c"/>`);
    if (p.w === 'turban') out.push(`<path d="M${50 - hr - 2} ${hy - 4} Q${50 - hr - 3} ${hy - hr - 12} 50 ${hy - hr - 12} Q${50 + hr + 3} ${hy - hr - 12} ${50 + hr + 2} ${hy - 4} Q50 ${hy - 12} ${50 - hr - 2} ${hy - 4} Z" fill="${c2}"/><path d="M${50 - hr} ${hy - 9} Q50 ${hy - 17} ${50 + hr} ${hy - 9}" stroke="${c}" stroke-width="2.5" fill="none"/>`);
    if (p.w === 'helmet') out.push(`<path d="M${50 - hr - 2} ${hy - 2} Q${50 - hr - 2} ${hy - hr - 6} 50 ${hy - hr - 6} Q${50 + hr + 2} ${hy - hr - 6} ${50 + hr + 2} ${hy - 2} L${50 + hr - 2} ${hy - 6} Q50 ${hy - 10} ${50 - hr + 2} ${hy - 6} Z" fill="#aab4be" stroke="#7b8794" stroke-width="1.2"/><path d="M50 ${hy - hr - 6} Q46 ${hy - hr - 18} 58 ${hy - hr - 16}" stroke="#d64545" stroke-width="5" fill="none" stroke-linecap="round"/>`);
    if (p.w === 'band') out.push(`<path d="M${50 - hr} ${hy - 8} Q50 ${hy - 15} ${50 + hr} ${hy - 8}" stroke="${c2}" stroke-width="4" fill="none" stroke-linecap="round"/>`);
    // 상징 그림
    if (p.e && opts.prop !== false) out.push(`<circle cx="82" cy="80" r="15" fill="#fff" stroke="#f6c9d6" stroke-width="2"/><text x="82" y="87" font-size="19" text-anchor="middle" font-family="'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif">${p.e}</text>`);
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.ko}">${out.join('')}</svg>`;
  }

  /* 여러 인물이 모여 있는 그림 (성경 인물 페이지 맨 위) */
  function crowd(ids) {
    const pick = (ids || ['noah', 'moses', 'david', 'esther', 'daniel', 'jonah', 'ruth', 'abraham', 'mary', 'jesus', 'peter', 'zacchaeus', 'paul', 'lydia', 'john', 'elijah', 'miriam', 'samuel'])
      .map((id) => ALL.find((p) => p.id === id)).filter(Boolean);
    const rows = [pick.slice(0, 6), pick.slice(6, 12), pick.slice(12, 18)].filter((x) => x.length);
    const parts = [];
    rows.forEach((row, r) => {
      const size = 92 + r * 14;
      const gap = 600 / (row.length + (r === 1 ? 0.5 : 0));
      row.forEach((p, i) => {
        const x = (r === 1 ? gap * 0.25 : 0) + gap * i + gap / 2 - size / 2 + (r === 2 ? 0 : 0);
        const y = 6 + r * 50;
        const inner = portrait(p, { bg: false, prop: r === rows.length - 1 }).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
        parts.push(`<svg x="${x.toFixed(1)}" y="${y}" width="${size}" height="${size}" viewBox="0 0 100 100">${inner}</svg>`);
      });
    });
    const H = 6 + (rows.length - 1) * 50 + 92 + (rows.length - 1) * 14;
    return `<svg class="crowd" viewBox="0 0 600 ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="성경 인물들이 모여 있는 그림">${parts.join('')}</svg>`;
  }

  window.PEOPLE = ALL;
  window.PEOPLE_ART = { portrait, crowd };
})();

/* ---------- 카드 (웹 페이지와 인쇄용 PDF가 같이 씀) ---------- */
(() => {
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nameSize = (en) => Math.min(15, 86 / (en.length * 0.62)).toFixed(2);
  function front(p) {
    return `<div class="pcard pc-front" style="--band:${p.band}">
      <div class="pc-art">${PEOPLE_ART.portrait(p, { bg: '#ffffff' })}</div>
      <p class="pc-desc">${esc(p.desc)}</p>
      <div class="pc-band"><span style="font-size:${nameSize(p.en)}cqw">${esc(p.en)}</span></div>
      <div class="pc-ko">${esc(p.ko)}</div>
      <div class="pc-foot"><span class="pc-ref">${esc(p.ref)}</span><i></i><span class="pc-meta"><small>YEM 성경 인물</small>${p.t === 'OT' ? '구약' : '신약'} No.${String(p.no).padStart(2, '0')}</span></div>
    </div>`;
  }
  function back(p) {
    return `<div class="pcard pc-back" style="--band:${p.band}">
      <img src="assets/yunhee/logo.png" alt="">
      <b>YEM</b><small>영어예배부 찬양학습</small>
      <div class="pc-no">${p.t === 'OT' ? '구약' : '신약'} No.${String(p.no).padStart(2, '0')}</div>
      <small class="pc-url">yem-brown.vercel.app</small>
    </div>`;
  }
  PEOPLE_ART.front = front;
  PEOPLE_ART.back = back;
})();
