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

/**
 * Calendar feature module.
 * Keeps all calendar behavior scoped and independent from other UI controls.
 */
function createCalendarModule(config) {
    const {
        calendarBtn,
        calendarPopup,
        calendarGrid,
        calendarMonthLabel,
        calendarPreview,
        prevMonthBtn,
        nextMonthBtn,
        eventCards
    } = config;

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const eventsByDate = extractEvents(eventCards);
    const eventDates = Array.from(eventsByDate.keys()).sort();

    const initialDate = eventDates.length > 0 ? new Date(`${eventDates[0]}T00:00:00`) : new Date();
    let currentMonth = initialDate.getMonth();
    let currentYear = initialDate.getFullYear();
    let focusedDate = new Date(currentYear, currentMonth, 1);
    let selectedDateKey = "";

    function extractEvents(cards) {
        const eventMap = new Map();

        cards.forEach((card) => {
            const body = card.querySelector(".card-body");
            if (!body) return;

            const title = body.querySelector("h3")?.textContent.trim() || "Untitled Event";
            const details = Array.from(body.querySelectorAll("p"));
            const rawDateText = details[0]?.textContent.trim() || "";
            const infoLine = details[1]?.textContent.trim() || "";

            const parsedDate = parseDateText(rawDateText, card.dataset.date);
            if (!parsedDate) return;

            const { time, location } = parseInfoLine(infoLine);
            const dateKey = formatDateKey(parsedDate);

            const eventItem = {
                date: dateKey,
                title,
                time,
                location
            };

            if (!eventMap.has(dateKey)) {
                eventMap.set(dateKey, []);
            }
            eventMap.get(dateKey).push(eventItem);
        });

        return eventMap;
    }

    function parseDateText(rawText, fallbackIso) {
        const parsed = new Date(rawText);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed;
        }

        if (fallbackIso) {
            const fallbackDate = new Date(`${fallbackIso}T00:00:00`);
            if (!Number.isNaN(fallbackDate.getTime())) {
                return fallbackDate;
            }
        }

        return null;
    }

    function parseInfoLine(line) {
        if (!line) {
            return { time: "TBA", location: "Location TBA" };
        }

        const timeMatch = line.match(/(\b\d{1,2}:\d{2}\s?(?:AM|PM)\b)/i);
        const time = timeMatch ? timeMatch[0].replace(/\s+/g, " ").toUpperCase() : "TBA";

        const location = line.includes("•")
            ? line.split("•").slice(1).join("•").trim() || "Location TBA"
            : timeMatch
                ? line.replace(timeMatch[0], "").replace(/[•\-–]/g, "").trim() || "Location TBA"
                : line;

        return { time, location };
    }

    function formatDateKey(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, "0");
        const d = String(dateObj.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    function getMonthMeta(year, month) {
        const firstDate = new Date(year, month, 1);
        const firstDayIndex = (firstDate.getDay() + 6) % 7;
        const totalDays = new Date(year, month + 1, 0).getDate();
        return { firstDayIndex, totalDays };
    }

    function renderCalendar(withTransition = false) {
        const { firstDayIndex, totalDays } = getMonthMeta(currentYear, currentMonth);

        calendarMonthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        calendarGrid.innerHTML = "";

        if (withTransition) {
            calendarGrid.classList.add("is-changing");
            window.setTimeout(() => {
                calendarGrid.classList.remove("is-changing");
            }, 180);
        }

        for (let i = 0; i < firstDayIndex; i += 1) {
            const spacer = document.createElement("span");
            spacer.className = "calendar-spacer";
            spacer.setAttribute("aria-hidden", "true");
            calendarGrid.appendChild(spacer);
        }

        for (let day = 1; day <= totalDays; day += 1) {
            const dateObj = new Date(currentYear, currentMonth, day);
            const dateKey = formatDateKey(dateObj);
            const events = eventsByDate.get(dateKey) || [];

            const button = document.createElement("button");
            button.type = "button";
            button.className = "calendar-date";
            button.dataset.date = dateKey;
            button.setAttribute("tabindex", dateObj.getTime() === focusedDate.getTime() ? "0" : "-1");
            button.setAttribute("aria-label", `${dateKey}${events.length ? `, ${events.length} event${events.length > 1 ? "s" : ""}` : ", no events"}`);

            const dayLabel = document.createElement("span");
            dayLabel.className = "day-number";
            dayLabel.textContent = String(day);
            button.appendChild(dayLabel);

            if (events.length > 0) {
                button.classList.add("has-event");
                button.dataset.eventsCount = String(events.length);
                button.title = `${events.length} Event${events.length > 1 ? "s" : ""}`;

                const dot = document.createElement("span");
                dot.className = "event-dot";
                dot.setAttribute("aria-hidden", "true");
                button.appendChild(dot);
            }

            if (dateKey === selectedDateKey) {
                button.classList.add("selected");
            }

            button.addEventListener("click", () => {
                selectDate(dateObj);
            });

            button.addEventListener("focus", () => {
                focusedDate = dateObj;
            });

            calendarGrid.appendChild(button);
        }
    }

    function renderPreview(dateKey) {
        const events = eventsByDate.get(dateKey) || [];

        if (events.length === 0) {
            calendarPreview.innerHTML = '<p class="empty-state">No events scheduled.</p>';
            calendarPreview.classList.add("visible");
            return;
        }

        const cardsMarkup = events
            .map((eventItem) => `
                <article class="preview-event-item">
                    <h5>${eventItem.title}</h5>
                    <p><strong>Time:</strong> ${eventItem.time}</p>
                    <p><strong>Location:</strong> ${eventItem.location}</p>
                </article>
            `)
            .join("");

        calendarPreview.innerHTML = `
            <div class="preview-heading">${events.length} Event${events.length > 1 ? "s" : ""}</div>
            <div class="preview-list">${cardsMarkup}</div>
        `;

        calendarPreview.classList.add("visible");
    }

    function selectDate(dateObj) {
        selectedDateKey = formatDateKey(dateObj);
        focusedDate = dateObj;
        renderCalendar();
        renderPreview(selectedDateKey);

        const selectedBtn = calendarGrid.querySelector(`.calendar-date[data-date="${selectedDateKey}"]`);
        if (selectedBtn) {
            selectedBtn.focus();
        }
    }

    function shiftFocusByDays(step) {
        const nextDate = new Date(focusedDate);
        nextDate.setDate(nextDate.getDate() + step);
        focusedDate = nextDate;

        if (
            nextDate.getMonth() !== currentMonth ||
            nextDate.getFullYear() !== currentYear
        ) {
            currentMonth = nextDate.getMonth();
            currentYear = nextDate.getFullYear();
            renderCalendar(true);
        }

        const focusKey = formatDateKey(nextDate);
        const btn = calendarGrid.querySelector(`.calendar-date[data-date="${focusKey}"]`);
        if (btn) {
            calendarGrid.querySelectorAll(".calendar-date").forEach((node) => node.setAttribute("tabindex", "-1"));
            btn.setAttribute("tabindex", "0");
            btn.focus();
        }
    }

    function changeMonth(step) {
        currentMonth += step;

        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        }

        focusedDate = new Date(currentYear, currentMonth, 1);
        renderCalendar(true);
    }

    function toggleCalendar(forceOpen) {
        const shouldOpen = typeof forceOpen === "boolean"
            ? forceOpen
            : !calendarPopup.classList.contains("open");

        calendarPopup.classList.toggle("open", shouldOpen);
        calendarPopup.setAttribute("aria-hidden", String(!shouldOpen));
        calendarBtn.setAttribute("aria-expanded", String(shouldOpen));
        document.body.classList.toggle("calendar-open", shouldOpen);

        if (shouldOpen) {
            renderCalendar();
        } else {
            calendarPreview.classList.remove("visible");
            calendarPreview.innerHTML = '<p class="empty-state">Select a date to view event details.</p>';
        }
    }

    function initialize() {
        renderCalendar();

        calendarBtn.setAttribute("aria-expanded", "false");

        calendarBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleCalendar();
        });

        prevMonthBtn.addEventListener("click", (event) => {
            event.preventDefault();
            changeMonth(-1);
        });

        nextMonthBtn.addEventListener("click", (event) => {
            event.preventDefault();
            changeMonth(1);
        });

        calendarPopup.addEventListener("keydown", (event) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                shiftFocusByDays(-1);
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                shiftFocusByDays(1);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                shiftFocusByDays(-7);
            } else if (event.key === "ArrowDown") {
                event.preventDefault();
                shiftFocusByDays(7);
            } else if (event.key === "Enter") {
                event.preventDefault();
                selectDate(focusedDate);
            } else if (event.key === "Escape") {
                toggleCalendar(false);
            }
        });

        return {
            close: () => toggleCalendar(false),
            isOpen: () => calendarPopup.classList.contains("open")
        };
    }

    return {
        initialize
    };
}

document.addEventListener("DOMContentLoaded", () => {
    const nav = document.getElementById("mainNav");
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const workshopsToggle = document.getElementById("workshopsToggle");
    const workshopFilters = document.getElementById("workshopFilters");
    const filterOptions = Array.from(document.querySelectorAll(".filter-option"));
    const eventsContainer = document.getElementById("eventsContainer");
    const eventCards = Array.from(document.querySelectorAll("#eventsContainer .card"));

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

    // Initialize dynamic calendar system
    const calendarModule = createCalendarModule({
        calendarBtn: document.getElementById("calendarBtn"),
        calendarPopup: document.getElementById("calendarPopup"),
        calendarGrid: document.getElementById("calendarGrid"),
        calendarMonthLabel: document.getElementById("calendarMonthLabel"),
        calendarPreview: document.getElementById("calendarPreview"),
        prevMonthBtn: document.getElementById("prevMonthBtn"),
        nextMonthBtn: document.getElementById("nextMonthBtn"),
        eventCards
    }).initialize();

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

        const calendarPopup = document.getElementById("calendarPopup");
        const calendarBtn = document.getElementById("calendarBtn");
        if (
            calendarModule.isOpen() &&
            !calendarPopup.contains(event.target) &&
            !calendarBtn.contains(event.target)
        ) {
            calendarModule.close();
        }
    });
});
