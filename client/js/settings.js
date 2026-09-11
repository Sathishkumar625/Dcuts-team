/* =========================================================
   THE D CUTS — SETTINGS SYSTEM
========================================================= */

const API = "/api";


/* =========================================================
   BASIC HELPERS
========================================================= */

function getToken() {
    return localStorage.getItem("token") || "";
}


function getLoggedUser() {

    try {

        return JSON.parse(
            localStorage.getItem("loggedUser") || "null"
        );

    } catch (error) {

        return null;

    }

}


function authHeaders() {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
}


function safeParse(value, fallback = null) {

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function normalizeRole(value) {

    return String(value || "")
        .trim()
        .toLowerCase();

}


/* =========================================================
   ADMIN CHECK
========================================================= */

function isAdminUser() {

    const loggedUser = getLoggedUser();

    const roleFromUser = normalizeRole(
        loggedUser?.role
    );

    const roleFromStorage = normalizeRole(
        localStorage.getItem("role")
    );

    return (
        roleFromUser === "admin" ||
        roleFromUser === "administrator" ||
        roleFromStorage === "admin" ||
        roleFromStorage === "administrator"
    );

}


/* =========================================================
   TOAST
========================================================= */

function ensureToastContainer() {

    let container =
        document.getElementById("toastContainer");

    if (!container) {

        container = document.createElement("div");

        container.id = "toastContainer";

        container.className = "toast-container";

        document.body.appendChild(container);

    }

    return container;

}


function showToast(
    message,
    type = "info"
) {

    const container =
        ensureToastContainer();

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    let icon = "ⓘ";

    if (type === "success") {
        icon = "✓";
    }

    if (type === "error") {
        icon = "!";
    }

    toast.innerHTML = `
        <div class="toast-icon">
            ${icon}
        </div>

        <div class="toast-message">
            ${escapeHTML(message)}
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {

        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";

        setTimeout(() => {

            toast.remove();

        }, 250);

    }, 3000);

}


/* =========================================================
   BUTTON LOADING
========================================================= */

function setButtonLoading(
    button,
    loading,
    loadingText = "Saving..."
) {

    if (!button) {
        return;
    }

    if (loading) {

        if (!button.dataset.originalText) {
            button.dataset.originalText =
                button.innerHTML;
        }

        button.disabled = true;

        button.innerHTML = `
            <span class="button-spinner"></span>
            ${escapeHTML(loadingText)}
        `;

    } else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.innerHTML =
                button.dataset.originalText;

            delete button.dataset.originalText;

        }

    }

}


/* =========================================================
   MOBILE SIDEBAR
========================================================= */

function toggleSettingsSidebar() {

    const sidebar =
        document.getElementById("settingsSidebar");

    const overlay =
        document.getElementById("settingsOverlay");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("open");

    if (overlay) {

        overlay.classList.toggle(
            "active",
            sidebar.classList.contains("open")
        );

    }

}


function closeSettingsSidebar() {

    const sidebar =
        document.getElementById("settingsSidebar");

    const overlay =
        document.getElementById("settingsOverlay");

    sidebar?.classList.remove("open");

    overlay?.classList.remove("active");

}


/* =========================================================
   SECTION NAVIGATION
========================================================= */

function showSection(section) {

    const cards =
        document.querySelectorAll(
            "[data-section-content]"
        );

    cards.forEach(card => {

        const cardSection =
            card.dataset.sectionContent;

        card.classList.toggle(
            "hidden",
            cardSection !== section
        );

    });


    const menuItems =
        document.querySelectorAll(
            ".settings-menu-item"
        );

    menuItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === section
        );

    });


    closeSettingsSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   API REQUEST
========================================================= */

async function updateSettingsOnServer(settings) {

    const response = await fetch(
        `${API}/settings`,
        {
            method: "PUT",

            headers: authHeaders(),

            body: JSON.stringify(settings)
        }
    );


    const data =
        await response.json()
            .catch(() => ({}));


    if (!response.ok) {

        throw new Error(
            data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );

    }


    return data;

}


/* =========================================================
   LOAD SETTINGS
========================================================= */

async function loadSettings() {

    const localSettings =
        safeParse(
            localStorage.getItem("settings"),
            {}
        ) || {};


    try {

        const response =
            await fetch(
                `${API}/settings`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                `Request failed with status ${response.status}`
            );

        }


        const data =
            await response.json();


        const settings =
            data?.setting ||
            data?.settings ||
            data ||
            {};


        loadProfile(settings);

        loadCompany(settings);

        loadAppearance(settings);

        loadNotifications();

        loadEmployees();

        loadProjects();

        loadClients();


        localStorage.setItem(
            "settings",
            JSON.stringify(settings)
        );

    } catch (error) {

        console.warn(
            "Settings API unavailable:",
            error
        );


        /*
         * If backend is temporarily unavailable,
         * use the last locally saved settings.
         */

        loadProfile(localSettings);

        loadCompany(localSettings);

        loadAppearance(localSettings);

        loadNotifications();

        loadEmployees();

        loadProjects();

        loadClients();


        showToast(
            "Server settings could not be loaded. Local settings were used.",
            "info"
        );

    }

}


/* =========================================================
   LOAD PROFILE
========================================================= */

function loadProfile(settings = {}) {

    const loggedUser =
        getLoggedUser();


    const name =
        settings.adminName ||
        settings.name ||
        loggedUser?.name ||
        localStorage.getItem("userName") ||
        "Sathish Kumar";


    const email =
        settings.adminEmail ||
        settings.email ||
        loggedUser?.email ||
        "dcutsdigitalsolutions@gmail.com";


    const nameInput =
        document.getElementById("adminName");

    const emailInput =
        document.getElementById("adminEmail");


    if (nameInput) {
        nameInput.value = name;
    }


    if (emailInput) {
        emailInput.value = email;
    }

}


/* =========================================================
   SAVE PROFILE
========================================================= */

async function saveProfile() {

    const nameInput =
        document.getElementById("adminName");

    const emailInput =
        document.getElementById("adminEmail");


    const name =
        nameInput?.value.trim() || "";


    const email =
        emailInput?.value.trim() || "";


    if (!name) {

        showToast(
            "Please enter administrator name.",
            "error"
        );

        nameInput?.focus();

        return;

    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        showToast(
            "Please enter a valid email address.",
            "error"
        );

        emailInput?.focus();

        return;

    }


    const button =
        document.querySelector(
            '#profile-section .btn-primary'
        );


    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        const currentSettings =
            safeParse(
                localStorage.getItem("settings"),
                {}
            ) || {};


        const updatedSettings = {
            ...currentSettings,

            adminName: name,

            adminEmail:
                email ||
                "dcutsdigitalsolutions@gmail.com"
        };


        const result =
            await updateSettingsOnServer(
                updatedSettings
            );


        const savedSettings =
            result?.setting ||
            result?.settings ||
            result?.data ||
            updatedSettings;


        localStorage.setItem(
            "settings",
            JSON.stringify(savedSettings)
        );


        localStorage.setItem(
            "userName",
            name
        );


        const loggedUser =
            getLoggedUser();


        if (loggedUser) {

            loggedUser.name = name;

            loggedUser.email =
                email ||
                loggedUser.email;

            localStorage.setItem(
                "loggedUser",
                JSON.stringify(loggedUser)
            );

        }


        showToast(
            "Profile saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to save profile.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   LOAD COMPANY
========================================================= */

function loadCompany(settings = {}) {

    const localSettings =
        safeParse(
            localStorage.getItem("settings"),
            {}
        ) || {};


    const source = {
        ...localSettings,
        ...settings
    };


    const fields = {

        companyName:
            source.companyName ||
            "THE D CUTS",

        companyPhone:
            source.companyPhone ||
            "",

        companyEmail:
            source.companyEmail ||
            "",

        companyAddress:
            source.companyAddress ||
            ""

    };


    Object.entries(fields).forEach(
        ([id, value]) => {

            const element =
                document.getElementById(id);

            if (element) {
                element.value = value;
            }

        }
    );

}


/* =========================================================
   SAVE COMPANY
========================================================= */

async function saveCompany() {

    const companyName =
        document.getElementById(
            "companyName"
        )?.value.trim() || "";


    const companyPhone =
        document.getElementById(
            "companyPhone"
        )?.value.trim() || "";


    const companyEmail =
        document.getElementById(
            "companyEmail"
        )?.value.trim() || "";


    const companyAddress =
        document.getElementById(
            "companyAddress"
        )?.value.trim() || "";


    if (!companyName) {

        showToast(
            "Please enter company name.",
            "error"
        );

        return;

    }


    if (
        companyEmail &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            companyEmail
        )
    ) {

        showToast(
            "Please enter a valid company email.",
            "error"
        );

        return;

    }


    const button =
        document.querySelector(
            '#company-section .btn-primary'
        );


    setButtonLoading(
        button,
        true,
        "Saving..."
    );


    try {

        const currentSettings =
            safeParse(
                localStorage.getItem("settings"),
                {}
            ) || {};


        const updatedSettings = {

            ...currentSettings,

            companyName,

            companyPhone,

            companyEmail,

            companyAddress

        };


        const result =
            await updateSettingsOnServer(
                updatedSettings
            );


        const savedSettings =
            result?.setting ||
            result?.settings ||
            result?.data ||
            updatedSettings;


        localStorage.setItem(
            "settings",
            JSON.stringify(savedSettings)
        );


        showToast(
            "Company information saved successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to save company information.",
            "error"
        );

    } finally {

        setButtonLoading(
            button,
            false
        );

    }

}


/* =========================================================
   EMPLOYEES — LOCAL STORAGE
========================================================= */

function getEmployees() {

    const employees =
        safeParse(
            localStorage.getItem("employees"),
            []
        );


    return Array.isArray(employees)
        ? employees
        : [];

}


function saveEmployees(employees) {

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

}


function loadEmployees() {

    const list =
        document.getElementById(
            "employeeList"
        );


    const count =
        document.getElementById(
            "employeeCount"
        );


    if (!list) {
        return;
    }


    const employees =
        getEmployees();


    if (count) {
        count.textContent =
            employees.length;
    }


    if (!employees.length) {

        list.innerHTML = `
            <div class="settings-list-item">
                <div class="list-item-main">
                    <span class="list-item-title">
                        No employees added
                    </span>
                    <span class="list-item-meta">
                        Add an employee using the form above.
                    </span>
                </div>
            </div>
        `;

        return;

    }


    list.innerHTML =
        employees
            .map((employee, index) => {

                const name =
                    typeof employee === "string"
                        ? employee
                        : employee?.name ||
                          employee?.employeeName ||
                          "Unnamed Employee";


                const email =
                    typeof employee === "object"
                        ? employee?.email || ""
                        : "";


                return `
                    <div class="settings-list-item">

                        <div class="list-item-main">

                            <span class="list-item-title">
                                ${escapeHTML(name)}
                            </span>

                            <span class="list-item-meta">
                                ${escapeHTML(
                                    email ||
                                    "Employee entry"
                                )}
                            </span>

                        </div>

                        <div class="list-item-actions">

                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteEmployee(${index})"
                                title="Delete employee">

                                ×

                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function addEmployee() {

    const nameInput =
        document.getElementById(
            "newEmployeeName"
        );


    const emailInput =
        document.getElementById(
            "newEmployeeEmail"
        );


    const name =
        nameInput?.value.trim() || "";


    const email =
        emailInput?.value.trim() || "";


    if (!name) {

        showToast(
            "Please enter employee name.",
            "error"
        );

        nameInput?.focus();

        return;

    }


    if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {

        showToast(
            "Please enter a valid employee email.",
            "error"
        );

        return;

    }


    const employees =
        getEmployees();


    employees.push({
        name,
        email
    });


    saveEmployees(employees);

    loadEmployees();


    nameInput.value = "";

    if (emailInput) {
        emailInput.value = "";
    }


    showToast(
        "Employee added successfully.",
        "success"
    );

}


function deleteEmployee(index) {

    const employees =
        getEmployees();


    if (!employees[index]) {
        return;
    }


    const employee =
        employees[index];


    const name =
        typeof employee === "string"
            ? employee
            : employee?.name || "this employee";


    const confirmed =
        window.confirm(
            `Delete ${name}?`
        );


    if (!confirmed) {
        return;
    }


    employees.splice(index, 1);

    saveEmployees(employees);

    loadEmployees();


    showToast(
        "Employee deleted.",
        "success"
    );

}


/* =========================================================
   PROJECTS — LOCAL STORAGE
========================================================= */

function getProjects() {

    const projects =
        safeParse(
            localStorage.getItem("projects"),
            []
        );


    return Array.isArray(projects)
        ? projects
        : [];

}


function saveProjects(projects) {

    localStorage.setItem(
        "projects",
        JSON.stringify(projects)
    );

}


function loadProjects() {

    const list =
        document.getElementById(
            "projectList"
        );


    const count =
        document.getElementById(
            "projectCount"
        );


    if (!list) {
        return;
    }


    const projects =
        getProjects();


    if (count) {
        count.textContent =
            projects.length;
    }


    if (!projects.length) {

        list.innerHTML = `
            <div class="settings-list-item">
                <div class="list-item-main">
                    <span class="list-item-title">
                        No projects added
                    </span>
                    <span class="list-item-meta">
                        Add a project using the form above.
                    </span>
                </div>
            </div>
        `;

        return;

    }


    list.innerHTML =
        projects
            .map((project, index) => {

                const name =
                    typeof project === "string"
                        ? project
                        : project?.name ||
                          project?.projectName ||
                          "Unnamed Project";


                const code =
                    typeof project === "object"
                        ? project?.code ||
                          project?.projectCode ||
                          ""
                        : "";


                return `
                    <div class="settings-list-item">

                        <div class="list-item-main">

                            <span class="list-item-title">
                                ${escapeHTML(name)}
                            </span>

                            <span class="list-item-meta">
                                ${escapeHTML(
                                    code ||
                                    "Project entry"
                                )}
                            </span>

                        </div>

                        <div class="list-item-actions">

                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteProject(${index})"
                                title="Delete project">

                                ×

                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function addProject() {

    const nameInput =
        document.getElementById(
            "newProjectName"
        );


    const codeInput =
        document.getElementById(
            "newProjectCode"
        );


    const name =
        nameInput?.value.trim() || "";


    const code =
        codeInput?.value.trim() || "";


    if (!name) {

        showToast(
            "Please enter project name.",
            "error"
        );

        nameInput?.focus();

        return;

    }


    const projects =
        getProjects();


    projects.push({
        name,
        code
    });


    saveProjects(projects);

    loadProjects();


    nameInput.value = "";

    if (codeInput) {
        codeInput.value = "";
    }


    showToast(
        "Project added successfully.",
        "success"
    );

}


function deleteProject(index) {

    const projects =
        getProjects();


    if (!projects[index]) {
        return;
    }


    const project =
        projects[index];


    const name =
        typeof project === "string"
            ? project
            : project?.name || "this project";


    const confirmed =
        window.confirm(
            `Delete ${name}?`
        );


    if (!confirmed) {
        return;
    }


    projects.splice(index, 1);

    saveProjects(projects);

    loadProjects();


    showToast(
        "Project deleted.",
        "success"
    );

}


/* =========================================================
   CLIENTS — LOCAL STORAGE
========================================================= */

function getClients() {

    const clients =
        safeParse(
            localStorage.getItem("clients"),
            []
        );


    return Array.isArray(clients)
        ? clients
        : [];

}


function saveClients(clients) {

    localStorage.setItem(
        "clients",
        JSON.stringify(clients)
    );

}


function loadClients() {

    const list =
        document.getElementById(
            "clientList"
        );


    const count =
        document.getElementById(
            "clientCount"
        );


    if (!list) {
        return;
    }


    const clients =
        getClients();


    if (count) {
        count.textContent =
            clients.length;
    }


    if (!clients.length) {

        list.innerHTML = `
            <div class="settings-list-item">
                <div class="list-item-main">
                    <span class="list-item-title">
                        No clients added
                    </span>
                    <span class="list-item-meta">
                        Add a client using the form above.
                    </span>
                </div>
            </div>
        `;

        return;

    }


    list.innerHTML =
        clients
            .map((client, index) => {

                const name =
                    typeof client === "string"
                        ? client
                        : client?.name ||
                          client?.clientName ||
                          "Unnamed Client";


                const code =
                    typeof client === "object"
                        ? client?.code ||
                          client?.clientCode ||
                          ""
                        : "";


                const location =
                    typeof client === "object"
                        ? client?.location ||
                          client?.clientLocation ||
                          ""
                        : "";


                const meta =
                    [code, location]
                        .filter(Boolean)
                        .join(" • ") ||
                    "Client entry";


                return `
                    <div class="settings-list-item">

                        <div class="list-item-main">

                            <span class="list-item-title">
                                ${escapeHTML(name)}
                            </span>

                            <span class="list-item-meta">
                                ${escapeHTML(meta)}
                            </span>

                        </div>

                        <div class="list-item-actions">

                            <button
                                type="button"
                                class="delete-btn"
                                onclick="deleteClient(${index})"
                                title="Delete client">

                                ×

                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");

}


function addClient() {

    const nameInput =
        document.getElementById(
            "newClientName"
        );


    const codeInput =
        document.getElementById(
            "newClientCode"
        );


    const locationInput =
        document.getElementById(
            "newClientLocation"
        );


    const name =
        nameInput?.value.trim() || "";


    const code =
        codeInput?.value.trim() || "";


    const location =
        locationInput?.value.trim() || "";


    if (!name) {

        showToast(
            "Please enter client name.",
            "error"
        );

        nameInput?.focus();

        return;

    }


    const clients =
        getClients();


    clients.push({

        name,

        code,

        location

    });


    saveClients(clients);

    loadClients();


    nameInput.value = "";

    if (codeInput) {
        codeInput.value = "";
    }

    if (locationInput) {
        locationInput.value = "";
    }


    showToast(
        "Client added successfully.",
        "success"
    );

}


function deleteClient(index) {

    const clients =
        getClients();


    if (!clients[index]) {
        return;
    }


    const client =
        clients[index];


    const name =
        typeof client === "string"
            ? client
            : client?.name || "this client";


    const confirmed =
        window.confirm(
            `Delete ${name}?`
        );


    if (!confirmed) {
        return;
    }


    clients.splice(index, 1);

    saveClients(clients);

    loadClients();


    showToast(
        "Client deleted.",
        "success"
    );

}


/* =========================================================
   PASSWORD
========================================================= */

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(inputId);


    if (!input) {
        return;
    }


    if (input.type === "password") {

        input.type = "text";

        if (button) {
            button.textContent = "Hide";
        }

    } else {

        input.type = "password";

        if (button) {
            button.textContent = "Show";
        }

    }

}


/* =========================================================
   CHANGE PASSWORD
========================================================= */

function changePassword() {

    const currentInput =
        document.getElementById(
            "currentPassword"
        );


    const newInput =
        document.getElementById(
            "newPassword"
        );


    const confirmInput =
        document.getElementById(
            "confirmPassword"
        );


    const current =
        currentInput?.value || "";


    const newPassword =
        newInput?.value || "";


    const confirmPassword =
        confirmInput?.value || "";


    const savedPassword =
        localStorage.getItem(
            "adminPassword"
        ) || "admin123";


    if (!current) {

        showToast(
            "Please enter your current password.",
            "error"
        );

        currentInput?.focus();

        return;

    }


    if (current !== savedPassword) {

        showToast(
            "Current password is incorrect.",
            "error"
        );

        currentInput?.focus();

        return;

    }


    if (!newPassword) {

        showToast(
            "Please enter a new password.",
            "error"
        );

        newInput?.focus();

        return;

    }


    if (newPassword.length < 6) {

        showToast(
            "New password must contain at least 6 characters.",
            "error"
        );

        newInput?.focus();

        return;

    }


    if (newPassword !== confirmPassword) {

        showToast(
            "New password and confirmation do not match.",
            "error"
        );

        confirmInput?.focus();

        return;

    }


    localStorage.setItem(
        "adminPassword",
        newPassword
    );


    if (currentInput) {
        currentInput.value = "";
    }

    if (newInput) {
        newInput.value = "";
    }

    if (confirmInput) {
        confirmInput.value = "";
    }


    showToast(
        "Password changed successfully.",
        "success"
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function getNotifications() {

    return safeParse(
        localStorage.getItem("notifications"),
        {
            emailNotifications: true,
            reportNotifications: true,
            reminderNotifications: true
        }
    );

}


function loadNotifications() {

    const notifications =
        getNotifications();


    const email =
        document.getElementById(
            "emailNotifications"
        );


    const reports =
        document.getElementById(
            "reportNotifications"
        );


    const reminders =
        document.getElementById(
            "reminderNotifications"
        );


    if (email) {

        email.checked =
            notifications.emailNotifications !== false;

    }


    if (reports) {

        reports.checked =
            notifications.reportNotifications !== false;

    }


    if (reminders) {

        reminders.checked =
            notifications.reminderNotifications !== false;

    }

}


function saveNotifications() {

    const notifications = {

        emailNotifications:
            document.getElementById(
                "emailNotifications"
            )?.checked || false,

        reportNotifications:
            document.getElementById(
                "reportNotifications"
            )?.checked || false,

        reminderNotifications:
            document.getElementById(
                "reminderNotifications"
            )?.checked || false

    };


    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );


    showToast(
        "Notification preferences saved.",
        "success"
    );

}


/* =========================================================
   APPEARANCE
========================================================= */

function loadAppearance(settings = {}) {

    const savedTheme =
        settings.theme ||
        safeParse(
            localStorage.getItem("settings"),
            {}
        )?.theme ||
        localStorage.getItem("theme") ||
        "dark";


    const select =
        document.getElementById(
            "themeSelect"
        );


    if (select) {

        select.value =
            savedTheme === "light"
                ? "light"
                : "dark";

    }


    applyTheme(
        select?.value || "dark"
    );

}


function applyTheme(theme) {

    document.body.classList.toggle(
        "theme-light",
        theme === "light"
    );


    localStorage.setItem(
        "theme",
        theme
    );

}


async function changeTheme() {

    const select =
        document.getElementById(
            "themeSelect"
        );


    const theme =
        select?.value === "light"
            ? "light"
            : "dark";


    applyTheme(theme);


    const currentSettings =
        safeParse(
            localStorage.getItem("settings"),
            {}
        ) || {};


    const updatedSettings = {

        ...currentSettings,

        theme

    };


    try {

        const result =
            await updateSettingsOnServer(
                updatedSettings
            );


        const savedSettings =
            result?.setting ||
            result?.settings ||
            result?.data ||
            updatedSettings;


        localStorage.setItem(
            "settings",
            JSON.stringify(savedSettings)
        );


        showToast(
            `${theme === "light" ? "Light" : "Dark"} theme enabled.`,
            "success"
        );

    } catch (error) {

        /*
         * Theme is still saved locally
         * even when server save fails.
         */

        console.warn(
            "Theme server save failed:",
            error
        );


        localStorage.setItem(
            "settings",
            JSON.stringify(updatedSettings)
        );


        showToast(
            "Theme saved locally.",
            "info"
        );

    }

}


/* =========================================================
   BACKUP
========================================================= */

function downloadBackup() {

    try {

        const backup = {

            version: "1.0",

            application:
                "THE D CUTS Management System",

            exportedAt:
                new Date().toISOString(),

            employees:
                getEmployees(),

            projects:
                getProjects(),

            clients:
                getClients(),

            timesheets:
                safeParse(
                    localStorage.getItem("timesheets"),
                    []
                ) || [],

            settings:
                safeParse(
                    localStorage.getItem("settings"),
                    {}
                ) || {},

            notifications:
                getNotifications()

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        backup,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        const date =
            new Date()
                .toISOString()
                .slice(0, 10);


        link.href = url;

        link.download =
            `the-dcuts-backup-${date}.json`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


        showToast(
            "Backup downloaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to create backup.",
            "error"
        );

    }

}


/* =========================================================
   RESTORE BACKUP
========================================================= */

async function restoreBackup(event) {

    const file =
        event?.target?.files?.[0];


    if (!file) {
        return;
    }


    if (
        file.type !== "application/json" &&
        !file.name.toLowerCase().endsWith(".json")
    ) {

        showToast(
            "Please select a valid JSON backup file.",
            "error"
        );

        event.target.value = "";

        return;

    }


    const confirmed =
        window.confirm(
            "Restoring this backup will replace the current local settings data. Continue?"
        );


    if (!confirmed) {

        event.target.value = "";

        return;

    }


    try {

        const text =
            await file.text();


        const backup =
            JSON.parse(text);


        if (
            !backup ||
            typeof backup !== "object"
        ) {

            throw new Error(
                "Invalid backup format."
            );

        }


        if (
            backup.employees !== undefined &&
            !Array.isArray(backup.employees)
        ) {

            throw new Error(
                "Invalid employees data."
            );

        }


        if (
            backup.projects !== undefined &&
            !Array.isArray(backup.projects)
        ) {

            throw new Error(
                "Invalid projects data."
            );

        }


        if (
            backup.clients !== undefined &&
            !Array.isArray(backup.clients)
        ) {

            throw new Error(
                "Invalid clients data."
            );

        }


        if (
            backup.timesheets !== undefined &&
            !Array.isArray(backup.timesheets)
        ) {

            throw new Error(
                "Invalid timesheets data."
            );

        }


        if (
            backup.employees !== undefined
        ) {

            saveEmployees(
                backup.employees
            );

        }


        if (
            backup.projects !== undefined
        ) {

            saveProjects(
                backup.projects
            );

        }


        if (
            backup.clients !== undefined
        ) {

            saveClients(
                backup.clients
            );

        }


        if (
            backup.timesheets !== undefined
        ) {

            localStorage.setItem(
                "timesheets",
                JSON.stringify(
                    backup.timesheets
                )
            );

        }


        if (
            backup.settings &&
            typeof backup.settings === "object"
        ) {

            localStorage.setItem(
                "settings",
                JSON.stringify(
                    backup.settings
                )
            );

        }


        if (
            backup.notifications &&
            typeof backup.notifications === "object"
        ) {

            localStorage.setItem(
                "notifications",
                JSON.stringify(
                    backup.notifications
                )
            );

        }


        loadEmployees();

        loadProjects();

        loadClients();

        loadNotifications();


        const restoredSettings =
            backup.settings || {};


        loadProfile(
            restoredSettings
        );

        loadCompany(
            restoredSettings
        );

        loadAppearance(
            restoredSettings
        );


        showToast(
            "Backup restored successfully.",
            "success"
        );


        event.target.value = "";

    } catch (error) {

        console.error(error);

        showToast(
            error.message ||
            "Unable to restore backup.",
            "error"
        );


        event.target.value = "";

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutSettings(event) {

    if (event) {
        event.preventDefault();
    }


    localStorage.removeItem(
        "loggedUser"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "token"
    );


    window.location.href =
        "../login.html";

}


/* =========================================================
   ENTER KEY SUPPORT
========================================================= */

function setupEnterKeyActions() {

    const mappings = [

        [
            "newEmployeeName",
            "addEmployee"
        ],

        [
            "newEmployeeEmail",
            "addEmployee"
        ],

        [
            "newProjectName",
            "addProject"
        ],

        [
            "newProjectCode",
            "addProject"
        ],

        [
            "newClientName",
            "addClient"
        ],

        [
            "newClientCode",
            "addClient"
        ],

        [
            "newClientLocation",
            "addClient"
        ]

    ];


    mappings.forEach(
        ([inputId, functionName]) => {

            const input =
                document.getElementById(
                    inputId
                );


            if (!input) {
                return;
            }


            input.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        window[
                            functionName
                        ]();

                    }

                }
            );

        }
    );

}


/* =========================================================
   ADMIN GUARD
========================================================= */

function settingsAdminGuard() {

    if (!isAdminUser()) {

        showToast(
            "Administrator access required.",
            "error"
        );


        setTimeout(() => {

            window.location.href =
                "../login.html";

        }, 700);


        return false;

    }


    return true;

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        if (!settingsAdminGuard()) {
            return;
        }


        setupEnterKeyActions();


        showSection(
            "profile"
        );


        await loadSettings();

    }
);


/* =========================================================
   GLOBAL EXPORTS
========================================================= */

window.toggleSettingsSidebar =
    toggleSettingsSidebar;

window.showSection =
    showSection;

window.saveProfile =
    saveProfile;

window.saveCompany =
    saveCompany;

window.addEmployee =
    addEmployee;

window.deleteEmployee =
    deleteEmployee;

window.addProject =
    addProject;

window.deleteProject =
    deleteProject;

window.addClient =
    addClient;

window.deleteClient =
    deleteClient;

window.togglePassword =
    togglePassword;

window.changePassword =
    changePassword;

window.saveNotifications =
    saveNotifications;

window.changeTheme =
    changeTheme;

window.downloadBackup =
    downloadBackup;

window.restoreBackup =
    restoreBackup;

window.logoutSettings =
    logoutSettings;

window.showToast =
    showToast;