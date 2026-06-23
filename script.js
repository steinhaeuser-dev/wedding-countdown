const weddingDate = new Date("2026-07-17");
const startDate = new Date("2026-06-24");

const calendar = document.getElementById("calendar");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

const closeBtn = document.getElementById("closeBtn");

closeBtn.onclick = () => {
    modal.classList.add("hidden");
};

fetch("content.json")
    .then(r => r.json())
    .then(data => createCalendar(data));

function createCalendar(content) {

    const today = new Date();

    const diff =
        Math.floor(
            (today - startDate) /
            (1000 * 60 * 60 * 24)
        ) + 1;

    for (let day = 1; day <= 24; day++) {

        const btn = document.createElement("button");

        btn.classList.add("door");

        btn.textContent = day;

        if (day < diff) {
            btn.classList.add("opened");
        }
        else if (day === diff) {
            btn.classList.add("available");
        }
        else {
            btn.classList.add("locked");
        }

        btn.onclick = () => {

            if (day > diff) {

                modalTitle.textContent = `Day ${day}`;

                modalBody.innerHTML =
                    "🔒 Come back later.";

                modal.classList.remove("hidden");

                return;
            }

const entry = content[day];

modalTitle.textContent = entry?.title || `Day ${day}`;

if (!entry) {
    modalBody.innerHTML =
        "❤️ Something beautiful is still being prepared for you.";
    modal.classList.remove("hidden");
    return;
}

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
                ${entry.photo ? `<img src="${entry.photo}" style="width:100%; border-radius:12px;" />` : ""}
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
        modalBody.innerHTML = `<p>${entry.text}</p>`;
}

modal.classList.remove("hidden");

                return;
            }

            modalTitle.textContent = entry.title;

            modalBody.innerHTML =
                `<p>${entry.text}</p>`;

            modal.classList.remove("hidden");
        };

        calendar.appendChild(btn);
    }

    updateCountdown();
}

function updateCountdown() {

    const today = new Date();

    const days =
        Math.ceil(
            (weddingDate - today) /
            (1000 * 60 * 60 * 24)
        );

    document.getElementById(
        "countdown"
    ).innerText =
        `${days} days until we get married ❤️`;
}
