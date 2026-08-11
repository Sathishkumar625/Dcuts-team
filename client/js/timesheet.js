/* =====================================================
   THE D CUTS
   TIMESHEET SYSTEM
   ADMIN + EMPLOYEE
===================================================== */


/* =====================================================
   API
===================================================== */

const API =
    "/api";

const CLIENT_BASE =
    "/client";


/* =====================================================
   CURRENT USER
===================================================== */

let currentUser = null;


/* =====================================================
   TOKEN
===================================================== */

function getToken() {

    return localStorage.getItem(
        "token"
    ) || "";

}


/* =====================================================
   CURRENT USER
===================================================== */

function getCurrentUser() {

    /* -----------------------------------------
       USER
    ----------------------------------------- */

    try {

        const userData =
            localStorage.getItem(
                "user"
            );


        if (userData) {

            const user =
                JSON.parse(
                    userData
                );


            if (user) {

                return user;

            }

        }

    }

    catch (error) {

        console.error(
            "USER PARSE ERROR:",
            error
        );

    }


    /* -----------------------------------------
       LOGGED USER
    ----------------------------------------- */

    try {

        const loggedUser =
            localStorage.getItem(
                "loggedUser"
            );


        if (loggedUser) {

            const user =
                JSON.parse(
                    loggedUser
                );


            if (user) {

                return user;

            }

        }

    }

    catch (error) {

        console.error(
            "LOGGED USER PARSE ERROR:",
            error
        );

    }


    return null;

}


/* =====================================================
   AUTH HEADERS
===================================================== */

function authHeaders() {

    const token =
        getToken();


    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };

}


/* =====================================================
   ADMIN CHECK
===================================================== */

function isAdmin() {

    return (
        currentUser &&
        String(
            currentUser.role || ""
        )
        .toLowerCase()
        .trim() === "admin"
    );

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "TIMESHEET PAGE LOADED"
        );


        currentUser =
            getCurrentUser();


        const token =
            getToken();


        console.log(
            "CURRENT USER:",
            currentUser
        );


        console.log(
            "TOKEN:",
            !!token
        );


        /* -----------------------------------------
           AUTH CHECK
        ----------------------------------------- */

        if (
            !token ||
            !currentUser
        ) {

            console.warn(
                "NO LOGIN SESSION"
            );


            window.location.href =
                "../login.html";


            return;

        }


        /* -----------------------------------------
           DATE
        ----------------------------------------- */

        const date =
            document.getElementById(
                "date"
            );


        if (date) {

            date.value =
                getToday();

        }


        /* -----------------------------------------
           PROJECT
        ----------------------------------------- */

        const container =
            document.getElementById(
                "projectContainer"
            );


        if (container) {

            container.innerHTML =
                "";

            addProjectCard();

        }


        /* -----------------------------------------
           UPDATE BUTTON
        ----------------------------------------- */

        const updateBtn =
            document.getElementById(
                "updateBtn"
            );


        if (updateBtn) {

            updateBtn.style.display =
                "none";

        }


        /* -----------------------------------------
           LOAD EMPLOYEES
        ----------------------------------------- */

        await loadEmployees();


        /* -----------------------------------------
           LOAD TIMESHEETS
        ----------------------------------------- */

        await loadTimesheets();

    }
);


/* =====================================================
   TODAY
===================================================== */

function getToday() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =====================================================
   LOAD EMPLOYEES
===================================================== */

async function loadEmployees() {

    const select =
        document.getElementById(
            "employeeName"
        );


    if (!select) {

        return;

    }


    /* =================================================
       EMPLOYEE LOGIN
    ================================================= */

    if (!isAdmin()) {

        const name =
            currentUser.name ||
            localStorage.getItem(
                "userName"
            ) ||
            currentUser.email ||
            "Employee";


        select.innerHTML = "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentUser.id ||
            currentUser._id ||
            currentUser.email ||
            name;


        option.textContent =
            name;


        select.appendChild(
            option
        );


        select.disabled =
            true;


        const help =
            document.getElementById(
                "employeeHelp"
            );


        if (help) {

            help.innerText =
                "Logged in employee";

        }


        console.log(
            "EMPLOYEE LOGIN:",
            name
        );


        return;

    }


    /* =================================================
       ADMIN
    ================================================= */

    select.disabled =
        false;


    select.innerHTML = `

        <option value="">
            Loading Employees...
        </option>

    `;


    try {

        const response =
            await fetch(
                `${API}/employees`,
                {

                    method:
                        "GET",

                    headers:
                        authHeaders()

                }
            );


        console.log(
            "EMPLOYEE STATUS:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "EMPLOYEE DATA:",
            data
        );


        if (
            response.status === 401
        ) {

            select.innerHTML = `

                <option value="">
                    Login Session Expired
                </option>

            `;


            console.error(
                "EMPLOYEE API 401"
            );


            return;

        }


        if (
            response.status === 403
        ) {

            select.innerHTML = `

                <option value="">
                    Admin Access Required
                </option>

            `;


            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load employees"
            );

        }


        const employees =
            data.employees || [];


        select.innerHTML = `

            <option value="">
                Select Employee
            </option>

        `;


        employees.forEach(
            function (employee) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employee._id ||
                    employee.id;


                option.textContent =
                    employee.name ||
                    employee.employeeName ||
                    employee.email ||
                    "Employee";


                select.appendChild(
                    option
                );

            }
        );


        console.log(
            "EMPLOYEES LOADED:",
            employees.length
        );


    }

    catch (error) {

        console.error(
            "EMPLOYEE LOAD ERROR:",
            error
        );


        select.innerHTML = `

            <option value="">
                Unable to Load Employees
            </option>

        `;

    }

}


/* =====================================================
   ADD PROJECT
===================================================== */

function addProjectCard(
    data = {}
) {

    const container =
        document.getElementById(
            "projectContainer"
        );


    if (!container) {

        return;

    }


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "project-card";


    card.innerHTML = `

        <div class="project-title">

            <h3>
                Project
            </h3>

            <button
                type="button"
                class="delete-project">

                Remove

            </button>

        </div>


        <div class="project-grid">


            <div>

                <label>
                    Project
                </label>

                <select class="project">

                    <option value="">
                        Select
                    </option>

                    <option value="DRT">
                        DRT
                    </option>

                    <option value="KC">
                        KC
                    </option>

                    <option value="SRG">
                        SRG
                    </option>

                    <option value="SST">
                        SST
                    </option>

                    <option value="MS">
                        MS
                    </option>

                    <option value="VS">
                        VS
                    </option>

                    <option value="OTHERS">
                        OTHERS
                    </option>

                </select>

            </div>


            <div>

                <label>
                    Total Videos
                </label>

                <input
                    class="totalVideos"
                    type="number"
                    min="0"
                    value="${data.totalVideos || 0}">

            </div>


            <div>

                <label>
                    Completed Videos
                </label>

                <input
                    class="completedVideos"
                    type="number"
                    min="0"
                    value="${data.completedVideos || 0}">

            </div>


            <div>

                <label>
                    Balance Videos
                </label>

                <input
                    class="balanceVideos"
                    type="number"
                    readonly
                    value="0">

            </div>


            <div class="full-width">

                <label>
                    Comments
                </label>

                <textarea
                    class="comments"
                    rows="4"
                    placeholder="Comments...">${escapeHtml(
                        data.comments || ""
                    )}</textarea>

            </div>


        </div>

    `;


    container.appendChild(
        card
    );


    const project =
        card.querySelector(
            ".project"
        );


    const total =
        card.querySelector(
            ".totalVideos"
        );


    const completed =
        card.querySelector(
            ".completedVideos"
        );


    const removeButton =
        card.querySelector(
            ".delete-project"
        );


    if (project) {

        project.value =
            data.project || "";

    }


    if (total) {

        total.addEventListener(
            "input",
            function () {

                calculateBalance(
                    total
                );

            }
        );

    }


    if (completed) {

        completed.addEventListener(
            "input",
            function () {

                calculateBalance(
                    completed
                );

            }
        );

    }


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {

                removeProject(
                    removeButton
                );

            }
        );

    }


    calculateBalance(
        total
    );

}


/* =====================================================
   REMOVE PROJECT
===================================================== */

function removeProject(
    button
) {

    const cards =
        document.querySelectorAll(
            ".project-card"
        );


    if (
        cards.length <= 1
    ) {

        alert(
            "Minimum one project required."
        );


        return;

    }


    const card =
        button.closest(
            ".project-card"
        );


    if (card) {

        card.remove();

    }

}


/* =====================================================
   BALANCE
===================================================== */

function calculateBalance(
    input
) {

    if (!input) {

        return;

    }


    const card =
        input.closest(
            ".project-card"
        );


    if (!card) {

        return;

    }


    const totalInput =
        card.querySelector(
            ".totalVideos"
        );


    const completedInput =
        card.querySelector(
            ".completedVideos"
        );


    const balanceInput =
        card.querySelector(
            ".balanceVideos"
        );


    const total =
        Number(
            totalInput?.value
        ) || 0;


    const completed =
        Number(
            completedInput?.value
        ) || 0;


    if (balanceInput) {

        balanceInput.value =
            Math.max(
                total - completed,
                0
            );

    }

}


/* =====================================================
   SAVE TIMESHEET
===================================================== */

async function saveTimesheet() {

    currentUser =
        getCurrentUser();


    const token =
        getToken();


    console.log(
        "SAVE USER:",
        currentUser
    );


    console.log(
        "SAVE TOKEN:",
        !!token
    );


    if (
        !token ||
        !currentUser
    ) {

        alert(
            "Login session not found."
        );


        window.location.href =
            "../login.html";


        return;

    }


    const dateElement =
        document.getElementById(
            "date"
        );


    const employeeSelect =
        document.getElementById(
            "employeeName"
        );


    const date =
        dateElement?.value || "";


    if (!date) {

        alert(
            "Please select date."
        );


        return;

    }


    /* -----------------------------------------
       ADMIN
    ----------------------------------------- */

    if (
        isAdmin() &&
        !employeeSelect?.value
    ) {

        alert(
            "Please select Employee."
        );


        return;

    }


    const cards =
        document.querySelectorAll(
            ".project-card"
        );


    if (
        cards.length === 0
    ) {

        alert(
            "Please add a project."
        );


        return;

    }


    let savedCount =
        0;


    for (
        const card of cards
    ) {

        const project =
            card.querySelector(
                ".project"
            )?.value || "";


        if (!project) {

            continue;

        }


        const totalVideos =
            Number(
                card.querySelector(
                    ".totalVideos"
                )?.value
            ) || 0;


        const completedVideos =
            Number(
                card.querySelector(
                    ".completedVideos"
                )?.value
            ) || 0;


        const comments =
            card.querySelector(
                ".comments"
            )?.value
            .trim() || "";


        const body = {

            project:
                project,

            projectName:
                project,

            date:
                date,

            totalVideos:
                totalVideos,

            completedVideos:
                completedVideos,

            balanceVideos:
                Math.max(
                    totalVideos -
                    completedVideos,
                    0
                ),

            comments:
                comments

        };


        /* -----------------------------------------
           ADMIN SELECTS EMPLOYEE
        ----------------------------------------- */

        if (
            isAdmin()
        ) {

            body.employee =
                employeeSelect.value;

        }


        console.log(
            "SENDING TIMESHEET:",
            body
        );


        try {

            const response =
                await fetch(
                    `${API}/timesheets`,
                    {

                        method:
                            "POST",

                        headers:
                            authHeaders(),

                        body:
                            JSON.stringify(
                                body
                            )

                    }
                );


            console.log(
                "TIMESHEET STATUS:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "TIMESHEET RESPONSE:",
                result
            );


            if (
                response.status === 401
            ) {

                alert(
                    "Session expired. Please login again."
                );


                return;

            }


            if (
                !response.ok ||
                !result.success
            ) {

                alert(
                    result.message ||
                    "Timesheet save failed."
                );


                return;

            }


            savedCount++;

        }

        catch (error) {

            console.error(
                "SAVE ERROR:",
                error
            );


            alert(
                "Unable to connect to server."
            );


            return;

        }

    }


    if (
        savedCount === 0
    ) {

        alert(
            "Please select at least one project."
        );


        return;

    }


    alert(
        "Timesheet Saved Successfully!"
    );


    clearForm();


    await loadTimesheets();

}


/* =====================================================
   LOAD TIMESHEETS
===================================================== */

async function loadTimesheets() {

    const table =
        document.getElementById(
            "timesheetTable"
        );


    if (!table) {

        return;

    }


    table.innerHTML = `

        <tr>

            <td colspan="7">
                Loading Records...
            </td>

        </tr>

    `;


    try {

        const response =
            await fetch(
                `${API}/timesheets`,
                {

                    method:
                        "GET",

                    headers:
                        authHeaders()

                }
            );


        console.log(
            "TIMESHEET LOAD STATUS:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "TIMESHEET RECORDS:",
            data
        );


        if (
            response.status === 401
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="7">
                        Session Expired
                    </td>

                </tr>

            `;


            return;

        }


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load records"
            );

        }


        table.innerHTML =
            "";


        const records =
            data.timesheets || [];


        if (
            records.length === 0
        ) {

            table.innerHTML = `

                <tr>

                    <td colspan="7">
                        No Records Found
                    </td>

                </tr>

            `;


            return;

        }


        records.forEach(
            function (item) {

                let employeeName =
                    "Unknown";


                if (
                    item.employee &&
                    typeof item.employee ===
                    "object"
                ) {

                    employeeName =
                        item.employee.name ||
                        item.employee.email ||
                        "Unknown";

                }


                else if (
                    item.employeeName
                ) {

                    employeeName =
                        item.employeeName;

                }


                const date =
                    item.date
                        ? new Date(
                            item.date
                        )
                        .toLocaleDateString()
                        : "-";


                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            employeeName
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            date
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            item.project ||
                            item.projectName ||
                            "-"
                        )}
                    </td>

                    <td>
                        ${Number(
                            item.totalVideos
                        ) || 0}
                    </td>

                    <td>
                        ${Number(
                            item.completedVideos
                        ) || 0}
                    </td>

                    <td>
                        ${Number(
                            item.balanceVideos
                        ) || 0}
                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="
                                deleteTimesheet(
                                    '${item._id}'
                                )
                            ">

                            🗑️

                        </button>

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        console.error(
            "LOAD TIMESHEET ERROR:",
            error
        );


        table.innerHTML = `

            <tr>

                <td colspan="7">
                    Unable to load records.
                </td>

            </tr>

        `;

    }

}


/* =====================================================
   DELETE
===================================================== */

async function deleteTimesheet(
    id
) {

    if (!id) {

        return;

    }


    if (
        !confirm(
            "Delete Timesheet?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API}/timesheets/${id}`,
                {

                    method:
                        "DELETE",

                    headers:
                        authHeaders()

                }
            );


        const result =
            await response.json();


        if (
            response.status === 401
        ) {

            alert(
                "Session expired."
            );


            return;

        }


        if (
            !response.ok ||
            !result.success
        ) {

            alert(
                result.message ||
                "Delete failed."
            );


            return;

        }


        alert(
            "Timesheet Deleted Successfully"
        );


        await loadTimesheets();

    }

    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(
            "Unable to delete timesheet."
        );

    }

}


/* =====================================================
   CLEAR FORM
===================================================== */

function clearForm() {

    const container =
        document.getElementById(
            "projectContainer"
        );


    if (container) {

        container.innerHTML =
            "";

        addProjectCard();

    }


    const date =
        document.getElementById(
            "date"
        );


    if (date) {

        date.value =
            getToday();

    }


    const employee =
        document.getElementById(
            "employeeName"
        );


    if (
        employee &&
        isAdmin()
    ) {

        employee.value =
            "";

    }

}


/* =====================================================
   UPDATE
===================================================== */

async function updateTimesheet() {

    alert(
        "Select an existing record to update."
    );

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

    .replace(
        /&/g,
        "&amp;"
    )

    .replace(
        /</g,
        "&lt;"
    )

    .replace(
        />/g,
        "&gt;"
    )

    .replace(
        /"/g,
        "&quot;"
    )

    .replace(
        /'/g,
        "&#039;"
    );

}


/* =====================================================
   GLOBAL FUNCTIONS
   HTML onclick WORK
===================================================== */

window.addProjectCard =
    addProjectCard;

window.saveTimesheet =
    saveTimesheet;

window.updateTimesheet =
    updateTimesheet;

window.deleteTimesheet =
    deleteTimesheet;

window.removeProject =
    removeProject;

window.calculateBalance =
    calculateBalance;