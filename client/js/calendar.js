/* =====================================
   THE D CUTS WORK CALENDAR
===================================== */

// Calendar Events
let events = JSON.parse(localStorage.getItem("calendarEvents")) || [];

// Elements
const grid = document.getElementById("calendarGrid");
const monthYear = document.getElementById("monthYear");

// Current Date
let date = new Date();

// =======================
// Load Calendar
// =======================

function loadCalendar() {

    grid.innerHTML = "";

    let year = date.getFullYear();
    let month = date.getMonth();

    monthYear.innerHTML = date.toLocaleString("en", {
        month: "long",
        year: "numeric"
    });

    let firstDay = new Date(year, month, 1).getDay();
    let totalDays = new Date(year, month + 1, 0).getDate();

    // Empty Boxes
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += "<div></div>";
    }

    // Calendar Days
    for (let d = 1; d <= totalDays; d++) {

        let currentDate =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        let dayEvents = events.filter(e => e.date === currentDate);

        grid.innerHTML += `

            <div class="day"
                onclick="selectDate('${currentDate}')">

                <strong>${d}</strong>

                ${dayEvents.map(e => `
                    <div class="event">
                        ${e.title}
                    </div>
                `).join("")}

            </div>

        `;
    }

}

// Load Calendar
loadCalendar();


// =======================
// Open Event Modal
// =======================

function openEventBox() {
    document.getElementById("eventModal").style.display = "flex";
}

// =======================
// Close Event Modal
// =======================

function closeEventBox() {
    document.getElementById("eventModal").style.display = "none";
}

// =======================
// Save Event
// =======================

function saveEvent() {

    let date = document.getElementById("eventDate").value;
    let title = document.getElementById("eventTitle").value;

    if (!date || !title) {
        alert("Fill details");
        return;
    }

    events.push({
        date,
        title
    });

    localStorage.setItem(
        "calendarEvents",
        JSON.stringify(events)
    );

    closeEventBox();
    loadCalendar();

}

// =======================
// Select Date
// =======================

function selectDate(date) {

    document.getElementById("eventDate").value = date;

    openEventBox();

}