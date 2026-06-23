console.log("💍 Wedding script loaded");

const weddingDate = new Date("2026-07-17");
const startDate = new Date("2026-06-24");

const calendar = document.getElementById("calendar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const closeBtn = document.getElementById("closeBtn");

// safety checks (VERY important for mobile)
if (!calendar || !modal || !modalTitle || !modalBody || !closeBtn) {
    console.error("❌ Missing DOM elements. Script stopped.");
}

// close modal safely
closeBtn?.addEventListener("click", () => {
    modal.classList.add("hidden");
});

// load content
fetch("./content.json")
    .then(r => {
        if (!r.ok) throw new Error("content.json not found");
        return r.json();
    })
    .then(data => createCalendar(data))
    .catch(err => {
        console.error("Failed to load content:", err);
        createCalendar({});
    });

function createCalendar(content = {}) {

    const today = new Date();

    const diff = Math.floor(
        (today - startDate) / (1000 * 60 * 60 * 24)
    ) + 1;

    calendar.innerHTML = "";

    for (let day = 1; day <= 24; day++) {

        const btn = document.createElement("button");
        btn.classList.add("door");

        // --- state ---
        if (day < diff) {
            btn.classList.add("opened");
            btn.innerHTML = `<span>${day} ✔</span>`;
        }
        else if (day === diff) {
            btn.classList.add("today");
            btn.innerHTML = `<span>${day} ✨</span>`;
        }
        else {
            btn.classList.add("locked");
            btn.innerHTML = `<span>${day}</span>`;
        }

        // --- click ---
        btn.addEventListener("click", () => {

            const entry = content[day];

            if (day > diff) {
                openModal(`Day ${day}`, "🔒 Come back later.");
                return;
            }

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

// modal helper
function openModal(title, body) {
    modalTitle.textContent = title;
    modalBody.innerHTML = body;
    modal.classList.remove("hidden");
}

// render content types
function renderEntry(entry, day) {

    modalTitle.textContent = entry.title || `Day ${day}`;

    switch (entry.type) {

        case "coupon":
            modalBody.innerHTML = `
                <div class="coupon">
                    <h3>🎟 ${entry.title}</h3>
                    <p>${entry.text}</p>
                    <small>Redeem anytime ❤️</small>
                </div>
            `;
            break;

        case "memory":
            modalBody.innerHTML = `
                <div class="memory">
                    ${entry.photo ? `<img src="${entry.photo}" />` : ""}
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
                    <h3>❓ ${entry.title}</h3>
                    <p>${entry.question}</p>
                    <details>
                        <summary>Reveal answer</summary>
                        <p>${entry.answer}</p>
                    </details>
                </div>
            `;
            break;

        default:
            modalBody.innerHTML = `<p>${entry.text || ""}</p>`;
    }

    modal.classList.remove("hidden");
}

// countdown
function updateCountdown() {

    const today = new Date();

    const days = Math.ceil(
        (weddingDate - today) / (1000 * 60 * 60 * 24)
    );

    const el = document.getElementById("countdown");

    if (el) {
        el.innerText = `${days} days until we get married ❤️`;
    }
}
