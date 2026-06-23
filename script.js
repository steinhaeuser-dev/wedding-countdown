console.log("💍 Wedding script loaded");

// ----------------------
// SAFE DATE SETUP (NO TIMEZONE BUGS)
// ----------------------

// IMPORTANT: JS months are 0-based (June = 5, July = 6)
const weddingDate = new Date(2026, 6, 17); // July 17, 2026
const startDate = new Date(2026, 5, 24);   // June 24, 2026

weddingDate.setHours(0, 0, 0, 0);
startDate.setHours(0, 0, 0, 0);

// ----------------------
// BERLIN TIME HELPERS (CRITICAL FIX)
// ----------------------

// Converts any date into a stable Berlin calendar day string (YYYY-MM-DD)
function toBerlinDayString(date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Berlin",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
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

// HARD STOP if something is missing
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
// DAY CALCULATION (BERLIN SAFE)
// ----------------------
function getDayNumber(start, today) {
    const startStr = toBerlinDayString(start);
    const todayStr = toBerlinDayString(today);

    const startDateObj = new Date(startStr);
    const todayDateObj = new Date(todayStr);

    const diff = Math.round((todayDateObj - startDateObj) / (1000 * 60 * 60 * 24));

    return diff + 1; // Day 1 = start date
}

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
        const isFuture = day > diffDays;

        if (isPast) {
            btn.classList.add("opened");
            btn.innerHTML = `<span>${day} ✔</span>`;
        } else if (isToday) {
            btn.classList.add("today");
            btn.innerHTML = `<span>${day} ✨</span>`;
        } else {
            btn.classList.add("locked");
            btn.innerHTML = `<span>${day}</span>`;
            btn.disabled = true;
        }

        btn.addEventListener("click", () => {

            if (isFuture) {
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
// COUNTDOWN (BERLIN SAFE)
// ----------------------
function updateCountdown() {

    if (!countdownEl) return;

    const today = new Date();
    const todayStr = toBerlinDayString(today);
    const weddingStr = toBerlinDayString(weddingDate);

    const todayDate = new Date(todayStr);
    const wedding = new Date(weddingStr);

    const diffDays = Math.ceil((wedding - todayDate) / (1000 * 60 * 60 * 24));

    countdownEl.textContent =
        `${diffDays} days until we get married ❤️`;
}
