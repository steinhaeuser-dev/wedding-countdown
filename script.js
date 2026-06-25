console.log("💍 Hochzeitsskript geladen");

(() => {
    "use strict";

    const CONFIG = {
        timeZone: "Europe/Berlin",
        totalDays: 24,
        firstOpenDate: { year: 2026, month: 6, day: 23 },
        weddingDate: { year: 2026, month: 7, day: 17 },
        contentUrl: "./content.json?v=20260625-2"
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
        console.error("❌ Benötigte DOM-Elemente fehlen");
        return;
    }

    const berlinFormatter = new Intl.DateTimeFormat("de-DE", {
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
        const firstOpenMs = toUtcMidnightMs(CONFIG.firstOpenDate);
        const diffDays = Math.floor((todayMs - firstOpenMs) / 86400000);
        return Math.max(1, Math.min(CONFIG.totalDays, diffDays + 1));
    }

    function getDaysUntilWedding() {
        const todayMs = getTodayBerlinMs();
        const weddingMs = toUtcMidnightMs(CONFIG.weddingDate);
        return Math.max(0, Math.ceil((weddingMs - todayMs) / 86400000));
    }

    function escapeHtml(value = "") {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function updateCountdown() {
        const daysLeft = getDaysUntilWedding();
        els.countdown.textContent = `${daysLeft} Tage bis wir heiraten ❤️`;
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

    function launchComplimentShower(compliments = []) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) return;

        const shower = document.createElement("div");
        shower.className = "compliment-shower";
        document.body.appendChild(shower);

        const phrases = compliments.length
            ? compliments
            : [
                "du bist die Beste",
                "du bist die Heißeste",
                "du bist die Klügste",
                "du bist mein Baby",
                "du bist meine Seelenverwandte",
                "du hast wunderschöne Rehaugen"
            ];

        for (let i = 0; i < 18; i++) {
            const item = document.createElement("div");
            item.className = "compliment-drop";
            item.textContent = phrases[i % phrases.length];

            const left = Math.random() * 100;
            const delay = Math.random() * 1.2;
            const duration = 4 + Math.random() * 2.8;
            const rotate = -18 + Math.random() * 36;
            const size = 0.9 + Math.random() * 0.7;

            item.style.left = `${left}%`;
            item.style.animationDelay = `${delay}s`;
            item.style.animationDuration = `${duration}s`;
            item.style.transform = `translateY(-20vh) rotate(${rotate}deg) scale(${size})`;

            shower.appendChild(item);
        }

        setTimeout(() => {
            shower.remove();
        }, 8500);
    }

    function renderEntry(entry, day) {
        const title = entry?.title || `Tag ${day}`;
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
                        <small>Jederzeit einlösbar ❤️</small>
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
                                Dein Browser unterstützt das Audio-Element nicht.
                            </audio>
                        ` : "<p>Audiodatei fehlt.</p>"}
                    </div>
                `;
                break;
                
            case "wedding-quiz-3":
                renderWeddingQuiz(entry, day);
                return;
                
            case "quiz":
                els.modalBody.innerHTML = `
                    <div class="quiz">
                        <h3>❓ ${escapeHtml(title)}</h3>
                        <p>${escapeHtml(entry.question || "")}</p>
                        <details>
                            <summary>Antwort zeigen</summary>
                            <p>${escapeHtml(entry.answer || "")}</p>
                        </details>
                    </div>
                `;
                break;

            case "compliment-shower":
                els.modalBody.innerHTML = `
                    <div class="compliment-card">
                        <p>${escapeHtml(entry.text || "Tippe und lass Komplimente regnen ❤️")}</p>
                        <button type="button" class="shower-btn" id="startShowerBtn">
                            ✨ Komplimente regnen lassen
                        </button>
                    </div>
                `;
                break;

            default:
                els.modalBody.innerHTML = `<p>${escapeHtml(entry?.text || "❤️ Etwas Wunderschönes wird noch für dich vorbereitet.")}</p>`;
        }

        els.modal.classList.remove("hidden");
        els.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");

        if (entry?.type === "compliment-shower") {
            const btn = document.getElementById("startShowerBtn");
            if (btn) {
                btn.addEventListener("click", () => {
                    launchComplimentShower(entry.compliments || []);
                });
            }
        }
    }
    function renderWeddingQuiz(entry, day) {
    const questions = entry?.questions || [];
    let currentStep = 0;
    const chosenAnswers = [];

    function renderStep() {
        const q = questions[currentStep];

        if (!q) {
            renderFinalCoupon();
            return;
        }

        els.modalTitle.textContent = entry.title || `Tag ${day}`;

        const optionsHtml = (q.options || []).map((option, index) => `
            <label class="quiz-option">
                <input type="radio" name="quiz-step" value="${escapeHtml(option)}">
                <span>${escapeHtml(option)}</span>
            </label>
        `).join("");

        els.modalBody.innerHTML = `
            <div class="quiz-3-step">
                <div class="quiz-progress">Frage ${currentStep + 1} von ${questions.length}</div>
                <h3>${escapeHtml(q.question || "")}</h3>
                <div class="quiz-options">
                    ${optionsHtml}
                </div>
                <button type="button" class="quiz-next-btn" id="quizNextBtn">
                    Antwort prüfen
                </button>
                <div class="quiz-reveal hidden" id="quizRevealBox"></div>
                <button type="button" class="quiz-next-btn hidden" id="quizContinueBtn">
                    Weiter
                </button>
            </div>
        `;

        const nextBtn = document.getElementById("quizNextBtn");
        const revealBox = document.getElementById("quizRevealBox");
        const continueBtn = document.getElementById("quizContinueBtn");

        nextBtn.addEventListener("click", () => {
            const selected = els.modalBody.querySelector('input[name="quiz-step"]:checked');

            if (!selected) {
                revealBox.classList.remove("hidden");
                revealBox.innerHTML = `<p>Bitte wähle erst eine Antwort aus 😊</p>`;
                return;
            }

            chosenAnswers.push(selected.value);

            revealBox.classList.remove("hidden");
            revealBox.innerHTML = `<p>${escapeHtml(q.reveal || "")}</p>`;

            nextBtn.classList.add("hidden");
            continueBtn.classList.remove("hidden");
        });

        continueBtn.addEventListener("click", () => {
            currentStep += 1;
            renderStep();
        });
    }

    function renderFinalCoupon() {
        els.modalTitle.textContent = entry.title || `Tag ${day}`;
        els.modalBody.innerHTML = `
            <div class="coupon final-coupon">
                <h3>🍗 ${escapeHtml(entry.couponTitle || "Winner, winner, chicken dinner!")}</h3>
                <p>${escapeHtml(entry.couponText || "1x free dinner at KFC.")}</p>
                <small>Trostpreis erfolgreich freigeschaltet ❤️</small>
            </div>
        `;
    }

    renderStep();
}
    function buildDoor(day, content) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "door";
        btn.setAttribute("aria-label", `Tag ${day} öffnen`);

        const unlockedDay = getUnlockedDay();

        if (day < unlockedDay) {
            btn.classList.add("opened");
        } else if (day === unlockedDay) {
            btn.classList.add("today");
        } else {
            btn.classList.add("locked");
        }

        btn.innerHTML = `
            <span class="door-face">
                <span class="door-number">${day}</span>
            </span>
        `;

        btn.addEventListener("click", () => {
            const currentUnlockedDay = getUnlockedDay();

            if (day > currentUnlockedDay) {
                openModal(`Tag ${day}`, "<p>🔒 Komm später wieder.</p>");
                return;
            }

            const entry = content[String(day)];

            if (!entry) {
                openModal(`Tag ${day}`, "<p>❤️ Etwas Wunderschönes wird noch für dich vorbereitet.</p>");
                return;
            }

            renderEntry(entry, day);
        });

        return btn;
    }

    function renderCalendar(content = {}) {
        els.calendar.innerHTML = "";

        for (let day = 1; day <= CONFIG.totalDays; day++) {
            els.calendar.appendChild(buildDoor(day, content));
        }
    }

    async function loadContent() {
        try {
            const res = await fetch(CONFIG.contentUrl, { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            return data && typeof data === "object" ? data : {};
        } catch (error) {
            console.error("Fehler beim Laden von content.json:", error);
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
        console.error("Unerwarteter Initialisierungsfehler:", error);
        updateCountdown();
        renderCalendar({});
    });
})();
