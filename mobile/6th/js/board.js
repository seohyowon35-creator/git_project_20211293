/*
 * 소통 게시판
 * 지금은 글을 이 브라우저(localStorage)에 저장한다. 여러 사람이 같은 글을 보려면
 * 서버나 DB(Firebase, Supabase 등)가 필요하다 → 아래 db 객체의 load/save 만 바꾸면 된다.
 */
(function () {
  "use strict";
  const S = window.SITE;
  const { $, $$, el, store, toast } = window.APP;
  const KEY = "platept.board.v1";
  const PER_PAGE = 8;

  /* ---------- 저장소 ---------- */
  const db = {
    load() { return store.get(KEY, null); },
    save(posts) {
      if (!store.set(KEY, posts)) toast("저장 공간이 부족해 글을 저장하지 못했습니다.");
    }
  };

  async function hash(text) {
    try {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("platept:" + text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (e) {
      /* 보안 연결이 아닐 때(파일로 직접 열 때) 쓰는 간단한 대체 */
      let h = 5381;
      for (const ch of "platept:" + text) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0;
      return "x" + h.toString(16);
    }
  }

  /* 처음 열었을 때 보여 줄 예시 글 (비밀번호 0000) */
  async function seed() {
    const pw = await hash("0000");
    const d = (daysAgo, h) => { const t = new Date(); t.setDate(t.getDate() - daysAgo); t.setHours(h, 12, 0, 0); return t.toISOString(); };
    return [
      { id: "p1", no: 1, cat: "공지", title: "[예시] 10월 운영 시간 안내", author: "센터", body: "10월 9일 한글날은 10시부터 17시까지 운영합니다.\nPT 수업은 평소처럼 예약제로 진행합니다.", pw, created: d(9, 10), views: 58, comments: [] },
      { id: "p2", no: 2, cat: "질문", title: "[예시] 스쿼트할 때 무릎이 안쪽으로 모여요", author: "초보헬린이", body: "바벨 스쿼트 60kg부터 무릎이 안쪽으로 들어갑니다. 무게를 낮춰야 할까요?", pw, created: d(5, 21), views: 34,
        comments: [{ id: "c1", author: "박하은 트레이너", body: "엉덩이 바깥 근육이 약할 때 많이 생깁니다. 다음 수업 때 밴드 워크로 같이 확인해 봐요.", created: d(5, 22) }] },
      { id: "p3", no: 3, cat: "후기", title: "[예시] PT 20회 끝나고 데드리프트 100kg 성공", author: "역삼직장인", body: "처음엔 40kg도 허리가 무서웠는데 20회 동안 힙힌지부터 다시 배웠습니다.\n기록표를 매번 보여 주셔서 좋았어요.", pw, created: d(2, 19), views: 71, comments: [] },
      { id: "p4", no: 4, cat: "자유", title: "[예시] 오전 6시 운동 같이 하실 분", author: "새벽러", body: "평일 6시에 오시는 분들 인사하고 지내요. 스트레칭 존에 주로 있습니다.", pw, created: d(0, 7), views: 12, comments: [] }
    ];
  }

  let posts = [];
  let cat = "전체";
  let query = "";
  let page = 1;
  let openId = null;

  const fmtDate = (iso) => {
    const t = new Date(iso), now = new Date();
    const same = t.toDateString() === now.toDateString();
    const p = (n) => String(n).padStart(2, "0");
    return same ? `${p(t.getHours())}:${p(t.getMinutes())}` : `${String(t.getFullYear()).slice(2)}.${p(t.getMonth() + 1)}.${p(t.getDate())}`;
  };

  /* ---------- 목록 ---------- */
  function filtered() {
    const q = query.trim().toLowerCase();
    return posts
      .filter((p) => cat === "전체" || p.cat === cat)
      .filter((p) => !q || (p.title + " " + p.body + " " + p.author).toLowerCase().includes(q))
      .sort((a, b) => {
        if (a.cat === "공지" && b.cat !== "공지") return -1;
        if (b.cat === "공지" && a.cat !== "공지") return 1;
        return b.no - a.no;
      });
  }

  function renderCats() {
    const box = $("#boardCats");
    box.replaceChildren(...["전체", ...S.boardCategories].map((c) =>
      el("button", { type: "button", role: "tab", class: "chip" + (c === cat ? " is-on" : ""), "aria-selected": String(c === cat), text: c,
        onclick: () => { cat = c; page = 1; renderCats(); renderList(); } })
    ));
  }

  function renderList() {
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    page = Math.min(page, pages);
    const rows = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const body = $("#boardBody");

    if (!rows.length) {
      body.replaceChildren(el("tr", { class: "empty-row" }, [el("td", { colspan: "6", text: query ? `'${query}' 검색 결과가 없습니다.` : "아직 글이 없습니다. 오른쪽 위 글쓰기로 첫 글을 남겨 주세요." })]));
    } else {
      body.replaceChildren(...rows.map((p) => el("tr", { class: p.cat === "공지" ? "is-notice" : "" }, [
        el("td", { class: "c-no mono", text: p.cat === "공지" ? "공지" : p.no }),
        el("td", { class: "c-cat" }, [el("span", { class: "badge cat-" + S.boardCategories.indexOf(p.cat), text: p.cat })]),
        el("td", { class: "c-title" }, [
          el("button", { type: "button", class: "post-link", "data-id": p.id, text: p.title }),
          p.comments.length ? el("span", { class: "c-count mono", text: `[${p.comments.length}]` }) : null
        ]),
        el("td", { class: "c-author", text: p.author }),
        el("td", { class: "c-date mono", text: fmtDate(p.created) }),
        el("td", { class: "c-views mono", text: p.views })
      ])));
    }

    const pager = $("#boardPager");
    pager.replaceChildren();
    if (pages > 1) {
      const go = (n) => () => { page = n; renderList(); $("#board").scrollIntoView({ behavior: "smooth" }); };
      pager.append(el("button", { type: "button", class: "pager__btn", disabled: page === 1, "aria-label": "이전 페이지", text: "‹", onclick: go(page - 1) }));
      for (let i = 1; i <= pages; i++) {
        pager.append(el("button", { type: "button", class: "pager__btn mono" + (i === page ? " is-on" : ""), "aria-current": i === page ? "page" : null, text: i, onclick: go(i) }));
      }
      pager.append(el("button", { type: "button", class: "pager__btn", disabled: page === pages, "aria-label": "다음 페이지", text: "›", onclick: go(page + 1) }));
    }
  }

  /* ---------- 창 열고 닫기 ---------- */
  function openModal(dlg) {
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
  }
  function closeModal(dlg) {
    if (typeof dlg.close === "function") dlg.close(); else dlg.removeAttribute("open");
  }
  $$("dialog.modal").forEach((dlg) => {
    dlg.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]") || e.target === dlg) closeModal(dlg);
    });
  });

  /* ---------- 글쓰기 ---------- */
  const wCat = $("#wCat");
  const isAdmin = false; /* 공지는 운영자만: 관리자 기능을 붙이면 true 로 */
  S.boardCategories.filter((c) => c !== "공지" || isAdmin).forEach((c) => wCat.append(el("option", { value: c, text: c })));

  $("#writeBtn").addEventListener("click", () => {
    $("#writeForm").reset();
    $("#wError").textContent = "";
    if (cat !== "전체" && cat !== "공지") wCat.value = cat;
    openModal($("#writeModal"));
    $("#wAuthor").focus();
  });

  $("#writeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const author = $("#wAuthor").value.trim();
    const title = $("#wTitle").value.trim();
    const body = $("#wBody").value.trim();
    const pw = $("#wPw").value;
    const err = $("#wError");
    if (!author) return (err.textContent = "글쓴이를 적어 주세요.");
    if (!title) return (err.textContent = "제목을 적어 주세요.");
    if (body.length < 5) return (err.textContent = "내용을 5자 이상 적어 주세요.");
    if (pw.length < 4) return (err.textContent = "비밀번호를 4자 이상 정해 주세요.");

    const no = posts.reduce((m, p) => Math.max(m, p.no), 0) + 1;
    posts.push({ id: "p" + Date.now().toString(36), no, cat: wCat.value, title, author, body, pw: await hash(pw), created: new Date().toISOString(), views: 0, comments: [] });
    db.save(posts);
    closeModal($("#writeModal"));
    cat = "전체"; query = ""; $("#boardSearch").value = ""; page = 1;
    renderCats(); renderList();
    toast("글을 올렸습니다.");
  });

  /* ---------- 글 보기 ---------- */
  function renderPost() {
    const p = posts.find((x) => x.id === openId);
    if (!p) return;
    $("#vCat").textContent = p.cat;
    $("#vCat").className = "badge cat-" + S.boardCategories.indexOf(p.cat);
    $("#viewTitle").textContent = p.title;
    $("#vMeta").textContent = `${p.author} · ${new Date(p.created).toLocaleString("ko-KR")} · 조회 ${p.views}`;
    $("#vBody").replaceChildren(...p.body.split("\n").map((line) => el("p", { text: line || " " })));
    $("#vCount").textContent = p.comments.length;
    const cl = $("#vComments");
    cl.replaceChildren(...(p.comments.length
      ? p.comments.map((c) => el("li", {}, [
          el("div", { class: "comment__meta" }, [el("strong", { text: c.author }), el("span", { class: "small muted mono", text: fmtDate(c.created) })]),
          el("p", { text: c.body })
        ]))
      : [el("li", { class: "muted small", text: "첫 댓글을 남겨 주세요." })]));
  }

  $("#boardBody").addEventListener("click", (e) => {
    const b = e.target.closest(".post-link");
    if (!b) return;
    openId = b.dataset.id;
    const p = posts.find((x) => x.id === openId);
    p.views += 1;
    db.save(posts);
    renderPost();
    $("#delForm").hidden = true;
    $("#delError").textContent = "";
    $("#delPw").value = "";
    openModal($("#viewModal"));
    renderList();
  });

  $("#commentForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const author = $("#cAuthor").value.trim();
    const body = $("#cBody").value.trim();
    if (!author || !body) { toast("닉네임과 댓글을 모두 적어 주세요."); return; }
    const p = posts.find((x) => x.id === openId);
    p.comments.push({ id: "c" + Date.now().toString(36), author, body, created: new Date().toISOString() });
    db.save(posts);
    $("#cBody").value = "";
    renderPost();
    renderList();
  });

  /* ---------- 글 지우기 (비밀번호 확인) ---------- */
  $("#delOpen").addEventListener("click", () => {
    const f = $("#delForm");
    f.hidden = !f.hidden;
    if (!f.hidden) $("#delPw").focus();
  });
  $("#delForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const p = posts.find((x) => x.id === openId);
    if (!p) return;
    if ((await hash($("#delPw").value)) !== p.pw) {
      $("#delError").textContent = "비밀번호가 맞지 않습니다.";
      return;
    }
    posts = posts.filter((x) => x.id !== openId);
    db.save(posts);
    closeModal($("#viewModal"));
    renderList();
    toast("글을 지웠습니다.");
  });

  /* ---------- 검색 ---------- */
  let searchTimer;
  $("#boardSearch").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { query = e.target.value; page = 1; renderList(); }, 150);
  });

  /* ---------- 시작 ---------- */
  (async function init() {
    posts = db.load();
    if (!Array.isArray(posts)) {
      posts = await seed();
      db.save(posts);
    }
    renderCats();
    renderList();
  })();
})();
