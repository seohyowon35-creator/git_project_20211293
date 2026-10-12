/*
 * 마우스를 올리면 바뀌는 버튼
 *
 * 1) 글자 바꾸기:  <a class="btn" data-hover="바뀔 글자">원래 글자</a>
 * 2) 버튼 안 사진:  <a class="btn" data-hover-photo="random">...</a> (마우스를 올리면 버튼 바탕이 운동 사진으로 바뀜)
 *    - "random" 이면 config.js 의 운동 사진 중 하나를 매번 골라 보여 준다
 *    - Unsplash 사진 id 나 "img/파일.jpg" 경로를 넣으면 그 사진만 보여 준다
 * 3) 메뉴 펼침:   위 메뉴의 프로그램 · 트레이너 · 기구에 마우스를 올리면 아래로 목록이 주르륵 펼쳐진다
 *    (목록 내용은 config.js 에서 자동으로 만든다. 폰 메뉴에서는 펼치지 않는다)
 * 키보드(Tab)로 버튼에 갔을 때도 똑같이 동작한다. 모양은 css/style.css 의 .swap, .btn__photo 부분.
 */
(function () {
  "use strict";
  const S = window.SITE || {};
  const photo = (window.APP && window.APP.photo) || ((id) => id);

  /* ---------- 3) 메뉴 펼침 ---------- */
  const nav = document.getElementById("nav");
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
  const plateKg = { red: 25, blue: 20, yellow: 15, green: 10 };
  const menus = {
    "programs.html": () => (S.programs || []).map((p) => ({
      href: "programs.html#" + p.id, title: p.name, sub: p.weeks + " · " + p.tags.join(" · "), mark: "plate-" + p.plate, kg: plateKg[p.plate]
    })),
    "trainers.html": () => (S.trainers || []).map((t) => ({
      href: "trainers.html#trainer-" + t.id, title: t.name + " " + t.role, sub: t.focus + " · " + t.days.slice().sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)).map((d) => dayNames[d]).join(""),
      img: t.img, mark: "plate-" + t.color
    })),
    "equipment.html": () => Object.entries(S.equipment || {}).map(([zone, items], i) => ({
      href: "equipment.html#zone-" + i, title: zone, sub: items.slice(0, 3).map((x) => x[0]).join(", ") + (items.length > 3 ? " 외 " + (items.length - 3) + "개" : "")
    }))
  };

  function buildDropdown(link, items) {
    const item = document.createElement("div");
    item.className = "nav__item";
    link.replaceWith(item);
    item.append(link);
    link.setAttribute("aria-haspopup", "true");
    link.setAttribute("aria-expanded", "false");

    const panel = document.createElement("div");
    panel.className = "dropdown";
    const list = document.createElement("ul");
    items.forEach((it, i) => {
      const li = document.createElement("li");
      li.style.setProperty("--i", i);                 /* 위에서부터 차례로 내려오게 */
      const a = document.createElement("a");
      a.href = it.href;
      a.className = "dropdown__link";
      const thumb = document.createElement("span");
      thumb.className = "dropdown__thumb " + (it.mark || "");
      thumb.setAttribute("aria-hidden", "true");
      if (it.img) thumb.style.backgroundImage = `url("${photo(it.img, 120)}")`;
      else if (it.kg) thumb.textContent = it.kg;
      const text = document.createElement("span");
      text.className = "dropdown__text";
      const strong = document.createElement("strong");
      strong.textContent = it.title;
      const small = document.createElement("small");
      small.textContent = it.sub;
      text.append(strong, small);
      a.append(thumb, text);
      li.append(a);
      list.append(li);
    });
    const all = document.createElement("a");
    all.className = "dropdown__all";
    all.href = link.getAttribute("href");
    all.textContent = link.textContent.trim() + " 전체 보기 →";
    panel.append(list, all);
    item.append(panel);

    let timer;
    const open = () => { clearTimeout(timer); item.classList.add("is-open"); link.setAttribute("aria-expanded", "true"); };
    const close = () => { timer = setTimeout(() => { item.classList.remove("is-open"); link.setAttribute("aria-expanded", "false"); }, 120); };
    item.addEventListener("mouseenter", open);
    item.addEventListener("mouseleave", close);
    item.addEventListener("focusin", open);
    item.addEventListener("focusout", (e) => { if (!item.contains(e.relatedTarget)) close(); });
    item.addEventListener("keydown", (e) => { if (e.key === "Escape") { item.classList.remove("is-open"); link.focus(); } });
  }

  if (nav) {
    nav.querySelectorAll(":scope > a").forEach((link) => {
      const make = menus[link.getAttribute("href")];
      if (make) buildDropdown(link, make());
    });
  }

  /* ---------- 1) 글자 바꾸기 ---------- */
  document.querySelectorAll("[data-hover]").forEach((btn) => {
    const original = btn.textContent.trim();
    const hoverText = btn.dataset.hover;

    /* 화면 읽기 프로그램에는 두 글자를 한 번에 알려 준다 */
    btn.setAttribute("aria-label", `${original} (${hoverText})`);

    /* 원래 글자와 바뀔 글자를 같은 자리에 겹쳐 둔다 (버튼 폭이 흔들리지 않게) */
    const wrap = document.createElement("span");
    wrap.className = "swap";
    const a = document.createElement("span");
    a.textContent = original;
    const b = document.createElement("span");
    b.textContent = hoverText;
    b.setAttribute("aria-hidden", "true");
    wrap.append(a, b);
    btn.replaceChildren(wrap);

    const on = () => btn.classList.add("is-swapped");
    const off = () => btn.classList.remove("is-swapped");
    btn.addEventListener("mouseenter", on);
    btn.addEventListener("mouseleave", off);
    btn.addEventListener("focus", on);
    btn.addEventListener("blur", off);
  });

  /* ---------- 2) 버튼 안에 운동 사진 넣기 ---------- */
  const photoBtns = document.querySelectorAll("[data-hover-photo]");
  if (!photoBtns.length) return;

  /* 고를 수 있는 운동 사진: 갤러리 + 프로그램 + 트레이너 */
  const P = S.photos || {};
  const pool = [
    ...(P.gallery || []).map(([id]) => id),
    ...(S.programs || []).filter((p) => p.img).map((p) => p.img),
    ...(S.trainers || []).filter((t) => t.img).map((t) => t.img)
  ];
  const src = (id) => photo(id, 480);

  /* 처음 올릴 때 바로 보이도록 미리 받아 둔다 */
  const preload = () => pool.forEach((id) => { const i = new Image(); i.src = src(id); });
  if ("requestIdleCallback" in window) requestIdleCallback(preload); else setTimeout(preload, 1500);

  let last = -1;
  function pick(value) {
    if (value && value !== "random") return value;  /* 사진 하나로 정해 둔 버튼 */
    if (!pool.length) return null;
    let n = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && n === last) n = (n + 1) % pool.length; /* 같은 사진 연속으로 안 나오게 */
    last = n;
    return pool[n];
  }

  photoBtns.forEach((btn) => {
    btn.classList.add("btn--photo");
    /* 사진은 버튼 안의 맨 뒤 층에 깔린다 (글자는 그 위) */
    const layer = document.createElement("span");
    layer.className = "btn__photo";
    layer.setAttribute("aria-hidden", "true");
    btn.prepend(layer);

    const show = () => {
      const id = pick(btn.dataset.hoverPhoto);
      if (id) layer.style.backgroundImage = `url("${src(id)}")`;
    };
    btn.addEventListener("mouseenter", show);
    btn.addEventListener("focus", show);
  });
})();
