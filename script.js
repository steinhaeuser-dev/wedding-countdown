console.log("💍 Hochzeitsskript geladen");

(() => {
    "use strict";

    const CONFIG = {
        timeZone: "Europe/Berlin",
        totalDays: 24,
        firstOpenDate: { year: 2026, month: 6, day: 23 },
        weddingDate: { year: 2026, month: 7, day: 17 },
        contentUrl: "./content.json?v=20260626-1"
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

    let lastFocusedDoor = null;

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

        return Math.max(0, Math.min(CONFIG.totalDays, diffDays + 1));
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

        if (daysLeft === 0) {
            els.countdown.textContent = "Heute heiraten wir ❤️";
            return;
        }

        if (daysLeft === 1) {
            els.countdown.textContent = "Noch 1 Tag bis wir heiraten ❤️";
            return;
        }

        els.countdown.textContent = `Noch ${daysLeft} Tage bis wir heiraten ❤️`;
    }

    function showModal() {
        els.modal.classList.remove("hidden");
        els.modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("no-scroll");

        window.setTimeout(() => {
            els.closeBtn.focus();
        }, 0);
    }

    function openModal(title, html) {
        els.modalTitle.textContent = title;
        els.modalBody.innerHTML = html;
        showModal();
    }

    function closeModal() {
        els.modal.classList.add("hidden");
        els.modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("no-scroll");

        const playingAudio = els.modalBody.querySelector("audio");
        if (playingAudio) {
            playingAudio.pause();
        }

        if (lastFocusedDoor) {
            lastFocusedDoor.focus();
        }
    }

    function launchComplimentShower(compliments = []) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (reducedMotion) {
            openModal("Komplimente ✨", "<p>✨ Du wirst sehr geliebt. ❤️</p>");
            return;
        }

        const shower = document.createElement("div");
        shower.className = "compliment-shower";
        document.body.appendChild(shower);

        const phrases = compliments.length
            ? compliments
            : [
                "Du bist wundervoll.",
                "Du machst alles schöner.",
                "Du bist mein Zuhause.",
                "Ich liebe dich.",
                "Du bist großartig.",
                "Dein Lächeln ist bezaubernd."
            ];

        for (let i = 0; i < 22; i++) {
            const item = document.createElement("div");
            item.className = "compliment-drop";
            item.textContent = phrases[i % phrases.length];

            const left = Math.random() * 100;
            const delay = Math.random() * 1.2;
            const duration = 4 + Math.random() * 2.8;
            const rotate = -18 + Math.random() * 36;
            const size = 0.88 + Math.random() * 0.7;

            item.style.left = `${left}%`;
            item.style.animationDelay = `${delay}s`;
            item.style.animationDuration = `${duration}s`;
            item.style.setProperty("--drop-rotate", `${rotate}deg`);
            item.style.setProperty("--drop-scale", size);

            shower.appendChild(item);
        }

        setTimeout(() => {
            shower.remove();
        }, 8800);
    }

    function renderEntry(entry, day) {
        const title = entry?.title || `Tag ${day}`;
        els.modalTitle.textContent = title;

        switch (entry?.type) {
            case "memory":
                els.modalBody.innerHTML = `
                    <div class="memory">
                        ${entry.text ? `<p class="memory-intro">${escapeHtml(entry.text)}</p>` : ""}
                        ${entry.photo ? `
                            <img 
                                src="${escapeHtml(entry.photo)}" 
                                alt="${escapeHtml(entry.photoAlt || title)}"
                                loading="lazy"
                            >
                        ` : ""}
                        ${entry.extraText ? `<p class="memory-extra">${escapeHtml(entry.extraText)}</p>` : ""}
                    </div>
                `;
                break;

            case "coupon":
                els.modalBody.innerHTML = `
                    <div class="coupon">
                        <div class="coupon-ticket-edge" aria-hidden="true"></div>
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
                                <source src="${escapeHtml(entry.audio)}" type="audio/mpeg">
                                Dein Browser unterstützt das Audio-Element nicht.
                            </audio>
                        ` : "<p>Audiodatei fehlt.</p>"}
                    </div>
                `;
                break;

            case "wedding-quiz-3":
                renderWeddingQuiz(entry, day);
                showModal();
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
                        <button type="button" class="primary-btn shower-btn" id="startShowerBtn">
                            ✨ Komplimente regnen lassen
                        </button>
                    </div>
                `;
                break;

            default:
                els.modalBody.innerHTML = `
                    <p>${escapeHtml(entry?.text || "❤️ Etwas Wunderschönes wird noch für dich vorbereitet.")}</p>
                `;
        }

        showModal();

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
        const questions = Array.isArray(entry?.questions) ? entry.questions : [];
        let currentStep = 0;

        function renderStep() {
            const q = questions[currentStep];

            if (!q) {
                renderFinalCoupon();
                return;
            }

            els.modalTitle.textContent = entry.title || `Tag ${day}`;

            const optionsHtml = (q.options || []).map(option => `
                <label class="quiz-option">
                    <input type="radio" name="quiz-step" value="${escapeHtml(option)}">
                    <span>${escapeHtml(option)}</span>
                </label>
            `).join("");

            els.modalBody.innerHTML = `
                <div class="quiz-3-step">
                    <div class="quiz-progress">
                        <span>Frage ${currentStep + 1} von ${questions.length}</span>
                        <div class="quiz-progress-bar" aria-hidden="true">
                            <div style="width: ${((currentStep + 1) / questions.length) * 100}%"></div>
                        </div>
                    </div>

                    <h3>${escapeHtml(q.question || "")}</h3>

                    <div class="quiz-options">
                        ${optionsHtml}
                    </div>

                    <button type="button" class="primary-btn quiz-next-btn" id="quizNextBtn">
                        Antwort prüfen
                    </button>

                    <div class="quiz-reveal hidden" id="quizRevealBox"></div>

                    <button type="button" class="primary-btn quiz-next-btn hidden" id="quizContinueBtn">
                        ${currentStep + 1 >= questions.length ? "Trostpreis anzeigen" : "Weiter"}
                    </button>
                </div>
            `;

            const nextBtn = document.getElementById("quizNextBtn");
            const revealBox = document.getElementById("quizRevealBox");
            const continueBtn = document.getElementById("quizContinueBtn");

            if (!nextBtn || !revealBox || !continueBtn) {
                console.error("Quiz-Elemente konnten nicht erstellt werden.");
                return;
            }

            nextBtn.addEventListener("click", () => {
                const selected = els.modalBody.querySelector('input[name="quiz-step"]:checked');

                if (!selected) {
                    revealBox.classList.remove("hidden");
                    revealBox.innerHTML = "<p>Bitte wähle erst eine Antwort aus 😊</p>";
                    return;
                }

                revealBox.classList.remove("hidden");
                revealBox.innerHTML = `<p>${escapeHtml(q.reveal || "")}</p>`;

                nextBtn.classList.add("hidden");
                continueBtn.classList.remove("hidden");

                const allOptions = els.modalBody.querySelectorAll('input[name="quiz-step"]');
                allOptions.forEach(input => {
                    input.disabled = true;
                });
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
                    <div class="coupon-ticket-edge" aria-hidden="true"></div>
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
            btn.setAttribute("aria-label", `Tag ${day} ist noch verschlossen`);
        }

        btn.innerHTML = `
            <span class="door-face">
                <span class="door-number">${day}</span>
                <span class="door-heart" aria-hidden="true">♡</span>
            </span>
        `;

        btn.addEventListener("click", () => {
            lastFocusedDoor = btn;

            const currentUnlockedDay = getUnlockedDay();

            if (day > currentUnlockedDay) {
                openModal(`Tag ${day}`, "<p class=\"locked-note\">🔒 Dieses Türchen öffnet sich später.</p>");
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

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const data = await res.json();

            return data && typeof data === "object" ? data : {};
        } catch (error) {
            console.error("Fehler beim Laden von content.json:", error);
            return {};
        }
    }

    function bindEvents() {
        els.closeBtn.addEventListener("click", closeModal);

        els.modal.addEventListener("click", event => {
            if (event.target === els.modal) {
                closeModal();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !els.modal.classList.contains("hidden")) {
                closeModal();
            }
        });
    }

    async function init() {
        bindEvents();
        updateCountdown();

        renderCalendar({});

        const content = await loadContent();
        renderCalendar(content);

        updateCountdown();

        setInterval(updateCountdown, 60 * 1000);
        setInterval(() => renderCalendar(content), 60 * 1000);
    }

    init().catch(error => {
        console.error("Unerwarteter Initialisierungsfehler:", error);
        updateCountdown();
        renderCalendar({});
    });
})();
