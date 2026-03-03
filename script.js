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
    const filterOptions = Array.from(document.querySelectorAll(".filter-option"));
    const eventsContainer = document.getElementById("eventsContainer");
    const eventCards = Array.from(document.querySelectorAll("#eventsContainer .card"));
    const calendarBtn = document.getElementById("calendarBtn");
    const calendarPopup = document.getElementById("calendarPopup");
    const calendarGrid = document.getElementById("calendarGrid");

    // Sort events by date ascending and re-render cards in chronological order
    eventCards.sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));
    eventCards.forEach((card) => eventsContainer.appendChild(card));

    let activeFilter = "all";

    function renderVisibleEvents() {
        let shown = 0;
        eventCards.forEach((card) => {
            const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
            const shouldShow = matchesFilter && shown < 3;
            card.classList.toggle("hidden", !shouldShow);

            if (matchesFilter) {
                shown += 1;
            }
        });
    }

    renderVisibleEvents();

    // Mobile hamburger interactions
    hamburgerBtn.addEventListener("click", () => {
        const expanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
        hamburgerBtn.setAttribute("aria-expanded", String(!expanded));
        nav.classList.toggle("open");
    });

    // Workshop dropdown toggle
    workshopsToggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const expanded = workshopsToggle.getAttribute("aria-expanded") === "true";
        workshopsToggle.setAttribute("aria-expanded", String(!expanded));
        workshopFilters.classList.toggle("open", !expanded);
    });

    // Category filter for event cards
    filterOptions.forEach((option) => {
        option.addEventListener("click", (event) => {
            event.preventDefault();
            const filter = option.dataset.filter;
            activeFilter = filter;

            filterOptions.forEach((btn) => {
                const isActive = btn === option;
                btn.classList.toggle("active", isActive);
                btn.setAttribute("aria-checked", String(isActive));
            });

            renderVisibleEvents();

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

    // Calendar popup toggle
    calendarBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const opening = !calendarPopup.classList.contains("open");
        calendarPopup.classList.toggle("open", opening);
        calendarPopup.setAttribute("aria-hidden", String(!opening));
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

        if (!calendarPopup.contains(event.target) && !calendarBtn.contains(event.target)) {
            calendarPopup.classList.remove("open");
            calendarPopup.setAttribute("aria-hidden", "true");
        }
    });
});
