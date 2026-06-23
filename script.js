console.log("💍 Wedding script loaded");

(() => {
    "use strict";

    const CONFIG = {
        timeZone: "Europe/Berlin",
        totalDays: 24,
        firstOpenDate: { year: 2026, month: 6, day: 23 },
        weddingDate: { year: 2026, month: 7, day: 17 },
        contentUrl: "./content.json"
    };

    const els = {
        calendar: document.getElementById("calendar"),
        modal: document.getElementById("modal"),
        modalTitle: document.getElementById("modalTitle"),
        modalBody: document.getElementById("modalBody"),
        closeBtn: document.getElementById("closeBtn"),
        countdown: document.getElementById("countdown")
    };

    if (!els.calendar || !els.modal || !els.modalTitle || !els.modalBody || !els.closeBtn || !els.countdown) {
        console.error("Missing required DOM elements");
        return;
    }

    const berlinFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: CONFIG.timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    function getBerlinParts(date = new Date()) {
        const parts = berlinFormatter.formatToParts(date);
        return {
            year: Number(parts.find(p => p.type === "year").value),
            month: Number(parts.find(p => p.type === "month").value),
            day: Number(parts.find(p => p.type === "day").value)
        };
    }

    function toUtcMidnightMs({ year, month, day }) {
        return Date.UTC(year, month - 1, day);
    }

    function getTodayBerlinMs() {
        return toUtcMidnightMs(getBerlinParts(new Date()));
    }

    function getUnlockedDay() {
        const todayMs = getTodayBerlinMs();
        const startMs = toUtcMidnightMs(CONFIG.firstOpenDate);
        const diffDays = Math.floor((todayMs - startMs) / 86400000);
        return Math.max(1, Math.min(CONFIG.totalDays, diffDays + 1));
    }

    function getDaysUntilWedding() {
        const todayMs = getTodayBerlinMs();
        const weddingMs = toUtcMidnightMs(CONFIG.weddingDate);
        return Math.max(0, Math.ceil((weddingMs - todayMs) / 86400000));
    }

    function updateCountdown() {
        const daysLeft = getDaysUntilWedding();
        els.countdown.textContent = `${daysLeft} days until we get married ❤️`;
    }

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function openModal(title, html) {
        els.modalTitle.textContent = title;
        els.modalBody.innerHTML = html;
        els.modal.classList.remove("hidden");
        els.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }

    function closeModal() {
        els.modal.classList.add("hidden");
        els.modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");
    }

    function renderEntry(entry, day) {
        const title = entry?.title || `Day ${day}`;
        els.modalTitle.textContent = title;

        switch (entry?.type) {
            case "memory":
                els.modalBody.innerHTML = `
                    <div class="memory">
                        ${entry.photo ? `<img src="${entry.photo}" alt="${escapeHtml(title)}">` : ""}
                        <p>${escapeHtml(entry.text || "")}</p>
                    </div>
                `;
                break;

            case "coupon":
                els.modalBody.innerHTML = `
                    <div class="coupon">
                        <h3>🎟 ${escapeHtml(title)}</h3>
                        <p>${escapeHtml(entry.text || "")}</p>
                        <small>Redeem anytime ❤️</small>
                    </div>
                `;
                break;

            case "audio":
                els.modalBody.innerHTML = `
                    <div class="audio">
                        <p>${escapeHtml(entry.text || "")}</p>
                        ${entry.audio ? `
                            <audio controls preload="none">
                                <source src="${entry.audio}" type="audio/mpeg">
                                Your browser does not support audio playback.
                            </audio>
                        ` : "<p>Audio file missing.</p>"}
                    </div>
                `;
                break;

            case "quiz":
                els.modalBody.innerHTML = `
                    <div class="quiz">
                        <h3>❓ ${escapeHtml(title)}</h3>
                        <p>${escapeHtml(entry.question || "")}</p>
                        <details>
                            <summary>Reveal answer</summary>
                            <p>${escapeHtml(entry.answer || "")}</p>
                        </details>
                    </div>
                `;
                break;

            default:
                els.modalBody.innerHTML = `<p>${escapeHtml(entry?.text || "❤️ Something beautiful is still being prepared for you.")}</p>`;
        }

        els.modal.classList.remove("hidden");
        els.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");
    }

    function buildDoor(day, unlockedDay, content) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "door";
        btn.setAttribute("aria-label", `Open day ${day}`);

        if (day < unlockedDay) {
            btn.classList.add("opened");
            btn.innerHTML = `<span>${day} ✔</span>`;
        } else if (day === unlockedDay) {
            btn.classList.add("today");
            btn.innerHTML = `<span>${day} ✨</span>`;
        } else {
            btn.classList.add("locked");
            btn.innerHTML = `<span>${day}</span>`;
        }

        btn.addEventListener("click", () => {
            const currentUnlockedDay = getUnlockedDay();

            if (day > currentUnlockedDay) {
                openModal(`Day ${day}`, "<p>🔒 Come back later.</p>");
                return;
            }

            const entry = content[String(day)];

            if (!entry) {
                openModal(`Day ${day}`, "<p>❤️ Something beautiful is still being prepared for you.</p>");
                return;
            }

            renderEntry(entry, day);
        });

        return btn;
    }

    function renderCalendar(content = {}) {
        const unlockedDay = getUnlockedDay();
        els.calendar.innerHTML = "";

        for (let day = 1; day <= CONFIG.totalDays; day++) {
            els.calendar.appendChild(buildDoor(day, unlockedDay, content));
        }
    }

    async function loadContent() {
        try {
            const res = await fetch(CONFIG.contentUrl, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return await res.json();
        } catch (error) {
            console.error("Could not load content.json:", error);
            return {};
        }
    }

    function bindEvents() {
        els.closeBtn.addEventListener("click", closeModal);

        els.modal.addEventListener("click", (event) => {
            if (event.target === els.modal) closeModal();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeModal();
        });
    }

    async function init() {
        bindEvents();
        updateCountdown();
        renderCalendar({});
        const content = await loadContent();
        renderCalendar(content);
        updateCountdown();
    }

    init().catch((error) => {
        console.error("Init failed:", error);
        updateCountdown();
        renderCalendar({});
    });
})();
