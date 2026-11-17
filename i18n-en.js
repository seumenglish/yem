/* 작은 영어 버전 (🇰🇷 ⇄ 🇺🇸)
   한국어 화면은 그대로 두고, 영어를 고르면 화면의 한국어 글을 이 사전대로 바꿔 보여 줘요.
   - 범위: 메뉴 · 첫 화면(YEM 소개 · 예배 안내) · 스토리북 · 찬양(듣기 · 가사지) · 성경 인물
   - 사전에 없는 한국어는 그대로 남아요. 새 문구를 영어로도 보이게 하려면 EXACT 에 한 줄 추가해요.
   - 선택은 이 기기에 저장 (yem.lang = "en") */
(() => {
  const KEY = 'yem.lang';
  let lang = 'ko';
  try { lang = JSON.parse(localStorage.getItem(KEY) || '"ko"'); } catch (e) { lang = 'ko'; }

  /* 언어 버튼 (위 메뉴 오른쪽) */
  function addToggle() {
    const host = document.querySelector('.top-user') || document.querySelector('#top-right');
    if (!host || host.querySelector('.lang-btn')) return;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lang-btn';
    b.setAttribute('aria-label', lang === 'en' ? '한국어로 보기' : 'View in English');
    b.innerHTML = lang === 'en' ? '<span>🇰🇷</span>한국어' : '<span>🇺🇸</span>EN';
    b.addEventListener('click', () => {
      try { localStorage.setItem(KEY, JSON.stringify(lang === 'en' ? 'ko' : 'en')); } catch (e) { /* 저장 불가 */ }
      location.reload();
    });
    host.prepend(b);
  }
  new MutationObserver(addToggle).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', addToggle);
  addToggle();
  if (lang !== 'en') return;

  document.documentElement.lang = 'en';
  document.documentElement.classList.add('lang-en');

  const BIBLE = { '창세기': 'Genesis', '출애굽기': 'Exodus', '사무엘상': '1 Samuel', '사무엘하': '2 Samuel', '시편': 'Psalm', '이사야': 'Isaiah', '마태복음': 'Matthew', '마가복음': 'Mark', '누가복음': 'Luke', '요한복음': 'John', '사도행전': 'Acts', '빌립보서': 'Philippians', '히브리서': 'Hebrews', '에베소서': 'Ephesians', '디모데후서': '2 Timothy', '요한계시록': 'Revelation', '요나': 'Jonah', '에스더': 'Esther', '로마서': 'Romans' };
  const refEn = (s) => s.replace(/(창세기|출애굽기|사무엘상|사무엘하|시편|이사야|마태복음|마가복음|누가복음|요한복음|사도행전|빌립보서|히브리서|에베소서|디모데후서|요한계시록|로마서)\s?/g, (m, k) => BIBLE[k] + ' ');
  const BOOKS = { '약속을 지키시는 하나님': 'God Keeps His Promise', '베들레헴으로': 'Off to Bethlehem', '큰 기쁨의 좋은 소식': 'Good News of Great Joy', '왕께 드린 선물': 'Gifts for the King', '예수님을 기다린 사람들': 'Waiting for Jesus' };
  const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const ADVENT = { '소망': 'Hope', '평화': 'Peace', '기쁨': 'Joy', '사랑': 'Love' };

  const EXACT = {
    // 메뉴 · 위아래 띠
    'YEM 영어예배부': 'YEM English Ministry', 'YEM 소개': 'About YEM', '해외 CCM 배우기': 'Praise Songs', '한 곡씩': 'Song by song', '월별': 'Monthly',
    '단어': 'Words', '문장': 'Sentences', '말씀 암송': 'Memory Verses', '스토리북': 'Books', '성경 인물': 'People', '내 공부방': 'My Room',
    '👋 내 이름 등록': '👋 Add my name', '주요 메뉴': 'Main menu', '내 이름 등록 · 친구 바꾸기': 'Add my name · switch', '내 공부방 · 경험치': 'My Room · XP',
    '소개': 'Home', '공부방': 'My Room', '이어하기': 'Continue', '곡으로 돌아가기 ↗': 'Back to the song ↗',
    // 첫 화면: 스토리북 배너 · 추천
    'YEM 바이블': 'YEM Bible', '“아기 예수님이 태어나셨어요!”': '', '✨ 예수님 탄생 이야기': '✨ The Story of Jesus’ Birth', '5권': '· 5 books',
    '12월 추천': 'December Pick', '예수님 탄생 이야기': 'The Story of Jesus’ Birth', '전체 보기': 'See all', 'YEM 바이블 스토리북 · 예수님 탄생 이야기': 'YEM Bible Story Books · The Story of Jesus’ Birth',
    '마구간 구유에 누운 아기 예수님과 기도하는 마리아와 요셉': 'Baby Jesus in the manger with Mary and Joseph praying',
    // 전체 듣기
    '📻 LISTEN ALL · 전체 듣기': '📻 LISTEN ALL', '한 번 틀어 두면': 'Press play once and', '쭉~': 'keep listening', '들어요': '',
    '영어로 듣기': 'English', '등장인물마다 다른 원어민 목소리': 'A different native voice for each character', '中文으로 듣기': '中文 Chinese', '중국어 원어민 목소리': 'Native Chinese voices',
    '영어 + 中文': 'English + 中文', '한 쪽씩 영어 다음 중국어': 'Each page in English, then Chinese', '전체 듣기': 'Listen all',
    '📻 스토리북 영어 전체 듣기': '📻 Story Books · English', '📻 스토리북 中文 전체 듣기': '📻 Story Books · 中文', '📻 스토리북 영어 + 中文 전체 듣기': '📻 Story Books · English + 中文',
    // YEM 소개
    '어서 와, 영어예배부는 처음이지?': 'First time at the English Ministry? Come on in!',
    '작은 발걸음으로 찾아온 이곳에서, 세상을 품는 가장 큰 꿈이 시작돼요.': 'Here, with one small step, the biggest dream — a heart for the whole world — begins.',
    '영어로 찬양하고 말씀으로 자라는 우리, 오늘 당신을 진심으로 환영해요.': 'We praise God in English and grow in His Word. We are so glad you are here!',
    '🕑 매주 주일 오후 2시': '🕑 Every Sunday 2:00 PM', '📍 인천영락교회 2층 다윗홀': '📍 Incheon Younglak Church, David Hall (2F)', '🙏 문새럴 목사님': '🙏 Pastor Moon Shairal',
    '💬 담당 · 문새럴 목사님': '💬 Pastor Moon Shairal', '우리는 이런 공동체예요': 'Our Community',
    '누구나 환영받는 곳': 'A place for everyone',
    '영어를 잘하지 못해도, 오늘 처음 왔어도 괜찮아요. 이곳은 시험을 보는 자리가 아니라 하나님의 사랑을 함께 누리는 자리예요. 여러 나라에서 온 가족들과 어린 친구들, 선생님들이 한 가족처럼 서로의 이름을 불러 주고, 작은 발걸음 하나도 크게 기뻐해 줘요.':
      'It is okay if your English is not perfect, or if today is your first day. This is not a test — it is a place to enjoy God’s love together. Families from many countries, children and teachers call each other by name like one family and celebrate every small step.',
    '영어로 찬양하고 말씀으로 자라요': 'Praise in English, grow in the Word',
    '매달 네 곡씩, 다섯 달 동안 20곡의 영어 찬양을 마음에 새겨요. 처음엔 화면을 보며 따라 부르고, 어느새 가사를 외워 회중을 바라보며 담대히 찬양하게 돼요. 노래 한 줄, 말씀 한 구절이 쌓여 우리 아이들의 마음을 단단하게 채워 가요.':
      'Four songs a month — 20 English worship songs in five months. First we sing along with the screen, and soon we know the words by heart and praise boldly. Line by line and verse by verse, our children’s hearts grow strong.',
    '너의 무대는 세계야!': 'Your stage is the world!',
    '이곳은 단순한 예배의 자리를 넘어, 세상을 향해 나아갈 비전이 시작되는 출발점이에요. 언어를 선물 삼아 하나님의 크신 꿈을 열방에 전하는 사람, 영적으로도 학문적으로도 빛나는 글로벌 리더로 자라도록 함께 기도하고 응원해요.':
      'This is more than a worship service — it is where a vision for the world begins. With language as a gift, we pray for our children to share God’s great dream with the nations and to grow into global leaders who shine in faith and in learning.',
    '예배 순서': 'Order of Worship', '순서는 주마다 조금씩 달라질 수 있어요.': 'The order may change a little each week.',
    '예배로의 부름 · 찬양': 'Call to Worship · Praise',
    '모두 자리에서 일어나 스크린의 가사를 보며 기쁘게 찬양해요. 단어를 다 몰라도 괜찮아요. 박수를 치고 손을 들며 마음을 열면, 어느새 하나님께 드리는 우리만의 축제가 돼요.':
      'We stand and sing with joy, following the lyrics on the screen. It is fine if you don’t know every word — clap, lift your hands and open your heart, and it becomes our celebration for God.',
    '사도신경': 'The Apostles’ Creed',
    '우리가 무엇을 믿는지 영어로 함께 고백해요. 주보 뒷면에 영어 사도신경이 있으니 천천히 따라 읽어 보세요. 한 목소리로 고백할 때 우리는 한 가족이 돼요.':
      'Together we declare what we believe. The creed is on the back of the bulletin — read along slowly. When we confess with one voice, we become one family.',
    '📜 사도신경 배우러 가기 →': '📜 Learn the Apostles’ Creed →', '대표 기도': 'Congregational Prayer',
    '선생님들이 돌아가며 앞에 나와 우리 공동체와 가정, 나라와 열방을 위해 영어로 기도해요. 눈을 감고 같은 마음으로 "아멘" 하며 함께해요.':
      'Teachers take turns praying in English for our community, our families, our country and the nations. Close your eyes and say “Amen” together.',
    '성경 봉독': 'Scripture Reading', '이번 주 말씀을 함께 읽어요. 핵심 구절이 스크린에 크게 나오니 성경책이 없어도 괜찮아요.': 'We read this week’s Scripture together. The key verse is on the big screen, so no Bible is needed.',
    '말씀': 'Sermon',
    '문새럴 목사님이 아이들 눈높이로 생명의 말씀을 전해 주세요. 설교의 핵심과 요약이 주보와 스크린에 함께 나와서, 영어 듣기가 아직 어려운 친구들도 말씀의 은혜를 넉넉히 따라갈 수 있어요.':
      'Pastor Moon shares the Word of life at the children’s level. A summary is on the bulletin and the screen, so everyone can follow along.',
    '주기도문 찬양': 'The Lord’s Prayer (song)', '예수님이 가르쳐 주신 기도를 노래로 함께 불러요. "Our Father, who art in heaven…" 매주 부르다 보면 저절로 외워져요.':
      'We sing the prayer Jesus taught us: “Our Father, who art in heaven…” Sing it every week and you will know it by heart.',
    '🙏 주기도문 찬양 배우러 가기 →': '🙏 Learn the Lord’s Prayer song →', '마침 기도': 'Closing Prayer',
    '오늘 받은 말씀을 마음에 품고 한 주를 살아갈 수 있도록 목사님이 기도해 주세요.': 'The pastor prays that we keep today’s Word in our hearts all week.',
    '광고 · 새가족 환영': 'Announcements · Welcome',
    '이번 주 소식을 나누고, 처음 온 친구와 가족을 큰 박수로 환영해요. 쑥스러워도 괜찮아요. 모두가 당신을 기다렸어요!': 'We share news and welcome new friends and families with a big round of applause. Don’t be shy — we were waiting for you!',
    '축도': 'Benediction', '목사님의 축복 기도로 예배를 마쳐요. 하나님의 복을 가득 안고 새로운 한 주를 시작해요.': 'The pastor’s blessing closes the service. We start a new week full of God’s blessing.',
    '찬양팀 나눔과 기도': 'Worship Team Sharing & Prayer', '예배가 끝나면 찬양팀이 함께 모여 오늘의 예배를 돌아보고, 서로를 위해 기도하며 마무리해요.': 'After the service, the worship team looks back on the day and prays for one another.',
    '예배 전 1:30 – 2:00': 'Before worship 1:30 – 2:00', '찬양팀 리허설': 'Worship team rehearsal', '연합 기도': 'Prayer together', '설교 요약 나눔': 'Sermon preview', '예배 전 영상': 'Pre-service video',
    '함께 섬기는 사람들': 'Who We Are', '문새럴 목사님': 'Pastor Moon Shairal',
    '매주 생명의 말씀을 전하고 축복해 주시는 영어예배부 담당 목사님이에요. 궁금한 점이나 기도 제목이 있다면 언제든 이야기해 주세요.': 'Our English Ministry pastor shares the Word of life and blesses us every week. Feel free to talk to him about any question or prayer request.',
    '찬양팀 리더 슈퍼스타 윤희쌤': 'Worship Leader · Superstar Lucy',
    '"YEM 아이들을 한 명 한 명 모두 리더라고 불러요." 아이들이 영어 찬양을 마음에 새기고 담대히 선포하도록 곁에서 함께 노래하고 기도해요.': '“I call every YEM child a leader.” She sings and prays alongside the children so they can keep English praise in their hearts and proclaim it boldly.',
    '1 · 3주': 'Weeks 1 & 3', '2 · 4주': 'Weeks 2 & 4', '5주': 'Week 5', '함께 준비': 'Preparing together',
    '살아 있는 예배자로 서는 팀이에요. 기쁨이 넘치는 찬양으로 예배의 문을 열어요.': 'A team of living worshippers who open the service with joyful praise.',
    '담대한 믿음의 사람들로 서는 팀이에요. 믿음의 고백을 노래로 선포해요.': 'A team of bold believers who proclaim their faith in song.',
    '그리스도 안에서 하나(United) 된 팀이에요. 두 팀이 모두 함께 무대에 서서 연합 찬양을 올려드려요.': 'One (United) in Christ — both teams stand together and lead worship as one.',
    '찬양을 마음과 입술로 깊이 묵상하며 거룩한 씨앗을 심는 친구들이에요. 하나님의 때에 꽃을 피워 무대에 함께 서요.': 'Children who meditate on the songs and plant holy seeds — in God’s time they bloom and join the stage.',
    '처음 오셨나요?': 'First time here?', '영어를 정말 못하는데 괜찮을까요?': 'My English is not good. Is that okay?',
    'Absolutely NOT a problem! 예배는 언어 시험이 아니에요. 모든 단어를 알아듣지 못해도 찬양의 은혜와 예배의 감격은 충분히 누릴 수 있어요. 흐름을 따라가다 보면 금세 익숙해지고, 곁에 있는 다정한 친구와 선생님들이 언제든 도와줄 거예요. 미소와 열린 마음만 가져오세요!':
      'Absolutely NOT a problem! Worship is not a language test. Even if you don’t catch every word, you can enjoy the grace of praise. You will get used to it quickly, and kind friends and teachers are always there to help. Just bring a smile and an open heart!',
    '옷은 어떻게 입고 가요?': 'What should I wear?', 'Come as you are. 가장 편안한 옷차림으로 오세요. 후드티, 청바지, 운동화 모두 환영해요.': 'Come as you are! Hoodies, jeans and sneakers are all welcome.',
    '성경책을 가져가야 하나요?': 'Do I need to bring a Bible?', "We've got you covered! 핵심 말씀이 스크린에 나와요. 가벼운 마음으로 오세요.": "We've got you covered! The key verses are on the screen.",
    '헌금은 어떻게 하나요?': 'How do I give an offering?', '영어예배 시간에는 따로 헌금 순서가 없어요. 준비한 헌금은 3층 본당 헌금함에 넣어 주세요.': 'There is no offering time in the English service. Please use the offering box in the main sanctuary (3F).',
    '나눔 자료': 'Free Printables', 'YEM에서 실제로 쓴 자료를 누구나 인쇄해서 쓸 수 있어요.': 'Materials we really use at YEM — free to print.',
    '함께한 순간': 'Moments', '아이들을 지키기 위해 사진 속 얼굴은 모두 모자이크했어요.': 'To protect our children, faces in the photos are blurred.',
    '추수감사절 예배 · 감사의 열매를 함께 나눈 날': 'Thanksgiving service', '숲속에서 다 함께 · 웃음이 가득했던 날': 'Together in the woods', '예배를 마치고 · 모두가 주인공': 'After worship — everyone is a star',
    '손잡고 기도하는 시간': 'Holding hands in prayer', '함께 걸으며 사랑을 나눈 날': 'Walking together in love', '선생님과 친구들, 한 가족': 'Teachers and friends — one family',
    '안녕!': '안녕! (Hi!)', '너의 무대는': 'Your stage is', '세계': 'the world', '야!': '!', '너의 무대는 세계야': 'Your stage is the world',
    '주님이 함께하시니, 우리는 할 수 있어요 · 빌립보서 4:13': 'With the Lord, we can do it! · Philippians 4:13', '🎤 오늘의 찬양 부르기': '🎤 Sing today’s song', '📖 스토리북 읽기': '📖 Read the story books',
    // 스토리북 책장 · 책
    '스토리북 소개 보기': 'About the story books', '지금 읽을 수 있어요 · 5권': '5 books ready to read', '스토리북 책장': 'Story Books', '← 스토리북 책장': '← Story Books',
    'E-북으로 읽어요!': 'Read the e-book!', '오른쪽': 'Press', '를 누르거나 책장을 넘기면': 'on the right or turn the page', '한 장씩 넘기며 읽을 수 있어요': 'to read page by page',
    '🎭 원어민이 읽어 줘요 · 영어 · 中文': '🎭 Read aloud by native voices · English · 中文', '책 펼치기 →': 'Open the book →', '책 펼치기': 'Open the book',
    '이야기 듣기': 'Listen to the story', '🔊 영어': '🔊 English', '여·남': 'F · M', '🐢 천천히': '🐢 Slow', '▶ 자동 넘기기': '▶ Auto-turn', '⏸ 자동 넘기기 멈춤': '⏸ Stop auto-turn',
    '🎧 처음부터 끝까지 듣기': '🎧 Play the whole book', '🔔 넘기는 소리 켜짐': '🔔 Page sound on', '🔕 넘기는 소리 꺼짐': '🔕 Page sound off', '이 쪽에 나오는 친구': 'People on this page',
    '⬇ 전체 음성 MP3 받기': '⬇ Full audio MP3', '🖨️ 인쇄용 PDF 받기': '🖨️ Printable PDF', '작업 중 · 완성 전': 'Coming soon',
    'MP3: 쪽마다 책장 넘기는 소리 → 영어 이야기 낭독(해설 + 등장인물 목소리) → 中文(女·男) · 외울 말씀까지 · PDF: A4 가로 양면 인쇄 → 반으로 접어 가운데를 스테이플러로 묶어요':
      'MP3: page-turn sound → English story (narrator + character voices) → 中文 · memory verse. PDF: print A4 landscape double-sided, fold in half and staple.',
    '📄 20쪽 · A5': '📄 20 pages · A5', '🌏 English · 中文 · 한국어': '🌏 English · 中文 · Korean', '함께 나눠요': 'Let’s talk',
    '이 책의 이야기 12장면을 영어 · 中文 · 한국어로, 암송 말씀과 기도까지 한 장에 담았어요. 누르면 크게 볼 수 있어요.': 'All 12 scenes in English · 中文 · Korean, plus the memory verse and prayer, on one page. Tap to enlarge.',
    '📝 이 책의 단어 16개': '📝 16 words in this book', '(누르면 영어 → 中文 순서로 들려줘요)': '(tap to hear English → 中文)', '책장': 'Bookshelf', '이전 쪽': 'Previous page', '다음 쪽': 'Next page',
    // 찬양
    '해외 CCM': 'Praise Songs', '한 곡씩 듣기': 'Song by Song', '“새 노래로 여호와께 노래하라”': '', '· 곡을 누르면 바로 들어요': '· tap a song to listen',
    '🎧 PLAY ALL · 연속 듣기': '🎧 PLAY ALL', '찬양을': 'Keep the', '이어서 들어요': 'songs playing',
    '한 번 틀어 두면 다음 곡으로 저절로 넘어가요. 아래 막대에 지금 나오는 곡의 그림과 제목이 보여요.': 'Press play once and the next song starts by itself. The bar at the bottom shows the song that is playing.',
    '#1부터 주기도문까지': '#1 through the Lord’s Prayer', '섞어 듣기': 'Shuffle', '순서를 바꿔 새롭게': 'In a new order', '찬양 전체 연속 듣기': 'Play all songs',
    '🎧 찬양 전체 연속 듣기': '🎧 All songs', '🔀 찬양 섞어 듣기': '🔀 Shuffle', '주기도문': 'The Lord’s Prayer', '언덕 위 무대에서 성경 인물들과 천사들이 함께 찬양하는 그림': 'Bible people and angels praising on a hill',
    '🎵 곡 들어보기': '🎵 Listen', '① 곡 듣기': '① Listen', '② 가사 읽기': '② Lyrics', '③ 핵심 단어': '③ Key words', '④ 암송 · 묵상': '④ Memorize', '🎤 찬양 가사': '🎤 Lyrics',
    '가사를 묵상하며 찬양을 불러보아요.': 'Think about the words as you sing.', '듣기': 'Listen', '속도': 'Speed', '⏪ 5초': '⏪ 5s', '5초 ⏩': '5s ⏩', '구간': 'Loop', 'A 찍기': 'Set A', 'B 찍기': 'Set B',
    'A→B 재생': 'Play A→B', '반복': 'Repeat', '구간 저장': 'Save loop', '저장된 구간이 없어요. A와 B를 찍고 이름을 붙여 저장하면 여기서 바로 반복 재생할 수 있어요.': 'No saved loops yet. Set A and B, give it a name and save it to repeat it here.',
    '🎤 찬양연습시작!': '🎤 Start practice!', '다음 곡 →': 'Next song →', '← 이전 곡': '← Previous song', '📄 가사지 보기': '📄 Lyrics sheet', '이번 묶음 곡 고르기': 'Choose a song', '연습 단계': 'Practice steps',
    '이 줄 듣기': 'Listen to this line', '구간 이름 (예: 후렴)': 'Loop name (e.g. Chorus)', '← 곡 듣기로': '← Back to the song',
    'YEM 영어예배부 · Incheon Younglak Church English Ministry · yem-brown.vercel.app': 'YEM · Incheon Younglak Church English Ministry · yem-brown.vercel.app',
    '🖨️ 인쇄하기 · A4 한 장': '🖨️ Print · one A4 page', '배너와 가사가 A4 한 장에 딱 맞게 들어가요': 'The banner and lyrics fit on one A4 page',
    // 성경 인물
    '포토카드': 'Photo Cards', '“구름 같이 둘러싼 허다한 증인들”': '', '믿음의 사람': 'people of faith', '을 포토카드로 만나요': 'on photo cards',
    '아담부터 누가까지, 하나님과 함께 걸어간 사람들이에요. 카드 한 장마다': 'From Adam to Luke — people who walked with God. Each card has',
    '영어 이름 · 발음기호 · 우리말 이름 · 그림 속 성경 이야기': 'the English name · pronunciation · Korean name · the Bible story in the picture', '가 들어 있어요.': '.',
    '영어 이름 누르기': 'Tap the name', '두 번 읽어 줘요 · 처음엔 빠르게, 다음엔 천천히': 'Hear it twice — normal, then slow', '그림 누르기': 'Tap the picture', '어떤 성경 이야기인지 영어로 알려 줘요': 'Hear the Bible story in English',
    '소개 누르기': 'Tap “Story”', '그 인물의 이야기를 자세히 읽어요': 'Read about the person', '인쇄용 카드': 'Printable cards', '집에서 진짜 카드로 만들어요': 'Make real cards at home', '🖨️ 인쇄용 카드 만들기': '🖨️ Make printable cards',
    '📖 소개': '📖 Story', '설명 듣기': 'Listen', '단어에 색이 지나가요 · 눈으로 따라 읽어요': 'Words light up as they are read — follow along', '닫기': 'Close', '이전 인물': 'Previous', '다음 인물': 'Next',
    '⏸ 멈추기': '⏸ Pause', '▶ 이어 듣기': '▶ Resume', '🔁 다시 듣기': '🔁 Again',
    // 책장 안내 · 첫 화면 나눔 자료
    '예수님 탄생 이야기 5권': 'The Story of Jesus’ Birth · 5 books', '영어 · 中文 · 한국어가 함께 들어 있는 그림책이에요. 해설자와': 'Picture books in English · 中文 · Korean. A narrator and',
    '로 실감 나게 읽어 주고, 중국어도 들을 수 있어요.': 'bring each story to life, and you can listen in Chinese too.', '책장은': 'Turn the pages with the',
    '오른쪽 · 왼쪽 동그라미': 'right · left circle buttons', '를 눌러 넘기고,': ', or switch on', '자동 넘기기': 'Auto-turn', '를 켜면 저절로 넘어가요.': 'to turn them by itself.',
    'YEM 크리스마스': 'YEM Christmas', '캐릭터 포토 프레임 · 캐릭터 룸 성탄 카드 · 크리스마스 스토리북': 'Character photo frame · Christmas card · Christmas story books', '사진 찍고 카드 만들기 →': 'Take a photo & make a card →',
    '추수감사절 키트': 'Thanksgiving Kit', '과일 테이블 장식 · 가정 식탁 매트 · 7일 감사기도 챌린지 · 예수님 스티커': 'Fruit table decor · family table mat · 7-day thanks prayer challenge · Jesus stickers',
    '키트 보러 가기 →': 'See the kit →', '성경 인물 포토카드': 'People of Faith Photo Cards', '믿음의 사람 카드': 'People of Faith Cards', '믿음의 사람 110명을 진짜 카드로 · A6 양면 인쇄': '110 people of faith as real cards · A6 double-sided', '카드 만들기 →': 'Make the cards →',
  };
  // 스토리북 데이터에서: 한국어 제목 · 함께 나눌 질문 → 영어
  const fromBooks = () => {
    const D = window.STORYBOOKS;
    if (!D || fromBooks.done) return;
    fromBooks.done = true;
    Object.values(D.books).forEach((b) => { if (b.talk) EXACT[b.talk.ko] = b.talk.en; });
  };
  Object.keys(EXACT).forEach((k) => { const n = k.replace(/\s+/g, ' '); if (n !== k) { EXACT[n] = EXACT[k]; } });
  // 부분 바꾸기 (숫자가 들어간 글)
  const PART = [
    [/^Book (\d+)부터/, 'From Book $1'], [/설거지할 때, 차 안에서, 잠자리에서\. (From Book \d+) 5권까지 이어서, 끝나면 처음부터 다시 들려줘요\./, 'While cooking, in the car, at bedtime. $1 through Book 5, then it starts again.'],
    [/^설거지할 때, 차 안에서, 잠자리에서\. Book (\d+)부터 5권까지 이어서, 끝나면 처음부터 다시 들려줘요\.$/, 'While cooking, in the car, at bedtime. From Book $1 through Book 5, then it starts again.'],
    [/^📻 스토리북 (.+) 전체 듣기$/, '📻 Story Books · $1'],
    [/^🎧 (\d+)월 찬양 배우러 가기 \((.+)\) →$/, (m, a, b) => `🎧 Learn the ${MONTHS[+a]} songs (${b}) →`], [/^🎧 (\d+)월 찬양 연속 듣기$/, (m, a) => `🎧 ${MONTHS[+a]} songs`],
    [/^(\d+)월 찬양$/, (m, a) => `${MONTHS[+a]} songs`], [/^이번 달 (\d+)곡 \((.+)\)$/, 'This month · $1 songs ($2)'], [/^전체 (\d+)곡$/, 'All $1 songs'], [/^(\d+)곡$/, '$1 songs'],
    [/(#\d+-\d+) 찬양곡/g, 'Songs $1'], [/^.+ · 아래 ▶ 버튼을 누르면 찬양이 시작돼요$/, 'Press ▶ below to start the song'],
    [/^🗓️ (\d+\/\d+) · 대림절 (\d)주 · (.+)$/, (m, d, w, t) => `🗓️ ${d} · Advent week ${w} · ${ADVENT[t] || t}`], [/^🗓️ (\d+\/\d+) · 성탄 후 주일$/, '🗓️ $1 · Sunday after Christmas'],
    [/^한 장으로 읽는 Book (\d+)$/, 'Book $1 on one page'], [/^Book (\d+) 읽으러 가기$/, 'Read Book $1'], [/^Book (\d+) 전체 이야기 한 장( 크게 보기)?$/, 'Book $1 — whole story on one page'],
    [/^🖼️ (\d+)장면$/, '🖼️ $1 scenes'], [/^🔤 단어 (\d+)$/, '🔤 $1 words'], [/^(\d+)쪽$/, 'Page $1'], [/(\d+)쪽부터/g, 'from p.$1'], [/ · (\d+)쪽/g, ' · p.$1'], [/Book (\d+) 제목/g, 'Book $1 · Title'], [/외울 말씀/g, 'Memory verse'],
    [/^구약 · No\.(\d+)$/, 'Old Testament · No.$1'], [/^신약 · No\.(\d+)$/, 'New Testament · No.$1'],
    [/^📜 구약 (\d+)명 · ✝️ 신약 (\d+)명 · 모두$/, '📜 Old Testament $1 · ✝️ New Testament $2 · total'], [/^전체 (\d+)명$/, 'All $1'], [/^📜 구약 (\d+)명$/, '📜 Old Testament $1'], [/^✝️ 신약 (\d+)명$/, '✝️ New Testament $1'], [/^(\d+)명$/, '$1'],
    [/^(.+) 인물 카드 보기$/, (m, a) => `View ${koName(a)}`], [/^(.+) 그림 소개 보기$/, (m, a) => `${koName(a)} — picture story`], [/^(.+) 이름 두 번 듣기$/, 'Hear $1 twice'],
    [/^Book (\d+) 표지$/, 'Book $1 cover'], [/^Book (\d+) (.+) · (.+) 표지$/, 'Book $1 $2 cover'],
    [/^· [가-힣 ]+$/, ''],
    [/^새 포토카드(?: (\d+)장)?!$/, (m, k) => (k ? `${k} new photo cards!` : 'New photo card!')], [/^\+(\d+) XP · (\d+)\/(\d+) 모음$/, '+$1 XP · $2/$3 collected'],
    [/^📒 카드첩 보기$/, '📒 My card album'], [/^📝 이 책의 단어 (\d+)개$/, '📝 $1 words in this book'], [/^(구약|신약) · No\.(\d+) · (.+)$/, (m, a, k, nm) => `${a === '구약' ? 'OT' : 'NT'} · No.${k} · ${koName(nm)}`], [/^(구약|신약) · No\.(\d+)$/, (m, a, k) => `${a === '구약' ? 'OT' : 'NT'} · No.${k}`],
  ];
  const koToEn = new Map();
  const koName = (k) => {
    if (!koToEn.size && window.PEOPLE) window.PEOPLE.forEach((p) => { koToEn.set(p.koMain, p.en); if (p.ko) koToEn.set(p.ko, p.en); });
    return koToEn.get(k) || k;
  };
  const HANGUL = /[가-힣]/;
  function tr(text) {
    const t = text.trim().replace(/\s+/g, ' ');
    if (!t || !HANGUL.test(t)) return null;
    fromBooks();
    if (Object.prototype.hasOwnProperty.call(EXACT, t)) return EXACT[t];
    const book = Object.keys(BOOKS).find((k) => t === k || t.startsWith(k + ' ·'));
    if (book) return refEn(t.replace(book, BOOKS[book]));
    if (koName(t) !== t) return koName(t);
    if (t.includes(', ') && t.split(', ').every((x) => koName(x) !== x)) return t.split(', ').map(koName).join(', ');
    let out = t;
    for (const [re, to] of PART) out = out.replace(re, to);
    if (/^(📜|📖) /.test(out)) out = refEn(out);
    out = refEn(out);
    return out !== t ? out : null;
  }
  function fixNode(n) {
    const v = tr(n.nodeValue);
    if (v === null) return;
    const lead = n.nodeValue.match(/^\s*/)[0];
    const tail = n.nodeValue.match(/\s*$/)[0];
    n.nodeValue = lead + v + tail;
  }
  const ATTRS = ['aria-label', 'title', 'alt', 'placeholder'];
  function walk(root) {
    if (root.nodeType === 3) return fixNode(root);
    if (root.nodeType !== 1 || root.closest && root.closest('script,style,.yh-guide,.bpm-kotext,.sb-ko,.sheet-sec .sk,.kko')) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) { if (!n.parentElement.closest('script,style,.yh-guide,.bpm-kotext,.sb-ko,.kko')) fixNode(n); }
    [root, ...root.querySelectorAll('[aria-label],[title],[alt],[placeholder]')].forEach((el) => ATTRS.forEach((a) => {
      const v = el.getAttribute && el.getAttribute(a);
      if (v && HANGUL.test(v)) { const x = tr(v); if (x !== null) el.setAttribute(a, x); }
    }));
  }
  const mo = new MutationObserver((list) => {
    list.forEach((m) => {
      if (m.type === 'characterData') fixNode(m.target);
      else m.addedNodes.forEach(walk);
    });
  });
  const start = () => { walk(document.body); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
