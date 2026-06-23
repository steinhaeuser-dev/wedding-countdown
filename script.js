(() => {
  console.log("💍 Wedding script loaded");

  const CONFIG = {
    totalDays: 24,
    weddingDate: new Date(2026, 6, 17), // July 17, 2026
    contentUrl: "./content.json",
    berlinTimeZone: "Europe/Berlin",
  };

  const el = {
    calendar: document.getElementById("calendar"),
    modal: document.getElementById("modal"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    closeBtn: document.getElementById("closeBtn"),
    countdown: document.getElementById("countdown"),
  };

  if (!el.calendar || !el.modal || !el.modalTitle || !el.modalBody || !el.closeBtn) {
    throw new Error("❌ Missing required DOM elements");
  }

  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.berlinTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  function berlinYMD(date = new Date()) {
    const parts = fmt.formatToParts(date);
    return {
      y: Number(parts.find(p => p.type === "year").value),
      m: Number(parts.find(p => p.type === "month").value),
      d: Number(parts.find(p => p.type === "day").value),
    };
  }

  function berlinMidnightMs(date = new Date()) {
    const { y, m, d } = berlinYMD(date);
    return Date.UTC(y, m - 1, d);
  }

  function berlinTodayDayNumber() {
    const start = berlinMidnightMs(new Date(2026, 5, 24)); // June 24, 2026
    const today = berlinMidnightMs(new Date());
    const diffDays = Math.floor((today - start) / 86400000);
    return Math.max(1, diffDays + 1);
  }

  function closeModal() {
    el.modal.classList.add("hidden");
  }

  function openModal(title, bodyHTML) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = bodyHTML;
    el.modal.classList.remove("hidden");
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function renderEntry(entry, day) {
    const title = entry.title || `Day ${day}`;

    if (entry.type === "memory") {
      el.modalTitle.textContent = title;
      el.modalBody.innerHTML = `
        <div class="memory">
          ${entry.photo ? `<img src="${entry.photo}" alt="${escapeHtml(title)}">` : ""}
          ${entry.text ? `<p>${escapeHtml(entry.text)}</p>` : ""}
        </div>
      `;
      el.modal.classList.remove("hidden");
      return;
    }

    if (entry.type === "coupon") {
      el.modalTitle.textContent = title;
      el.modalBody.innerHTML = `
        <div class="coupon">
          <h3>🎟 ${escapeHtml(title)}</h3>
          <p>${escapeHtml(entry.text || "")}</p>
          <small>Redeem anytime ❤️</small>
        </div>
      `;
      el.modal.classList.remove("hidden");
      return;
    }

    if (entry.type === "audio") {
      el.modalTitle.textContent = title;
      el.modalBody.innerHTML = `
        <div class="audio">
          <p>${escapeHtml(entry.text || "")}</p>
          ${entry.audio ? `
            <audio controls>
              <source src="${entry.audio}" type="audio/mpeg">
            </audio>
          ` : ""}
        </div>
      `;
      el.modal.classList.remove("hidden");
      return;
    }

    if (entry.type === "quiz") {
      el.modalTitle.textContent = title;
      el.modalBody.innerHTML = `
        <div class="quiz">
          <h3>❓ ${escapeHtml(title)}</h3>
          <p>${escapeHtml(entry.question || "")}</p>
          <details>
            <summary>Reveal answer</summary>
            <p>${escapeHtml(entry.answer || "")}</p>
          </details>
        </div>
      `;
      el.modal.classList.remove("hidden");
      return;
    }

    openModal(title, `<p>${escapeHtml(entry.text || "")}</p>`);
  }

  function renderCalendar(content) {
    const todayDay = berlinTodayDayNumber();
    el.calendar.innerHTML = "";

    for (let day = 1; day <= CONFIG.totalDays; day++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "door";

      const isPast = day < todayDay;
      const isToday = day === todayDay;

      if (isPast) {
        btn.classList.add("opened");
        btn.innerHTML = `<span>${day} ✔</span>`;
      } else if (isToday) {
        btn.classList.add("today");
        btn.innerHTML = `<span>${day} ✨</span>`;
      } else {
        btn.classList.add("locked");
        btn.innerHTML = `<span>${day}</span>`;
      }

      btn.addEventListener("click", () => {
        const currentDay = berlinTodayDayNumber();

        if (day > currentDay) {
          openModal(`Day ${day}`, "🔒 Come back later.");
          return;
        }

        const entry = content[String(day)];
        if (!entry) {
          openModal(`Day ${day}`, "❤️ Something beautiful is still being prepared for you.");
          return;
        }

        renderEntry(entry, day);
      });

      el.calendar.appendChild(btn);
    }
  }

  function updateCountdown() {
    if (!el.countdown) return;

    const now = berlinMidnightMs(new Date());
    const wedding = berlinMidnightMs(CONFIG.weddingDate);
    const daysLeft = Math.max(0, Math.ceil((wedding - now) / 86400000));

    el.countdown.textContent = `${daysLeft} days until we get married ❤️`;
  }

  async function init() {
    closeModal();
    el.closeBtn.addEventListener("click", closeModal);
    el.modal.addEventListener("click", (e) => {
      if (e.target === el.modal) closeModal();
    });

    let content = {};
    try {
      const res = await fetch(CONFIG.contentUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      content = await res.json();
    } catch (err) {
      console.error("Failed to load content.json:", err);
    }

    renderCalendar(content);
    updateCountdown();
  }

  init();
})();
