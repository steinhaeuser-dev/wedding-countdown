console.log("💍 Wedding script loaded");

// ----------------------
// DATE CONFIG
// ----------------------

const weddingDate = new Date(2026, 6, 17); // July 17, 2026
const startDate = new Date(2026, 5, 24);    // June 24, 2026

weddingDate.setHours(0, 0, 0, 0);
startDate.setHours(0, 0, 0, 0);

// ----------------------
// BERLIN DAY NORMALIZER
// ----------------------

function berlinParts(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    return {
        year: Number(parts.find(p => p.type === "year").value),
        month: Number(parts.find(p => p.type === "month").value),
        day: Number(parts.find(p => p.type === "day").value),
    };
}

function berlinMidnightTs(date) {
    const { year, month, day } = berlinParts(date);
    return Date.UTC(year, month - 1, day);
}

function getDayNumber(start, today) {
    const startTs = berlinMidnightTs(start);
    const todayTs = berlinMidnightTs(today);
    const diff = Math.floor((todayTs - startTs) / 86400000);
    return Math.max(1, diff + 1);
}

// ----------------------
// DOM ELEMENTS
// ----------------------

const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");
const countdownEl = document.getElementById("countdown");

if (!calendar || !modal || !modalTitle || !modalBody || !closeBtn) {
    throw new Error("❌ Missing required DOM elements");
}

// ----------------------
// CLOSE MODAL
// ----------------------

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// ----------------------
// LOAD CONTENT
// ----------------------

fetch("./content.json")
    .then(async (res) => {
        if (!res.ok) throw new Error("content.json not found");
        return await res.json();
    })
    .then(data => createCalendar(data))
    .catch(err => {
        console.error("Failed to load content:", err);
        createCalendar({});
    });

// ----------------------
// CREATE CALENDAR
// ----------------------

function createCalendar(content = {}) {
    const today = new Date();
    const diffDays = getDayNumber(startDate, today);

    calendar.innerHTML = "";

    for (let day = 1; day <= 24; day++) {
        const btn = document.createElement("button");
        btn.className = "door";

        const isPast = day < diffDays;
        const isToday = day === diffDays;

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
            const currentDiff = getDayNumber(startDate, new Date());

            if (day > currentDiff) {
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

        calendar.appendChild(btn);
    }

    updateCountdown();
}

// ----------------------
// MODAL
// ----------------------

function openModal(title, body) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.remove("hidden");
}

// ----------------------
// RENDER ENTRY
// ----------------------

function renderEntry(entry, day) {
    modalTitle.textContent = entry.title || `Day ${day}`;

    switch (entry.type) {
        case "memory":
            modalBody.innerHTML = `
                <div class="memory">
                    ${entry.photo ? `<img src="${entry.photo}" alt="memory">` : ""}
                    <p>${entry.text || ""}</p>
                </div>
            `;
            break;

        case "coupon":
            modalBody.innerHTML = `
                <div class="coupon">
                    <h3>🎟 ${entry.title || ""}</h3>
                    <p>${entry.text || ""}</p>
                    <small>Redeem anytime ❤️</small>
                </div>
            `;
            break;

        case "audio":
            modalBody.innerHTML = `
                <div class="audio">
                    <p>${entry.text || ""}</p>
                    <audio controls>
                        <source src="${entry.audio}" type="audio/mpeg">
                    </audio>
                </div>
            `;
            break;

        case "quiz":
            modalBody.innerHTML = `
                <div class="quiz">
                    <h3>❓ ${entry.title || ""}</h3>
                    <p>${entry.question || ""}</p>
                    <details>
                        <summary>Reveal answer</summary>
                        <p>${entry.answer || ""}</p>
                    </details>
                </div>
            `;
            break;

        default:
            modalBody.innerHTML = `<p>${entry.text || ""}</p>`;
    }

    modal.classList.remove("hidden");
}

// ----------------------
// COUNTDOWN
// ----------------------

function updateCountdown() {
    if (!countdownEl) return;

    const todayTs = berlinMidnightTs(new Date());
    const weddingTs = berlinMidnightTs(weddingDate);
    const diffDays = Math.ceil((weddingTs - todayTs) / 86400000);

    countdownEl.textContent = `${diffDays} days until we get married ❤️`;
}console.log("💍 Wedding script loaded");

// ----------------------
// DATE CONFIG
// ----------------------

// JS months are 0-based: June = 5, July = 6
const weddingDate = new Date(2026, 6, 17); // July 17, 2026
const startDate = new Date(2026, 5, 24);    // June 24, 2026

weddingDate.setHours(0, 0, 0, 0);
startDate.setHours(0, 0, 0, 0);

// ----------------------
// BERLIN DAY NORMALIZER
// ----------------------

function toBerlinDateParts(date) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    return {
        year: Number(parts.find(p => p.type === "year").value),
        month: Number(parts.find(p => p.type === "month").value),
        day: Number(parts.find(p => p.type === "day").value),
    };
}

function toBerlinMidnightTimestamp(date) {
    const { year, month, day } = toBerlinDateParts(date);
    return Date.UTC(year, month - 1, day);
}

function getDayNumber(start, today) {
    const startTs = toBerlinMidnightTimestamp(start);
    const todayTs = toBerlinMidnightTimestamp(today);

    const diff = Math.floor((todayTs - startTs) / (1000 * 60 * 60 * 24));

    // Before or on the start date, show day 1
    if (diff <= 0) return 1;

    return diff + 1;
}

// ----------------------
// DOM ELEMENTS
// ----------------------

const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");
const countdownEl = document.getElementById("countdown");

if (!calendar || !modal || !modalTitle || !modalBody || !closeBtn) {
    throw new Error("❌ Missing required DOM elements");
}

// ----------------------
// CLOSE MODAL
// ----------------------

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// ----------------------
// LOAD CONTENT
// ----------------------

fetch("./content.json")
    .then(res => {
        if (!res.ok) throw new Error("content.json not found");
        return res.json();
    })
    .then(data => createCalendar(data))
    .catch(err => {
        console.error("Failed to load content:", err);
        createCalendar({});
    });

// ----------------------
// CREATE CALENDAR
// ----------------------

function createCalendar(content = {}) {
    const today = new Date();
    const diffDays = getDayNumber(startDate, today);

    calendar.innerHTML = "";

    for (let day = 1; day <= 24; day++) {
        const btn = document.createElement("button");
        btn.className = "door";

        const isPast = day < diffDays;
        const isToday = day === diffDays;

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
            const currentDiff = getDayNumber(startDate, new Date());

            if (day > currentDiff) {
                openModal(`Day ${day}`, "🔒 Come back later.");
                return;
            }

            const entry = content[String(day)];

            if (!entry) {
                openModal(
                    `Day ${day}`,
                    "❤️ Something beautiful is still being prepared for you."
                );
                return;
            }

            renderEntry(entry, day);
        });

        calendar.appendChild(btn);
    }

    updateCountdown();
}

// ----------------------
// MODAL
// ----------------------

function openModal(title, body) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.remove("hidden");
}

// ----------------------
// RENDER ENTRY
// ----------------------

function renderEntry(entry, day) {
    modalTitle.textContent = entry.title || `Day ${day}`;

    switch (entry.type) {
        case "memory":
            modalBody.innerHTML = `
                <div class="memory">
                    ${entry.photo ? `<img src="${entry.photo}" alt="memory"/>` : ""}
                    <p>${entry.text || ""}</p>
                </div>
            `;
            break;

        case "coupon":
            modalBody.innerHTML = `
                <div class="coupon">
                    <h3>🎟 ${entry.title || ""}</h3>
                    <p>${entry.text || ""}</p>
                    <small>Redeem anytime ❤️</small>
                </div>
            `;
            break;

        case "audio":
            modalBody.innerHTML = `
                <div class="audio">
                    <p>${entry.text || ""}</p>
                    <audio controls>
                        <source src="${entry.audio}" type="audio/mpeg">
                    </audio>
                </div>
            `;
            break;

        case "quiz":
            modalBody.innerHTML = `
                <div class="quiz">
                    <h3>❓ ${entry.title || ""}</h3>
                    <p>${entry.question || ""}</p>
                    <details>
                        <summary>Reveal answer</summary>
                        <p>${entry.answer || ""}</p>
                    </details>
                </div>
            `;
            break;

        default:
            modalBody.innerHTML = `<p>${entry.text || ""}</p>`;
    }

    modal.classList.remove("hidden");
}

// ----------------------
// COUNTDOWN
// ----------------------

function updateCountdown() {
    if (!countdownEl) return;

    const todayTs = toBerlinMidnightTimestamp(new Date());
    const weddingTs = toBerlinMidnightTimestamp(weddingDate);

    const diffDays = Math.ceil((weddingTs - todayTs) / (1000 * 60 * 60 * 24));

    countdownEl.textContent = `${diffDays} days until we get married ❤️`;
}
