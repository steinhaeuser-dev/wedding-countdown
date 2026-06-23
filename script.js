function getBerlinTodayTs() {
    return toBerlinMidnightTimestamp(new Date());
}

function getDayNumber(start, today) {
    const startTs = toBerlinMidnightTimestamp(start);
    const todayTs = toBerlinMidnightTimestamp(today);

    const diff = (todayTs - startTs) / (1000 * 60 * 60 * 24);

    // IMPORTANT FIX:
    // clamp so before start date doesn't produce negative active days
    return Math.max(1, Math.floor(diff) + 1);
}

// ----------------------
// CREATE CALENDAR (FIXED)
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
            btn.disabled = false; // IMPORTANT: allow click so we can show message
        }

        btn.addEventListener("click", () => {

            const currentToday = new Date();
            const currentDiff = getDayNumber(startDate, currentToday);

            const nowIsFutureDay = day > currentDiff;

            if (nowIsFutureDay) {
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
