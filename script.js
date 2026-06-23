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

            if (!entry) {

                modalTitle.textContent = `Day ${day}`;

                modalBody.innerHTML =
                    "❤️ A surprise is still being prepared.";

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