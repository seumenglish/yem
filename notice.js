/* 내 공부방 · 공지사항 — 이 파일만 고치면 공지가 바뀌어요.
   위에 있을수록 먼저 보여요. date는 보이는 날짜(글자), until을 넣으면 그 날짜(YYYY-MM-DD)가 지나면 자동으로 숨겨요. */
/* 이번 주 말씀 — 주보가 바뀌면 여기만 고쳐요 (YEM 소개 첫 화면에 나와요) */
window.YEM_THIS_WEEK = {
  date: '2026.11.15',
  title: 'Pray in Every Season',
  ko: '모든 계절에 기도해요',
  ref: 'James 5:13-18 (NLT)',
  refKo: '야고보서 5:13-18',
  points: [
    ['Pray in Every Situation', '힘들 때도, 기쁠 때도 모든 순간을 하나님께 가져가요.'],
    ['Pray Together', '혼자 짐을 지지 말고 교회 가족과 함께 기도해요.'],
    ['Pray with a Clean Heart', '솔직하게 고백하고 빛 가운데 걸으면 회복이 찾아와요.'],
    ['Pray Like Elijah', '엘리야도 우리와 같은 사람이었어요. 힘은 하나님께 있으니 작은 구름이 보일 때까지 기도해요.'],
  ],
  closing: "You don't need to be a superhero. You just need to pray.",
};

window.YEM_NOTICE = [
  { tag: '예배', title: '영어예배는 매주 주일 오후 2시', body: '인천영락교회 2층 다윗홀 · 문새럴 목사님과 함께해요. 친구와 함께 오세요!' },
  { tag: '스토리북', title: '크리스마스 스토리북 5권을 모아요', body: '11/29 Book 1 · 12/6 Book 2 · 12/13 Book 3 · 12/20 Book 4 · 12/27 Book 5. 다섯 권을 다 받으면 12월 27일에 크리스마스 북 챔피언 수료증을 받아요.', until: '2026-12-31' },
  { tag: '새 기능', title: '성경 친구 카드를 모아 보세요', body: '스토리북을 읽거나 들으면 그 쪽에 나오는 친구 카드가 생겨요. 내 기록에서 카드첩을 볼 수 있어요.' },
];
