console.log("💍 Wedding script loaded");

// ----------------------
// SAFE DATE SETUP
// (avoids Safari parsing issues)
// ----------------------
const weddingDate = new Date(2026, 6, 17); // July 17, 2026
const startDate = new Date(2026, 5, 24);   // June 24, 2026

// normalize time to avoid timezone off-by-one issues
weddingDate.setHours(0, 0, 0, 0);
startDate.setHours(0, 0, 0, 0);

// ----------------------
// DOM ELEMENTS
// ----------------------
const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");
const countdownEl = document.getElementById("countdown");

// HARD STOP if required elements are missing
if (!calendar || !modal || !modalTitle || !modalBody || !closeBtn) {
    throw new Error("❌ Missing required DOM elements. Script stopped.");
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
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24)
    ) + 1;

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
// MODAL HELPERS
// ----------------------
function openModal(title, body) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.remove("hidden");
}

// ----------------------
// RENDER ENTRY TYPES
// ----------------------
function renderEntry(entry, day) {

    modalTitle.textContent = entry.title || `Day ${day}`;

    switch (entry.type) {

        case "coupon":
            modalBody.innerHTML = `
                <div class="coupon">
                    <h3>🎟 ${entry.title || ""}</h3>
                    <p>${entry.text || ""}</p>
                    <small>Redeem anytime ❤️</small>
                </div>
            `;
            break;

        case "memory":
            modalBody.innerHTML = `
                <div class="memory">
                    ${entry.photo ? `<img src="${entry.photo}" alt="memory photo"/>` : ""}
                    <p>${entry.text || ""}</p>
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil(
        (weddingDate - today) / (1000 * 60 * 60 * 24)
    );

    countdownEl.textContent =
        `${diffDays} days until we get married ❤️`;
}
