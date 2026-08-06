/* ==========================
   AUTH CHECK
========================== */

const role = localStorage.getItem("role");

const currentPage = window.location.pathname;

// Login page-ல் auth check வேண்டாம்
if (
    currentPage.endsWith("/login.html") ||
    currentPage.endsWith("/login")
) {
    // Nothing
} else {

    if (!role) {
        window.location.href = "/login.html";
    }

    // Employee restriction
    if (role === "employee") {

        if (
            currentPage.includes("dashboard") ||
            currentPage.includes("reports") ||
            currentPage.includes("employees") ||
            currentPage.includes("clients") ||
            currentPage.includes("settings") ||
            currentPage.includes("calendar") ||
            currentPage.endsWith("/") ||
            currentPage.endsWith("/index.html")
        ) {

            window.location.href="/pages/timesheet.html";

        }

    }

}

function logout(){

localStorage.clear();

window.location.href="/login.html";

}