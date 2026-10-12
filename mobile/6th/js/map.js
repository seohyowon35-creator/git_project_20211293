/* 오시는 길: 내 위치 → 센터 길찾기 (Leaflet + OpenStreetMap + OSRM 길 계산) */
(function () {
  "use strict";
  const S = window.SITE;
  const { $, $$, el, toast, copy } = window.APP;
  const GYM = [S.lat, S.lng];

  let mode = "foot";          // foot | car
  let start = null;           // [lat, lng]
  let startLabel = "내 위치";

  /* ---------- 외부 지도 링크 ---------- */
  function updateLinks() {
    const name = encodeURIComponent(S.name);
    const kakao = $("#kakaoLink");
    const google = $("#googleLink");
    const naver = $("#naverLink");
    if (start) {
      kakao.href = `https://map.kakao.com/link/from/${encodeURIComponent(startLabel)},${start[0]},${start[1]}/to/${name},${GYM[0]},${GYM[1]}`;
      google.href = `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${GYM[0]},${GYM[1]}&travelmode=${mode === "car" ? "driving" : "walking"}`;
    } else {
      kakao.href = `https://map.kakao.com/link/to/${name},${GYM[0]},${GYM[1]}`;
      google.href = `https://www.google.com/maps/dir/?api=1&destination=${GYM[0]},${GYM[1]}`;
    }
    naver.href = `https://map.naver.com/p/search/${encodeURIComponent(S.address.replace(/\(.*?\)/g, "").trim())}`;
  }

  /* ---------- 교통 안내 ---------- */
  $("#transitList").replaceChildren(...S.transit.map(([k, v]) => el("li", {}, [el("strong", { text: k }), el("span", { text: v })])));
  $("#copyAddr").addEventListener("click", () => copy(S.address, "주소를 복사했습니다."));
  updateLinks();

  /* ---------- 지도 ---------- */
  const mapBox = $("#map");
  if (!window.L) {
    mapBox.querySelector(".map__fallback").textContent = "지도를 불러오지 못했습니다. 인터넷 연결을 확인하거나 아래 카카오맵 · 네이버 지도 링크를 이용해 주세요.";
    $("#locateBtn").disabled = true;
    return;
  }
  mapBox.replaceChildren();

  const map = L.map(mapBox, { scrollWheelZoom: false, zoomControl: true }).setView(GYM, 16);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(map);
  /* 지도를 한 번 누르면 휠 확대가 켜진다 (페이지 스크롤이 지도에 걸리지 않게) */
  map.once("focus", () => map.scrollWheelZoom.enable());
  mapBox.addEventListener("click", () => map.scrollWheelZoom.enable(), { once: true });

  const gymIcon = L.divIcon({ className: "pin pin--gym", html: '<span><b>PT</b></span>', iconSize: [40, 48], iconAnchor: [20, 46], popupAnchor: [0, -42] });
  const meIcon = L.divIcon({ className: "pin pin--me", html: "<span></span>", iconSize: [22, 22], iconAnchor: [11, 11] });

  L.marker(GYM, { icon: gymIcon, title: S.name }).addTo(map)
    .bindPopup(`<strong>${S.name}</strong><br>${S.address}`).openPopup();

  let meMarker = null;
  let accuracyCircle = null;
  let routeLine = null;
  let reqId = 0;

  function haversine(a, b) {
    const R = 6371000, rad = Math.PI / 180;
    const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtDist = (m) => (m < 1000 ? Math.round(m) + " m" : (m / 1000).toFixed(1) + " km");
  const fmtTime = (s) => {
    const min = Math.max(1, Math.round(s / 60));
    return min < 60 ? min + "분" : Math.floor(min / 60) + "시간 " + (min % 60) + "분";
  };

  function showInfo(parts) {
    $("#routeInfo").replaceChildren(...parts);
  }

  function setStart(latlng, label, accuracy) {
    start = latlng;
    startLabel = label;
    if (meMarker) meMarker.setLatLng(latlng); else meMarker = L.marker(latlng, { icon: meIcon, title: label }).addTo(map);
    if (accuracyCircle) { map.removeLayer(accuracyCircle); accuracyCircle = null; }
    if (accuracy && accuracy < 2000) {
      accuracyCircle = L.circle(latlng, { radius: accuracy, className: "acc-circle", weight: 1 }).addTo(map);
    }
    updateLinks();
    drawRoute();
  }

  async function drawRoute() {
    if (!start) return;
    const my = ++reqId;
    const straight = haversine(start, GYM);
    showInfo([el("p", { class: "muted small", text: "길을 계산하는 중입니다…" })]);

    if (straight > 300000) {
      showInfo([el("p", { class: "small", text: `센터까지 직선거리 ${fmtDist(straight)}입니다. 너무 멀어서 길 안내 대신 카카오맵을 이용해 주세요.` })]);
      if (routeLine) map.removeLayer(routeLine);
      routeLine = L.polyline([start, GYM], { className: "route route--straight" }).addTo(map);
      map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
      return;
    }

    /* 공개 OSRM 서버: 도보는 routing.openstreetmap.de, 자동차는 router.project-osrm.org */
    const coords = `${start[1]},${start[0]};${GYM[1]},${GYM[0]}`;
    const url = mode === "foot"
      ? `https://routing.openstreetmap.de/routed-foot/route/v1/foot/${coords}?overview=full&geometries=geojson`
      : `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

    let route = null;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      const data = await res.json();
      if (data.code === "Ok" && data.routes && data.routes[0]) route = data.routes[0];
    } catch (e) { /* 길 계산 서버 실패 → 직선으로 */ }
    if (my !== reqId) return;

    if (routeLine) map.removeLayer(routeLine);
    if (route) {
      const pts = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      routeLine = L.polyline(pts, { className: "route" }).addTo(map);
      /* 도보 시간은 시속 4.5km 기준으로 다시 계산 (서버 값이 지역에 따라 들쭉날쭉함) */
      const secs = mode === "foot" ? route.distance / (4500 / 3600) : route.duration;
      showInfo([
        el("div", { class: "route-info__nums" }, [
          el("div", {}, [el("span", { class: "small muted", text: "거리" }), el("strong", { class: "mono", text: fmtDist(route.distance) })]),
          el("div", {}, [el("span", { class: "small muted", text: mode === "foot" ? "걸어서" : "차로" }), el("strong", { class: "mono", text: "약 " + fmtTime(secs) })])
        ]),
        el("p", { class: "small muted", text: `출발: ${startLabel}${mode === "car" ? " · 막히는 시간은 반영하지 않습니다." : ""}` })
      ]);
    } else {
      routeLine = L.polyline([start, GYM], { className: "route route--straight" }).addTo(map);
      showInfo([
        el("div", { class: "route-info__nums" }, [
          el("div", {}, [el("span", { class: "small muted", text: "직선거리" }), el("strong", { class: "mono", text: fmtDist(straight) })])
        ]),
        el("p", { class: "small muted", text: "길 계산 서버에 연결하지 못해 직선으로 표시했습니다. 정확한 길은 카카오맵 길찾기를 눌러 주세요." })
      ]);
    }
    map.fitBounds(routeLine.getBounds(), { padding: [48, 48] });
  }

  /* ---------- 내 위치 찾기 ---------- */
  const locateBtn = $("#locateBtn");
  locateBtn.addEventListener("click", () => {
    if (!("geolocation" in navigator)) {
      toast("이 브라우저는 위치 찾기를 지원하지 않습니다. 지도를 눌러 출발지를 골라 주세요.");
      return;
    }
    locateBtn.disabled = true;
    locateBtn.textContent = "위치 찾는 중…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locateBtn.disabled = false;
        locateBtn.textContent = "내 위치 다시 찾기";
        setStart([pos.coords.latitude, pos.coords.longitude], "내 위치", pos.coords.accuracy);
      },
      (err) => {
        locateBtn.disabled = false;
        locateBtn.textContent = "내 위치 찾기";
        const why = err.code === 1
          ? "위치 권한이 꺼져 있습니다. 주소창 왼쪽 자물쇠에서 위치를 허용하거나, 지도를 눌러 출발지를 골라 주세요."
          : "위치를 찾지 못했습니다. 지도를 눌러 출발지를 골라 주세요.";
        toast(why);
        showInfo([el("p", { class: "small", text: why })]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

  /* 지도를 눌러 출발지 고르기 */
  map.on("click", (e) => setStart([e.latlng.lat, e.latlng.lng], "고른 출발지"));

  /* 도보 / 자동차 */
  $$(".seg__btn").forEach((b) => b.addEventListener("click", () => {
    mode = b.dataset.mode;
    $$(".seg__btn").forEach((x) => { const on = x === b; x.classList.toggle("is-on", on); x.setAttribute("aria-pressed", String(on)); });
    updateLinks();
    drawRoute();
  }));

  /* 숨겨진 상태에서 그려진 지도 크기 바로잡기 */
  window.addEventListener("load", () => map.invalidateSize());
})();
