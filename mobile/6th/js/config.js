/*
 * 사이트 설정
 * 센터 이름, 주소, 좌표, 연락처, SNS 주소, 프로그램, 트레이너, 가격은 모두 여기서 바꾼다.
 * 지금 값은 예시다. 실제 운영 전에 주소·좌표·전화번호·SNS 주소를 꼭 바꿀 것.
 * 좌표 찾기: 카카오맵이나 구글 지도에서 센터 위치를 오른쪽 클릭하면 위도·경도가 나온다.
 */
window.SITE = {
  name: "플레이트 PT 스튜디오",
  short: "PLATE PT",
  address: "서울 강남구 테헤란로 152 지하 1층 (예시 주소)",
  lat: 37.50039,
  lng: 127.03655,
  phone: "010-0000-0000",          // 예시 번호
  hoursShort: "평일 06–23시",
  hours: [
    ["평일", "06:00 – 23:00"],
    ["토요일", "09:00 – 18:00"],
    ["일요일·공휴일", "10:00 – 17:00"],
    ["PT 수업", "예약제 · 1회 50분"]
  ],
  transit: [
    ["지하철", "2호선 역삼역 1번 출구에서 도보 3분"],
    ["버스", "역삼역 정류장 146 · 341 · 360"],
    ["주차", "건물 지하 주차장 2시간 무료 (PT 회원)"]
  ],
  gymMonthly: "70,000원",
  gym3Month: "180,000원",

  /* SNS · 연락 경로. url 이 비어 있으면 그 칸은 안 보인다. */
  sns: [
    { key: "instagram", label: "인스타그램", handle: "@plate.pt.studio", url: "https://www.instagram.com/" },
    { key: "kakao", label: "카카오톡 채널", handle: "플레이트PT 상담", url: "https://pf.kakao.com/" },
    { key: "phone", label: "전화 상담", handle: "010-0000-0000", url: "tel:01000000000" },
    { key: "blog", label: "네이버 블로그", handle: "운동 일지 · 식단", url: "https://blog.naver.com/" },
    { key: "youtube", label: "유튜브", handle: "기구 사용법 영상", url: "https://www.youtube.com/" }
  ],

  /* 프로그램. plate 는 원판 색(red 25kg, blue 20kg, yellow 15kg, green 10kg) */
  programs: [
    { id: "strength", img: "img/program-strength.jpg", plate: "red", kg: 25, name: "근력 · 파워", desc: "스쿼트, 데드리프트, 벤치프레스 3대 운동을 기준으로 중량을 올립니다. 매 수업 1RM 추정치를 기록합니다.", weeks: "12주", tags: ["3대 운동", "중량 기록"] },
    { id: "body", img: "img/program-body.jpg", plate: "blue", kg: 20, name: "바디프로필", desc: "촬영일을 기준으로 거꾸로 계획합니다. 주 1회 체성분 측정과 식단 점검을 함께 합니다.", weeks: "16주", tags: ["체지방 관리", "식단 점검"] },
    { id: "diet", img: "img/program-diet.jpg", plate: "yellow", kg: 15, name: "다이어트", desc: "유산소와 근력 운동을 섞어 체지방을 줄입니다. 무리한 감량 대신 한 달 2–3kg을 목표로 합니다.", weeks: "8주", tags: ["체지방 감량", "생활 습관"] },
    { id: "rehab", img: "img/program-rehab.jpg", plate: "green", kg: 10, name: "체형 교정 · 입문", desc: "거북목, 골반 틀어짐, 어깨 통증처럼 앉아서 일하는 사람의 문제부터 봅니다. 기구가 처음인 분도 이 과정으로 시작합니다.", weeks: "8주", tags: ["자세 평가", "기구 입문"] }
  ],

  trainers: [
    { id: "kim", img: "img/trainer-kim.jpg", name: "김도윤", role: "수석 트레이너", focus: "근력 · 파워", career: "경력 9년", certs: ["생활스포츠지도사 2급(보디빌딩)", "NSCA-CPT"], days: [1, 2, 3, 4, 5], color: "red" },
    { id: "lee", img: "img/trainer-lee.jpg", name: "이서진", role: "트레이너", focus: "바디프로필 · 다이어트", career: "경력 6년", certs: ["생활스포츠지도사 2급(보디빌딩)", "스포츠영양코치"], days: [1, 3, 5, 6], color: "blue" },
    { id: "park", img: "img/trainer-park.jpg", name: "박하은", role: "트레이너", focus: "체형 교정 · 입문", career: "경력 5년", certs: ["건강운동관리사", "교정운동 전문가 과정"], days: [2, 4, 6, 0], color: "green" }
  ],

  /* PT 시간표: 수업 시작 시각 */
  slots: ["06:00", "07:00", "08:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "18:00", "19:00", "20:00", "21:00"],

  prices: [
    { count: 10, period: "2개월", per: 66000, best: false },
    { count: 20, period: "4개월", per: 60000, best: true },
    { count: 30, period: "6개월", per: 55000, best: false },
    { count: 50, period: "10개월", per: 50000, best: false }
  ],

  equipment: {
    "프리웨이트": [
      ["파워랙", "3대", "세이프티 바 · 체인 걸이 포함"],
      ["올림픽 바벨", "6개", "20kg 남성용 4, 15kg 여성용 2"],
      ["범퍼 원판", "1.2톤", "10 · 15 · 20 · 25kg 색 구분"],
      ["덤벨", "2–50kg", "2kg 단위"],
      ["플랫 · 인클라인 벤치", "8대", ""]
    ],
    "머신": [
      ["레그프레스 45°", "2대", "최대 400kg"],
      ["스미스 머신", "2대", ""],
      ["랫풀다운 · 시티드 로우", "2대", ""],
      ["케이블 크로스오버", "2대", "듀얼 풀리"],
      ["레그 익스텐션 · 컬", "각 2대", ""],
      ["힙 쓰러스트 머신", "1대", ""]
    ],
    "유산소": [
      ["트레드밀", "10대", "경사 15%까지"],
      ["천국의 계단", "3대", ""],
      ["실내 자전거", "6대", ""],
      ["로잉 머신", "2대", ""]
    ],
    "측정 · 회복": [
      ["체성분 분석기", "1대", "PT 회원 주 1회 측정"],
      ["폼롤러 · 마사지건", "구역 비치", ""],
      ["스트레칭 존", "20㎡", "매트 · 밴드 · 짐볼"]
    ]
  },

  faq: [
    ["운동을 한 번도 안 해 봤는데 괜찮나요?", "첫 수업은 자세 평가와 기구 사용법부터 시작합니다. 체형 교정 · 입문 프로그램으로 시작하면 4주 안에 혼자서 기본 기구를 쓸 수 있게 됩니다."],
    ["PT 횟수를 다 못 쓰면 어떻게 되나요?", "기간 안에 못 쓴 횟수는 한 번에 한해 1개월 연장해 드립니다. 그 뒤 남은 횟수는 위약금 없이 환불 기준표대로 계산합니다."],
    ["수업 시간을 바꿀 수 있나요?", "수업 24시간 전까지는 무료로 바꿀 수 있습니다. 그보다 늦게 취소하면 1회 진행으로 처리됩니다."],
    ["샤워실과 운동복이 있나요?", "샤워실, 개인 사물함, 운동복 · 수건을 모두 무료로 드립니다."],
    ["트레이너를 중간에 바꿀 수 있나요?", "네. 카운터나 카카오톡 채널로 말씀하시면 남은 횟수 그대로 다른 트레이너에게 넘어갑니다."]
  ],

  boardCategories: ["자유", "질문", "후기", "공지"],

  /* 사진: 전부 img 폴더에 있다 (원본은 Unsplash 무료 사진).
     바꾸려면 img 폴더에 같은 이름으로 덮어쓰거나, 새 파일을 넣고 여기 경로를 고친다. */
  photos: {
    hero: "img/main-hero.jpg",
    band: "img/band.jpg",
    /* 페이지별 머리 사진 */
    pages: {
      programs: "img/program-body.jpg",
      trainers: "img/page-trainers.jpg",
      equipment: "img/page-equipment.jpg",
      pricing: "img/page-pricing.jpg",
      booking: "img/page-booking.jpg",
      location: "img/page-location.jpg",
      board: "img/page-board.jpg"
    },
    gallery: [
      ["img/gallery-1.jpg", "풀업으로 등 운동"],
      ["img/gallery-2.jpg", "덤벨 컬"],
      ["img/gallery-3.jpg", "프리웨이트 운동"],
      ["img/gallery-4.jpg", "덤벨 운동"],
      ["img/gallery-5.jpg", "바벨 리프팅"],
      ["img/gallery-6.jpg", "여성 근력 운동"]
    ]
  }
};
