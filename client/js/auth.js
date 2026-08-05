/* ==========================================
AUTH CHECK
========================================== */

const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

if (!loggedUser) {

    window.location.href = "../pages/login.html";

}


/* ==========================================
LOGOUT
========================================== */

function logout() {

    if (confirm("Logout?")) {

        localStorage.removeItem("loggedUser");

        window.location.href = "../pages/login.html";

    }

}
// ==============================
// AUTH CHECK
// ==============================

const role = localStorage.getItem("role");

// Login இல்லையெனில் Login Page
if (!role) {
    window.location.replace("../login.html");
}

// Employee Restriction
const page = window.location.pathname;

if (role === "employee") {

    if (
        page.includes("dashboard.html") ||
        page.includes("reports.html") ||
        page.includes("employees.html") ||
        page.includes("clients.html") ||
        page.includes("settings.html") ||
        page.includes("calendar.html") ||
        page.includes("index.html")
    ) {
        window.location.replace("timesheet.html");
    }
}