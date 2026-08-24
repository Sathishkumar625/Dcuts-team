/* ==========================================
   THE D CUTS SETTINGS SYSTEM
========================================== */

const API = "/api";


/* ==========================================
   TOKEN
========================================== */

function getToken() {

    return localStorage.getItem("token") || "";

}


/* ==========================================
   AUTH HEADERS
========================================== */

function authHeaders() {

    return {

        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${getToken()}`

    };

}


/* ==========================================
   PAGE LOAD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        const role =
            localStorage.getItem("role");


        if (!role) {

            window.location.href =
                "../login.html";

            return;

        }


        if (role !== "admin") {

            window.location.href =
                "timesheet.html";

            return;

        }


        await loadSettings();

    }
);


/* ==========================================
   SECTION NAVIGATION
========================================== */

function showSection(
    sectionId,
    clickedItem = null
) {

    document
        .querySelectorAll(".settings-card")
        .forEach(card => {

            card.classList.add("hidden");

        });


    const selected =
        document.getElementById(
            sectionId
        );


    if (selected) {

        selected.classList.remove(
            "hidden"
        );

    }


    document
        .querySelectorAll(
            ".settings-sidebar li"
        )
        .forEach(li => {

            li.classList.remove(
                "active"
            );

        });


    if (clickedItem) {

        clickedItem.classList.add(
            "active"
        );

    }

}


/* ==========================================
   LOAD SETTINGS FROM MONGODB
========================================== */

async function loadSettings() {

    try {

        const response =
            await fetch(
                `${API}/settings`,
                {

                    method: "GET",

                    headers:
                        authHeaders()

                }
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "../login.html";

            return;

        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load settings"
            );

        }


        const setting =
            data.setting || {};


        /* ============================
           PROFILE
        ============================ */

        const adminName =
            document.getElementById(
                "adminName"
            );


        const adminEmail =
            document.getElementById(
                "adminEmail"
            );


        if (adminName) {

            adminName.value =
                setting.adminName || "";

        }


        if (adminEmail) {

            adminEmail.value =
                setting.adminEmail || "";

        }


        /* ============================
           COMPANY
        ============================ */

        const companyName =
            document.getElementById(
                "companyName"
            );


        const companyPhone =
            document.getElementById(
                "companyPhone"
            );


        const companyEmail =
            document.getElementById(
                "companyEmail"
            );


        const companyAddress =
            document.getElementById(
                "companyAddress"
            );


        if (companyName) {

            companyName.value =
                setting.companyName ||
                "THE D CUTS";

        }


        if (companyPhone) {

            companyPhone.value =
                setting.companyPhone || "";

        }


        if (companyEmail) {

            companyEmail.value =
                setting.companyEmail || "";

        }


        if (companyAddress) {

            companyAddress.value =
                setting.companyAddress || "";

        }


        /* ============================
           THEME
        ============================ */

        const themeSelect =
            document.getElementById(
                "themeSelect"
            );


        const theme =
            setting.theme || "dark";


        if (themeSelect) {

            themeSelect.value =
                theme;

        }


        applyTheme(theme);


        /* ============================
           KEEP EXISTING FUNCTIONS
        ============================ */

        loadEmployees();

        loadProjects();

        loadClients();

        loadNotifications();


        /* ============================
           LOCAL STORAGE BACKUP
           FOR EXISTING UI
        ============================ */

        if (
            setting.adminName
        ) {

            localStorage.setItem(
                "adminName",
                setting.adminName
            );

        }


        if (
            setting.adminEmail
        ) {

            localStorage.setItem(
                "adminEmail",
                setting.adminEmail
            );

        }


        if (
            setting.companyName
        ) {

            localStorage.setItem(
                "companyName",
                setting.companyName
            );

        }


        if (
            setting.companyPhone !== undefined
        ) {

            localStorage.setItem(
                "companyPhone",
                setting.companyPhone || ""
            );

        }


        if (
            setting.companyEmail !== undefined
        ) {

            localStorage.setItem(
                "companyEmail",
                setting.companyEmail || ""
            );

        }


        if (
            setting.companyAddress !== undefined
        ) {

            localStorage.setItem(
                "companyAddress",
                setting.companyAddress || ""
            );

        }


        if (setting.theme) {

            localStorage.setItem(
                "theme",
                setting.theme
            );

        }


    }

    catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );


        alert(
            "Unable to load Settings from server."
        );

    }

}


/* ==========================================
   SAVE SETTINGS TO MONGODB
========================================== */

async function updateSettingsOnServer(
    settings
) {

    const response =
        await fetch(
            `${API}/settings`,
            {

                method: "PUT",

                headers:
                    authHeaders(),

                body:
                    JSON.stringify(settings)

            }
        );


    if (
        response.status === 401
    ) {

        window.location.href =
            "../login.html";

        return null;

    }


    const data =
        await response.json();


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Unable to save settings"
        );

    }


    return data;

}


/* ==========================================
   PROFILE
========================================== */

async function saveProfile() {

    const name =
        document
            .getElementById(
                "adminName"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "adminEmail"
            )
            .value
            .trim();


    if (!name || !email) {

        alert(
            "Please enter Name and Email"
        );

        return;

    }


    try {

        const data =
            await updateSettingsOnServer({

                adminName: name,

                adminEmail: email

            });


        if (!data) return;


        /* ============================
           LOCAL STORAGE
        ============================ */

        localStorage.setItem(
            "adminName",
            name
        );


        localStorage.setItem(
            "adminEmail",
            email
        );


        /* ============================
           LOGGED USER
        ============================ */

        const loggedUser =
            JSON.parse(
                localStorage.getItem(
                    "loggedUser"
                )
            );


        if (loggedUser) {

            loggedUser.name =
                name;

            loggedUser.email =
                email;


            localStorage.setItem(
                "loggedUser",
                JSON.stringify(
                    loggedUser
                )
            );

        }


        alert(
            "Profile Saved Successfully ✅"
        );

    }

    catch (error) {

        console.error(
            "PROFILE SAVE ERROR:",
            error
        );


        alert(
            "Profile Save Failed ❌\n" +
            error.message
        );

    }

}


/* ==========================================
   COMPANY
========================================== */

async function saveCompany() {

    const name =
        document
            .getElementById(
                "companyName"
            )
            .value
            .trim();


    const phone =
        document
            .getElementById(
                "companyPhone"
            )
            .value
            .trim();


    const email =
        document
            .getElementById(
                "companyEmail"
            )
            .value
            .trim();


    const address =
        document
            .getElementById(
                "companyAddress"
            )
            .value
            .trim();


    if (!name) {

        alert(
            "Company Name is required"
        );

        return;

    }


    try {

        const data =
            await updateSettingsOnServer({

                companyName: name,

                companyPhone: phone,

                companyEmail: email,

                companyAddress: address

            });


        if (!data) return;


        /* ============================
           LOCAL STORAGE
        ============================ */

        localStorage.setItem(
            "companyName",
            name
        );


        localStorage.setItem(
            "companyPhone",
            phone
        );


        localStorage.setItem(
            "companyEmail",
            email
        );


        localStorage.setItem(
            "companyAddress",
            address
        );


        alert(
            "Company Settings Saved Successfully ✅"
        );

    }

    catch (error) {

        console.error(
            "COMPANY SAVE ERROR:",
            error
        );


        alert(
            "Company Save Failed ❌\n" +
            error.message
        );

    }

}


/* ==========================================
   EMPLOYEES
========================================== */

function addEmployee() {

    const nameInput =
        document.getElementById(
            "newEmployeeName"
        );


    const emailInput =
        document.getElementById(
            "newEmployeeEmail"
        );


    if (!nameInput || !emailInput) {

        alert(
            "Employee input fields not found in HTML"
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const email =
        emailInput.value.trim();


    if (!name || !email) {

        alert(
            "Enter Employee Name and Email"
        );

        return;

    }


    let employees =
        JSON.parse(
            localStorage.getItem(
                "employees"
            )
        ) || [];


    const exists =
        employees.some(
            employee =>
                employee.email
                    .toLowerCase()
                ===
                email.toLowerCase()
        );


    if (exists) {

        alert(
            "Employee already exists"
        );

        return;

    }


    employees.push({

        id: Date.now(),

        name: name,

        email: email,

        createdAt:
            new Date().toISOString()

    });


    localStorage.setItem(
        "employees",
        JSON.stringify(
            employees
        )
    );


    nameInput.value = "";

    emailInput.value = "";


    loadEmployees();


    alert(
        "Employee Added Successfully ✅"
    );

}


function loadEmployees() {

    const container =
        document.getElementById(
            "employeeList"
        );


    if (!container) return;


    const employees =
        JSON.parse(
            localStorage.getItem(
                "employees"
            )
        ) || [];


    container.innerHTML = "";


    if (employees.length === 0) {

        container.innerHTML =
            "<p>No Employees Added</p>";

        return;

    }


    employees.forEach(
        employee => {

            container.innerHTML += `

                <div class="settings-list-item">

                    <div>

                        <strong>
                            ${employee.name}
                        </strong>

                        <small>
                            ${employee.email}
                        </small>

                    </div>

                    <button
                        type="button"
                        onclick="deleteEmployee(${employee.id})">

                        🗑️

                    </button>

                </div>

            `;

        }
    );

}


function deleteEmployee(id) {

    if (
        !confirm(
            "Delete this employee?"
        )
    ) {

        return;

    }


    let employees =
        JSON.parse(
            localStorage.getItem(
                "employees"
            )
        ) || [];


    employees =
        employees.filter(
            employee =>
                employee.id !== id
        );


    localStorage.setItem(
        "employees",
        JSON.stringify(
            employees
        )
    );


    loadEmployees();

}


/* ==========================================
   PROJECTS
========================================== */

function addProject() {

    const nameInput =
        document.getElementById(
            "newProjectName"
        );


    const codeInput =
        document.getElementById(
            "newProjectCode"
        );


    if (!nameInput || !codeInput) {

        alert(
            "Project input fields not found in HTML"
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const code =
        codeInput.value
            .trim()
            .toUpperCase();


    if (!name || !code) {

        alert(
            "Enter Project Name and Code"
        );

        return;

    }


    let projects =
        JSON.parse(
            localStorage.getItem(
                "projects"
            )
        ) || [];


    const exists =
        projects.some(
            project =>
                project.code === code
        );


    if (exists) {

        alert(
            "Project code already exists"
        );

        return;

    }


    projects.push({

        id: Date.now(),

        name: name,

        code: code,

        createdAt:
            new Date().toISOString()

    });


    localStorage.setItem(
        "projects",
        JSON.stringify(
            projects
        )
    );


    nameInput.value = "";

    codeInput.value = "";


    loadProjects();


    alert(
        "Project Added Successfully ✅"
    );

}


function loadProjects() {

    const container =
        document.getElementById(
            "projectList"
        );


    if (!container) return;


    const projects =
        JSON.parse(
            localStorage.getItem(
                "projects"
            )
        ) || [];


    container.innerHTML = "";


    if (projects.length === 0) {

        container.innerHTML =
            "<p>No Projects Added</p>";

        return;

    }


    projects.forEach(
        project => {

            container.innerHTML += `

                <div class="settings-list-item">

                    <div>

                        <strong>
                            ${project.name}
                        </strong>

                        <small>
                            Code: ${project.code}
                        </small>

                    </div>

                    <button
                        type="button"
                        onclick="deleteProject(${project.id})">

                        🗑️

                    </button>

                </div>

            `;

        }
    );

}


function deleteProject(id) {

    if (
        !confirm(
            "Delete this project?"
        )
    ) {

        return;

    }


    let projects =
        JSON.parse(
            localStorage.getItem(
                "projects"
            )
        ) || [];


    projects =
        projects.filter(
            project =>
                project.id !== id
        );


    localStorage.setItem(
        "projects",
        JSON.stringify(
            projects
        )
    );


    loadProjects();

}


/* ==========================================
   CLIENTS
========================================== */

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


    if (!nameInput || !codeInput) {

        alert(
            "Client input fields not found in HTML"
        );

        return;

    }


    const name =
        nameInput.value.trim();


    const code =
        codeInput.value
            .trim()
            .toUpperCase();


    const location =
        locationInput
            ? locationInput.value.trim()
            : "";


    if (!name || !code) {

        alert(
            "Enter Client Name and Code"
        );

        return;

    }


    let clients =
        JSON.parse(
            localStorage.getItem(
                "clients"
            )
        ) || [];


    const exists =
        clients.some(
            client =>
                client.code === code
        );


    if (exists) {

        alert(
            "Client code already exists"
        );

        return;

    }


    clients.push({

        id: Date.now(),

        name: name,

        code: code,

        location: location,

        createdAt:
            new Date().toISOString()

    });


    localStorage.setItem(
        "clients",
        JSON.stringify(
            clients
        )
    );


    nameInput.value = "";

    codeInput.value = "";

    if (locationInput) {

        locationInput.value = "";

    }


    loadClients();


    alert(
        "Client Added Successfully ✅"
    );

}


function loadClients() {

    const container =
        document.getElementById(
            "clientList"
        );


    if (!container) return;


    const clients =
        JSON.parse(
            localStorage.getItem(
                "clients"
            )
        ) || [];


    container.innerHTML = "";


    if (clients.length === 0) {

        container.innerHTML =
            "<p>No Clients Added</p>";

        return;

    }


    clients.forEach(
        client => {

            container.innerHTML += `

                <div class="settings-list-item">

                    <div>

                        <strong>
                            ${client.name}
                        </strong>

                        <small>
                            ${client.code}
                            ${
                                client.location
                                    ? " - " +
                                      client.location
                                    : ""
                            }
                        </small>

                    </div>

                    <button
                        type="button"
                        onclick="deleteClient(${client.id})">

                        🗑️

                    </button>

                </div>

            `;

        }
    );

}


function deleteClient(id) {

    if (
        !confirm(
            "Delete this client?"
        )
    ) {

        return;

    }


    let clients =
        JSON.parse(
            localStorage.getItem(
                "clients"
            )
        ) || [];


    clients =
        clients.filter(
            client =>
                client.id !== id
        );


    localStorage.setItem(
        "clients",
        JSON.stringify(
            clients
        )
    );


    loadClients();

}


/* ==========================================
   SECURITY
========================================== */

function changePassword() {

    const currentPassword =
        document.getElementById(
            "currentPassword"
        );


    const newPassword =
        document.getElementById(
            "newPassword"
        );


    const confirmPassword =
        document.getElementById(
            "confirmPassword"
        );


    if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
    ) {

        alert(
            "Password fields not found in HTML"
        );

        return;

    }


    const current =
        currentPassword.value;


    const newPass =
        newPassword.value;


    const confirmPass =
        confirmPassword.value;


    const savedPassword =
        localStorage.getItem(
            "adminPassword"
        ) || "admin123";


    if (
        current !== savedPassword
    ) {

        alert(
            "Current password is incorrect"
        );

        return;

    }


    if (
        newPass.length < 6
    ) {

        alert(
            "New password must contain at least 6 characters"
        );

        return;

    }


    if (
        newPass !== confirmPass
    ) {

        alert(
            "New passwords do not match"
        );

        return;

    }


    localStorage.setItem(
        "adminPassword",
        newPass
    );


    currentPassword.value = "";

    newPassword.value = "";

    confirmPassword.value = "";


    alert(
        "Password Changed Successfully ✅"
    );

}


/* ==========================================
   NOTIFICATIONS
========================================== */

function saveNotifications() {

    const email =
        document.getElementById(
            "emailNotifications"
        );


    const report =
        document.getElementById(
            "reportNotifications"
        );


    const reminder =
        document.getElementById(
            "reminderNotifications"
        );


    localStorage.setItem(
        "emailNotifications",
        email
            ? email.checked
            : false
    );


    localStorage.setItem(
        "reportNotifications",
        report
            ? report.checked
            : false
    );


    localStorage.setItem(
        "reminderNotifications",
        reminder
            ? reminder.checked
            : false
    );


    alert(
        "Notification Settings Saved ✅"
    );

}


function loadNotifications() {

    const email =
        document.getElementById(
            "emailNotifications"
        );


    const report =
        document.getElementById(
            "reportNotifications"
        );


    const reminder =
        document.getElementById(
            "reminderNotifications"
        );


    if (email) {

        email.checked =
            localStorage.getItem(
                "emailNotifications"
            ) === "true";

    }


    if (report) {

        report.checked =
            localStorage.getItem(
                "reportNotifications"
            ) === "true";

    }


    if (reminder) {

        reminder.checked =
            localStorage.getItem(
                "reminderNotifications"
            ) === "true";

    }

}


/* ==========================================
   APPEARANCE
========================================== */

async function saveAppearance() {

    const theme =
        document.getElementById(
            "themeSelect"
        );


    if (!theme) return;


    const selectedTheme =
        theme.value;


    try {

        const data =
            await updateSettingsOnServer({

                theme: selectedTheme

            });


        if (!data) return;


        localStorage.setItem(
            "theme",
            selectedTheme
        );


        applyTheme(
            selectedTheme
        );


        alert(
            "Appearance Saved Successfully ✅"
        );

    }

    catch (error) {

        console.error(
            "APPEARANCE SAVE ERROR:",
            error
        );


        alert(
            "Appearance Save Failed ❌\n" +
            error.message
        );

    }

}


function applyTheme(theme) {

    document.body.classList.remove(
        "theme-dark",
        "theme-light"
    );


    if (
        theme === "light"
    ) {

        document.body.classList.add(
            "theme-light"
        );

    }

    else {

        document.body.classList.add(
            "theme-dark"
        );

    }

}


/* ==========================================
   BACKUP
========================================== */

function backupData() {

    const backup = {

        version: "2.0",

        createdAt:
            new Date().toISOString(),

        data: {

            employees:
                JSON.parse(
                    localStorage.getItem(
                        "employees"
                    )
                ) || [],

            clients:
                JSON.parse(
                    localStorage.getItem(
                        "clients"
                    )
                ) || [],

            projects:
                JSON.parse(
                    localStorage.getItem(
                        "projects"
                    )
                ) || [],

            timesheets:
                JSON.parse(
                    localStorage.getItem(
                        "timesheets"
                    )
                ) || [],

            settings: {

                adminName:
                    localStorage.getItem(
                        "adminName"
                    ) || "",

                adminEmail:
                    localStorage.getItem(
                        "adminEmail"
                    ) || "",

                companyName:
                    localStorage.getItem(
                        "companyName"
                    ) || "",

                companyPhone:
                    localStorage.getItem(
                        "companyPhone"
                    ) || "",

                companyEmail:
                    localStorage.getItem(
                        "companyEmail"
                    ) || "",

                companyAddress:
                    localStorage.getItem(
                        "companyAddress"
                    ) || ""

            }

        }

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
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;


    link.download =
        `dcuts-backup-${new Date()
            .toISOString()
            .slice(0, 10)}.json`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    alert(
        "Backup Downloaded Successfully ✅"
    );

}


/* ==========================================
   RESTORE
========================================== */

function restoreData() {

    const input =
        document.getElementById(
            "restoreFile"
        );


    if (!input) {

        alert(
            "Restore file input not found"
        );

        return;

    }


    const file =
        input.files[0];


    if (!file) {

        alert(
            "Please select a backup file"
        );

        return;

    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            try {

                const backup =
                    JSON.parse(
                        event.target.result
                    );


                if (
                    !backup.data
                ) {

                    throw new Error(
                        "Invalid backup file"
                    );

                }


                if (
                    !confirm(
                        "Restore backup? Existing data may be replaced."
                    )
                ) {

                    return;

                }


                const data =
                    backup.data;


                if (
                    data.employees
                ) {

                    localStorage.setItem(
                        "employees",
                        JSON.stringify(
                            data.employees
                        )
                    );

                }


                if (
                    data.clients
                ) {

                    localStorage.setItem(
                        "clients",
                        JSON.stringify(
                            data.clients
                        )
                    );

                }


                if (
                    data.projects
                ) {

                    localStorage.setItem(
                        "projects",
                        JSON.stringify(
                            data.projects
                        )
                    );

                }


                if (
                    data.timesheets
                ) {

                    localStorage.setItem(
                        "timesheets",
                        JSON.stringify(
                            data.timesheets
                        )
                    );

                }


                if (
                    data.settings
                ) {

                    Object.keys(
                        data.settings
                    ).forEach(
                        key => {

                            localStorage.setItem(
                                key,
                                data.settings[key]
                            );

                        }
                    );

                }


                alert(
                    "Backup Restored Successfully ✅"
                );


                location.reload();

            }

            catch (error) {

                alert(
                    "Invalid backup file ❌"
                );

            }

        };


    reader.readAsText(
        file
    );

}


/* ==========================================
   LOGOUT
========================================== */

function logoutSettings() {

    if (
        !confirm(
            "Logout?"
        )
    ) {

        return;

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


    window.location.href =
        "../login.html";

}


/* ==========================================
   GLOBAL FUNCTIONS
========================================== */

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

window.changePassword =
    changePassword;

window.saveNotifications =
    saveNotifications;

window.saveAppearance =
    saveAppearance;

window.backupData =
    backupData;

window.restoreData =
    restoreData;

window.logoutSettings =
    logoutSettings;