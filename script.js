// Search input toggle in header
function toggleSearch() {
    document.getElementById("searchInput").classList.toggle("active");
}

// Modal handlers used by event card buttons
function openModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
    const modal = document.getElementById("registerModal");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("confirmationMessage").textContent = "";
    document.getElementById("registrationForm").reset();
}

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("mainNav");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const workshopsToggle = document.getElementById("workshopsToggle");
    const workshopFilters = document.getElementById("workshopFilters");
    const filterOptions = document.querySelectorAll(".filter-option");
    const eventCards = Array.from(document.querySelectorAll("#eventsContainer .card"));
    const calendarBtn = document.getElementById("calendarBtn");
    const calendarPopup = document.getElementById("calendarPopup");
    const calendarGrid = document.getElementById("calendarGrid");

    // Sort events by date ascending
    eventCards.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));
    eventCards.forEach((card) => document.getElementById("eventsContainer").appendChild(card));

    // Mobile hamburger interactions
    hamburgerBtn.addEventListener("click", () => {
        const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
        hamburgerBtn.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("open");
    });

    // Workshop dropdown toggle
    workshopsToggle.addEventListener("click", () => {
        const expanded = workshopsToggle.getAttribute("aria-expanded") === "true";
        workshopsToggle.setAttribute("aria-expanded", String(!expanded));
        workshopFilters.classList.toggle("open");
    });

    // Category filter for event cards
    filterOptions.forEach((option) => {
        option.addEventListener("click", () => {
            const filter = option.dataset.filter;

            filterOptions.forEach((btn) => btn.classList.remove("active"));
            option.classList.add("active");

            eventCards.forEach((card) => {
                const category = card.dataset.category;
                const shouldShow = filter === "all" || category === filter;
                card.classList.toggle("hidden", !shouldShow);
            });

            workshopFilters.classList.remove("open");
            workshopsToggle.setAttribute("aria-expanded", "false");
        });
    });

    // Build simple popup calendar and mark dates with events
    const eventDateSet = new Set(eventCards.map((card) => card.dataset.date));
    const year = 2026;
    const month = 3; // April (0-indexed)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "calendar-date";
        btn.textContent = String(day);

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (eventDateSet.has(dateStr)) {
            btn.classList.add("event-day");
            btn.setAttribute("aria-label", `${dateStr} has events`);
        } else {
            btn.setAttribute("aria-label", dateStr);
        }

        btn.addEventListener("click", () => {
            calendarGrid.querySelectorAll(".calendar-date").forEach((node) => node.classList.remove("selected"));
            btn.classList.add("selected");
        });

        calendarGrid.appendChild(btn);
    }

    calendarBtn.addEventListener("click", () => {
        calendarPopup.classList.toggle("open");
        calendarPopup.setAttribute("aria-hidden", String(!calendarPopup.classList.contains("open")));
    });

    // Form submit feedback
    document.getElementById("registrationForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        document.getElementById("confirmationMessage").textContent = `Confirmation email has been sent to ${email}!`;
    });

    // Click-outside behavior for modal, dropdown, and calendar popup
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("registerModal");

        if (event.target === modal) {
            closeModal();
        }

        if (!workshopsToggle.contains(event.target) && !workshopFilters.contains(event.target)) {
            workshopFilters.classList.remove("open");
            workshopsToggle.setAttribute("aria-expanded", "false");
        }

        if (!calendarPopup.contains(event.target) && event.target !== calendarBtn) {
            calendarPopup.classList.remove("open");
            calendarPopup.setAttribute("aria-hidden", "true");
        }
    });
});
