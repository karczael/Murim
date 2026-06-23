/* ============================================================
   천마전생록 — 랜딩 인터랙션
   ============================================================ */
(() => {
  "use strict";

  /* ---------- 네비 스크롤 ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 모바일 메뉴 */
  const burger = document.getElementById("burger");
  const links = document.querySelector(".nav__links");
  burger?.addEventListener("click", () => links.classList.toggle("open"));
  links?.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => links.classList.remove("open"))
  );

  /* ---------- 캐릭터 데이터 ---------- */
  const CHARS = [
    { id: "unhwi", name: "운휘", hanja: "雲輝", tag: "lead", role: "주인공 · 전생의 천마. 멸문한 운가장의 마지막 핏줄." },
    { id: "cheonma", name: "천마", hanja: "天魔", tag: "lead", role: "운휘의 전생. 천하를 굽어본 마교 교주." },
    { id: "daeho", name: "석대호", hanja: "石大虎", tag: "ally", role: "첫 동료. 몸으로 막아 치명타를 무효화하는 의리의 거한." },
    { id: "manchun", name: "만춘", hanja: "萬春", tag: "ally", role: "운가장의 충복 노복. 회귀의 정서적 닻." },
    { id: "gwian", name: "귀안", hanja: "鬼眼", tag: "ally", role: "흑점의 외눈 거간. 강호의 정보와 영약을 파는 상인." },
    { id: "jinhyeolcheon", name: "진혈천", hanja: "陳血天", tag: "enemy", role: "부교주 혈월신수. 천마의 등을 찌른 배신의 칼." },
    { id: "dogung", name: "도굉", hanja: "屠宏", tag: "enemy", role: "혈안나찰. 전마각 수석교두, 제1장의 벽." },
  ];
  const TAG_LABEL = { lead: "주인공", ally: "동지", enemy: "원수" };

  const charGrid = document.getElementById("char-grid");
  if (charGrid) {
    charGrid.innerHTML = CHARS.map(
      (c) => `
      <article class="char reveal" data-tilt>
        <img src="assets/chars/${c.id}.webp" alt="${c.name}" loading="lazy" />
        <span class="char__tag ${c.tag}">${TAG_LABEL[c.tag]}</span>
        <div class="char__overlay">
          <h3 class="char__name">${c.name}<span class="char__hanja">${c.hanja}</span></h3>
          <p class="char__role">${c.role}</p>
        </div>
      </article>`
    ).join("");
  }

  /* ---------- 갤러리 데이터 ---------- */
  const GAL = [
    { id: "market", cap: "흑점 — 강호의 뒷골목" },
    { id: "path", cap: "마교로 향하는 산길" },
    { id: "ruin", cap: "멸문한 운가장" },
    { id: "camp", cap: "녹림 산채" },
    { id: "cave", cap: "어둠이 깔린 동굴" },
    { id: "gate", cap: "마교의 관문" },
  ];
  const galGrid = document.getElementById("gal-grid");
  if (galGrid) {
    galGrid.innerHTML = GAL.map(
      (g) => `
      <figure class="gal-item reveal">
        <img src="assets/screens/${g.id}.webp" alt="${g.cap}" loading="lazy" />
        <figcaption class="gal-item__cap">${g.cap}</figcaption>
      </figure>`
    ).join("");
  }

  /* ---------- REVEAL (IntersectionObserver) ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  const observeReveals = () =>
    document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
  observeReveals();

  /* ---------- 캐릭터 3D 틸트 ---------- */
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("pointermove", (ev) => {
        const r = card.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${px * 9}deg) rotateX(${-py * 9}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  /* ---------- 히어로 패럴랙스 ---------- */
  const px = document.querySelectorAll("[data-parallax]");
  if (!reduce && px.length) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        px.forEach((el) => {
          const k = parseFloat(el.dataset.parallax);
          el.style.transform = `translate3d(0, ${y * k}px, 0)`;
        });
      },
      { passive: true }
    );
  }

  /* ---------- 불씨/재 파티클 ---------- */
  const canvas = document.getElementById("ember-canvas");
  if (canvas && !reduce) {
    const ctx = canvas.getContext("2d");
    let W, H, embers;
    const COUNT = Math.min(70, Math.floor(window.innerWidth / 16));
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    function spawn() {
      return {
        x: rand(0, W),
        y: rand(0, H) + H * 0.2,
        r: rand(0.6, 2.4),
        vy: rand(0.15, 0.7),
        vx: rand(-0.25, 0.25),
        life: rand(0, 1),
        hue: Math.random() < 0.7 ? rand(2, 22) : rand(38, 48), // 혈홍~금
        flick: rand(0.005, 0.02),
      };
    }
    function init() {
      resize();
      embers = Array.from({ length: COUNT }, spawn);
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      for (const e of embers) {
        e.y -= e.vy;
        e.x += e.vx + Math.sin(e.y * 0.01) * 0.2;
        e.life += e.flick;
        const a = 0.35 + Math.abs(Math.sin(e.life)) * 0.45;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${e.hue}, 90%, 60%, ${a})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${e.hue}, 95%, 55%, ${a})`;
        ctx.fill();
        if (e.y < -10 || e.x < -10 || e.x > W + 10) Object.assign(e, spawn(), { y: H + 10 });
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(tick);
    }
    window.addEventListener("resize", resize);
    init();
    tick();
  }
})();
