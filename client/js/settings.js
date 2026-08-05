/* ==========================================
   THE D CUTS SETTINGS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // Admin Only
    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!user || user.role !== "admin") {

        alert("Access Denied");

        window.location.href = "home.html";

        return;

    }

    loadSettings();

});

/* ==========================================
   MENU NAVIGATION
========================================== */

function showSection(sectionId) {

    document
        .querySelectorAll(".settings-card")
        .forEach(card => card.classList.add("hidden"));

    document
        .getElementById(sectionId)
        .classList.remove("hidden");

    document
        .querySelectorAll(".settings-sidebar li")
        .forEach(li => li.classList.remove("active"));

    event.target.classList.add("active");

}

/* ==========================================
   LOAD SETTINGS
========================================== */

function loadSettings() {

    document.getElementById("adminName").value =
        localStorage.getItem("adminName") || "Sathish Kumar";

    document.getElementById("adminEmail").value =
        localStorage.getItem("adminEmail") || "dcutsdigitalsolutions@gmail.com";

    document.getElementById("companyName").value =
        localStorage.getItem("companyName") || "THE D CUTS";

    document.getElementById("companyPhone").value =
        localStorage.getItem("companyPhone") || "";

    document.getElementById("companyEmail").value =
        localStorage.getItem("companyEmail") || "";

    document.getElementById("companyAddress").value =
        localStorage.getItem("companyAddress") || "";

}

/* ==========================================
   PROFILE SAVE
========================================== */

function saveProfile() {

    localStorage.setItem(
        "adminName",
        document.getElementById("adminName").value
    );

    localStorage.setItem(
        "adminEmail",
        document.getElementById("adminEmail").value
    );

    alert("Profile Updated Successfully ✅");

}

/* ==========================================
   COMPANY SAVE
========================================== */

function saveCompany() {

    localStorage.setItem(
        "companyName",
        document.getElementById("companyName").value
    );

    localStorage.setItem(
        "companyPhone",
        document.getElementById("companyPhone").value
    );

    localStorage.setItem(
        "companyEmail",
        document.getElementById("companyEmail").value
    );

    localStorage.setItem(
        "companyAddress",
        document.getElementById("companyAddress").value
    );

    alert("Company Settings Saved ✅");

}

/* ==========================================
   PLACEHOLDER FUNCTIONS
========================================== */

function addEmployee() {

    alert("Employee Module - Coming Soon");

}

function addProject() {

    alert("Project Module - Coming Soon");

}

function addClient() {

    alert("Client Module - Coming Soon");

}

function changePassword() {

    alert("Password Module - Coming Soon");

}

function backupData() {

    alert("Backup Created Successfully");

}

function restoreData() {

    alert("Restore Completed");

}