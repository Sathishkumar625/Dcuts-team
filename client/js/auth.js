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