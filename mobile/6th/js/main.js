/* 공통 기능: 화면 그리기, 메뉴, 밝기, 예약 */
(function () {
  "use strict";
  const S = window.SITE;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- 다른 파일에서도 쓰는 도구 ---------- */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    }
  };

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  async function copy(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
      toast(okMsg || "복사했습니다.");
    } catch (e) {
      toast("복사하지 못했습니다. 직접 선택해서 복사해 주세요: " + text);
    }
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "text") node.textContent = v;
        else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
        else node.setAttribute(k, v === true ? "" : v);
      }
    }
    (children || []).forEach((c) => {
      if (c == null) return;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  const won = (n) => n.toLocaleString("ko-KR") + "원";
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  /* 사진 주소: Unsplash id 면 크기에 맞춰 받고, 경로("img/...")면 그대로 쓴다 */
  const photo = (id, w) => /[\/.]/.test(id) ? id : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

  window.APP = { store, toast, copy, el, won, ymd, photo, $, $$ };

  /* ---------- 큰 사진 ---------- */
  const P = S.photos || {};
  const setBg = (sel, id) => { const n = $(sel); if (n && id) n.style.backgroundImage = `url("${photo(id, 2000)}")`; };
  setBg("#heroPhoto", P.hero);
  setBg("#bandPhoto", P.band);
  /* 하위 페이지 머리 사진: <section class="page-hero" data-photo="키"> → config 의 photos.pages[키] */
  $$(".page-hero[data-photo]").forEach((n) => {
    const id = (P.pages || {})[n.dataset.photo];
    const bg = n.querySelector(".page-hero__photo");
    if (id && bg) bg.style.backgroundImage = `url("${photo(id, 2000)}")`;
  });
  const gallery = $("#gallery");
  if (gallery) (P.gallery || []).forEach(([id, alt]) => gallery.append(el("figure", { class: "gallery__item" }, [
    el("img", { src: photo(id, 700), alt, loading: "lazy", decoding: "async" }),
    el("figcaption", { text: alt })
  ])));

  /* ---------- 설정 값 채우기 ---------- */
  $$("[data-site]").forEach((node) => {
    const v = S[node.dataset.site];
    if (typeof v === "string") node.textContent = v;
  });
  $("#year").textContent = new Date().getFullYear();

  /* ---------- 밝기 (라이트/다크) ---------- */
  const root = document.documentElement;
  const savedTheme = store.get("platept.theme", null);
  if (savedTheme) root.dataset.theme = savedTheme;
  $("#themeBtn").addEventListener("click", () => {
    const isDark = root.dataset.theme !== "light";
    root.dataset.theme = isDark ? "light" : "dark";
    store.set("platept.theme", root.dataset.theme);
  });

  /* ---------- 모바일 메뉴 ---------- */
  const nav = $("#nav");
  const menuBtn = $("#menuBtn");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* 지금 페이지를 메뉴에 표시 */
  const here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  $$("a", nav).forEach((a) => {
    if (a.getAttribute("href").toLowerCase() === here) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  /* ---------- 프로그램 ---------- */
  if ($("#programList")) {
    const programList = $("#programList");
    S.programs.forEach((p) => {
      programList.append(el("article", { class: "program plate-" + p.plate, id: p.id }, [
        el("div", { class: "program__media" }, [
          p.img ? el("img", { src: photo(p.img, 900), alt: p.name + " 운동 장면", loading: "lazy", decoding: "async" }) : null,
          el("div", { class: "program__plate", "aria-hidden": "true" }, [el("span", { class: "mono", text: p.kg })])
        ]),
        el("div", { class: "program__body" }, [
          el("h3", { text: p.name }),
          el("p", { text: p.desc }),
          el("ul", { class: "tags" }, [el("li", { text: p.weeks }), ...p.tags.map((t) => el("li", { text: t }))]),
          el("a", { class: "link-btn", href: "booking.html?program=" + p.id, text: "이 프로그램으로 상담 예약 →" })
        ])
      ]));
    });
  }

  /* ---------- 트레이너 ---------- */
  if ($("#trainerList")) {
    const trainerList = $("#trainerList");
    S.trainers.forEach((t) => {
      trainerList.append(el("article", { class: "trainer", id: "trainer-" + t.id }, [
        t.img
          ? el("div", { class: "trainer__photo plate-" + t.color }, [el("img", { src: photo(t.img, 700), alt: t.name + " 트레이너", loading: "lazy", decoding: "async" })])
          : el("div", { class: "trainer__avatar plate-" + t.color, "aria-hidden": "true", text: t.name.slice(1) }),
        el("div", { class: "trainer__body" }, [
          el("p", { class: "trainer__role", text: t.role + " · " + t.career }),
          el("h3", { text: t.name }),
          el("p", { class: "trainer__focus", text: t.focus }),
          el("ul", { class: "trainer__certs" }, t.certs.map((c) => el("li", { text: c }))),
          el("p", { class: "trainer__days" }, [
            "수업 요일 ",
            ...[1, 2, 3, 4, 5, 6, 0].map((d) => el("span", { class: "day" + (t.days.includes(d) ? " is-on" : ""), text: dayNames[d] }))
          ]),
          el("a", { class: "btn btn--ghost btn--sm", href: "booking.html?trainer=" + t.id, text: "이 트레이너로 예약" })
        ])
      ]));
    });
  }

  /* ---------- 기구 ---------- */
  if ($("#equipList")) {
    const zoneTabs = $("#zoneTabs");
    const equipList = $("#equipList");
    const zones = Object.keys(S.equipment);
    function showZone(name) {
      $$("button", zoneTabs).forEach((b) => {
        const on = b.dataset.zone === name;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-selected", String(on));
      });
      equipList.replaceChildren(...S.equipment[name].map(([item, qty, note]) =>
        el("div", { class: "equip__row" }, [
          el("span", { class: "equip__name", text: item }),
          el("span", { class: "equip__qty mono", text: qty }),
          el("span", { class: "equip__note muted", text: note })
        ])
      ));
    }
    zones.forEach((z) => zoneTabs.append(el("button", { type: "button", role: "tab", class: "chip", "data-zone": z, text: z, onclick: () => showZone(z) })));
    /* 메뉴에서 equipment.html#zone-2 처럼 들어오면 그 구역을 연다 */
    const zm = /^#zone-(\d+)$/.exec(location.hash);
    showZone(zones[zm && zones[+zm[1]] ? +zm[1] : 0]);
    window.addEventListener("hashchange", () => { const m = /^#zone-(\d+)$/.exec(location.hash); if (m && zones[+m[1]]) showZone(zones[+m[1]]); });
  }

  /* ---------- 가격 ---------- */
  if ($("#priceTable")) {
    const priceBody = $("#priceTable tbody");
    const basePer = S.prices[0].per;
    S.prices.forEach((p) => {
      const save = basePer > p.per ? Math.round((1 - p.per / basePer) * 100) : 0;
      priceBody.append(el("tr", { class: p.best ? "is-best" : "" }, [
        el("th", { scope: "row" }, [el("span", { class: "mono big", text: p.count + "회" }), p.best ? el("span", { class: "badge badge--accent", text: "가장 많이 선택" }) : null]),
        el("td", { text: p.period }),
        el("td", { class: "mono" }, [won(p.per), save ? el("small", { class: "save", text: " -" + save + "%" }) : null]),
        el("td", { class: "mono strong", text: won(p.per * p.count) }),
        el("td", {}, [el("a", { class: "btn btn--ghost btn--sm", href: "booking.html", text: "상담" })])
      ]));
    });
  }

  /* ---------- 연락 · SNS ---------- */
  if ($("#snsList")) {
    const icons = {
      instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/></svg>',
      kakao: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4C6.9 4 3 7.2 3 11.1c0 2.5 1.7 4.7 4.2 6l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.3 0 .7.1 1 .1 5.1 0 9-3.2 9-7.2S17.1 4 12 4Z"/></svg>',
      phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2Z"/></svg>',
      blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 3h16a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6l-2 3-2-3H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 4v7h2.6c1.6 0 2.6-.8 2.6-2 0-.8-.4-1.3-1-1.6.5-.3.8-.8.8-1.4 0-1.2-.9-2-2.4-2H7Zm1.8 1.4h.7c.5 0 .8.2.8.6s-.3.7-.8.7h-.7V8.4Zm0 2.6h.9c.6 0 .9.3.9.7 0 .5-.3.8-.9.8h-.9V11Z"/></svg>',
      youtube: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></svg>'
    };
    const snsList = $("#snsList");
    S.sns.filter((s) => s.url).forEach((s) => {
      const isTel = s.url.startsWith("tel:");
      const card = el("div", { class: "sns__card sns--" + s.key }, [
        el("span", { class: "sns__icon" }),
        el("div", { class: "sns__text" }, [el("strong", { text: s.label }), el("span", { class: "muted small" + (isTel ? " mono" : ""), text: s.handle })]),
        el("div", { class: "sns__actions" }, [
          el("a", { class: "btn btn--ghost btn--sm", href: s.url, target: isTel ? null : "_blank", rel: isTel ? null : "noopener", text: isTel ? "전화 걸기" : "열기" }),
          isTel ? el("button", { class: "btn btn--ghost btn--sm", type: "button", text: "번호 복사", onclick: () => copy(s.handle, "전화번호를 복사했습니다.") }) : null
        ])
      ]);
      card.querySelector(".sns__icon").innerHTML = icons[s.key] || "";
      snsList.append(card);
    });

    const hoursList = $("#hoursList");
    if (hoursList) S.hours.forEach(([k, v]) => hoursList.append(el("div", {}, [el("dt", { text: k }), el("dd", { class: "mono", text: v })])));
  }

  /* ---------- 자주 묻는 질문 ---------- */
  if ($("#faqList")) {
    const faqList = $("#faqList");
    S.faq.forEach(([q, a]) => faqList.append(el("details", { class: "faq__item" }, [el("summary", { text: q }), el("p", { text: a })])));
  }

  /* ---------- 예약 ---------- */
  if ($("#bookingForm")) {
    const BK_KEY = "platept.bookings";
    const form = $("#bookingForm");
    const fProgram = $("#bkProgram");
    const fTrainer = $("#bkTrainer");
    const fDate = $("#bkDate");
    const slotList = $("#slotList");
    const slotHint = $("#slotHint");
    const errBox = $("#bkError");
    let chosenSlot = null;

    S.programs.forEach((p) => fProgram.append(el("option", { value: p.id, text: p.name })));
    S.trainers.forEach((t) => fTrainer.append(el("option", { value: t.id, text: `${t.name} (${t.focus})` })));

    const qs = new URLSearchParams(location.search);
    if (S.programs.some((p) => p.id === qs.get("program"))) fProgram.value = qs.get("program");
    if (S.trainers.some((t) => t.id === qs.get("trainer"))) fTrainer.value = qs.get("trainer");

    const today = new Date();
    const maxDay = new Date(); maxDay.setDate(maxDay.getDate() + 30);
    fDate.min = ymd(today);
    fDate.max = ymd(maxDay);
    fDate.value = ymd(today);

    function bookings() { return store.get(BK_KEY, []); }

    function renderSlots() {
      chosenSlot = null;
      slotList.replaceChildren();
      const trainer = S.trainers.find((t) => t.id === fTrainer.value);
      if (!fDate.value) { slotHint.textContent = "날짜를 먼저 고르세요"; return; }
      const day = new Date(fDate.value + "T00:00:00");
      if (!trainer.days.includes(day.getDay())) {
        slotHint.textContent = `${trainer.name} 트레이너는 ${dayNames[day.getDay()]}요일 수업이 없습니다.`;
        return;
      }
      const taken = new Set(bookings().filter((b) => b.trainer === trainer.id && b.date === fDate.value).map((b) => b.time));
      const now = new Date();
      let open = 0;
      S.slots.forEach((time) => {
        const at = new Date(`${fDate.value}T${time}:00`);
        const past = at <= now;
        const busy = taken.has(time);
        const disabled = past || busy;
        if (!disabled) open++;
        slotList.append(el("button", {
          type: "button", class: "slot" + (busy ? " is-busy" : ""), "data-time": time, disabled,
          "aria-pressed": "false", title: busy ? "이미 예약됨" : past ? "지난 시간" : null, text: time
        }));
      });
      slotHint.textContent = open ? `${open}개 비어 있음` : "남은 시간이 없습니다. 다른 날을 골라 주세요.";
    }

    slotList.addEventListener("click", (e) => {
      const b = e.target.closest(".slot");
      if (!b || b.disabled) return;
      $$(".slot", slotList).forEach((s) => { s.classList.remove("is-on"); s.setAttribute("aria-pressed", "false"); });
      b.classList.add("is-on");
      b.setAttribute("aria-pressed", "true");
      chosenSlot = b.dataset.time;
    });
    fTrainer.addEventListener("change", renderSlots);
    fDate.addEventListener("change", renderSlots);

    /* 연락처 자동 하이픈 */
    const fPhone = $("#bkPhone");
    fPhone.addEventListener("input", () => {
      const d = fPhone.value.replace(/\D/g, "").slice(0, 11);
      fPhone.value = d.length < 4 ? d : d.length < 8 ? `${d.slice(0, 3)}-${d.slice(3)}` : `${d.slice(0, 3)}-${d.slice(3, d.length - 4)}-${d.slice(-4)}`;
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      errBox.textContent = "";
      const name = $("#bkName").value.trim();
      const phone = fPhone.value.trim();
      let msg = "";
      if (!name) msg = "이름을 적어 주세요.";
      else if (!/^01[016789]-\d{3,4}-\d{4}$/.test(phone)) msg = "연락처를 010-1234-5678 형식으로 적어 주세요.";
      else if (!fDate.value) msg = "날짜를 골라 주세요.";
      else if (!chosenSlot) msg = "시간을 골라 주세요.";
      else if (!$("#bkAgree").checked) msg = "연락처 사용 동의에 체크해 주세요.";
      if (msg) { errBox.textContent = msg; return; }

      const list = bookings();
      if (list.some((b) => b.trainer === fTrainer.value && b.date === fDate.value && b.time === chosenSlot)) {
        errBox.textContent = "방금 다른 예약이 잡힌 시간입니다. 다른 시간을 골라 주세요.";
        renderSlots();
        return;
      }
      list.push({
        id: Date.now().toString(36), name, phone,
        program: fProgram.value, trainer: fTrainer.value,
        date: fDate.value, time: chosenSlot, memo: $("#bkMemo").value.trim(),
        created: new Date().toISOString()
      });
      store.set(BK_KEY, list);
      const t = S.trainers.find((x) => x.id === fTrainer.value);
      toast(`${fDate.value} ${chosenSlot} ${t.name} 트레이너로 예약 신청했습니다.`);
      $("#bkMemo").value = "";
      $("#bkAgree").checked = false;
      renderSlots();
      renderMine();
    });

    function renderMine() {
      const box = $("#myBookings");
      const now = ymd(new Date());
      const list = bookings().filter((b) => b.date >= now).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      if (!list.length) {
        box.replaceChildren(el("li", { class: "empty" }, [el("span", { text: "아직 예약이 없습니다." }), el("span", { class: "small muted", text: "왼쪽에서 날짜와 시간을 고르면 여기에 나옵니다." })]));
        return;
      }
      box.replaceChildren(...list.map((b) => {
        const t = S.trainers.find((x) => x.id === b.trainer);
        const p = S.programs.find((x) => x.id === b.program);
        const d = new Date(b.date + "T00:00:00");
        return el("li", { class: "booking-item plate-" + (p ? p.plate : "green") }, [
          el("div", { class: "booking-item__when" }, [el("span", { class: "mono strong", text: b.date.slice(5).replace("-", ".") + " (" + dayNames[d.getDay()] + ")" }), el("span", { class: "mono", text: b.time })]),
          el("div", { class: "booking-item__what" }, [el("span", { text: p ? p.name : "" }), el("span", { class: "small muted", text: (t ? t.name : "") + " 트레이너 · 확인 전화 대기" })]),
          el("button", { class: "link-btn danger", type: "button", "data-cancel": b.id, text: "취소" })
        ]);
      }));
    }
    $("#myBookings").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cancel]");
      if (!b) return;
      if (b.dataset.armed !== "1") {
        b.dataset.armed = "1";
        b.textContent = "정말 취소";
        setTimeout(() => { if (b.isConnected) { b.dataset.armed = ""; b.textContent = "취소"; } }, 3000);
        return;
      }
      store.set(BK_KEY, bookings().filter((x) => x.id !== b.dataset.cancel));
      toast("예약을 취소했습니다.");
      renderSlots();
      renderMine();
    });

    renderSlots();
    renderMine();
  }

})();
