/* =====================================================
   THE D CUTS
   DAILY TIMESHEET
===================================================== */

const API_BASE =
    window.API_BASE ||
    "http://localhost:5000/api";


let editingId = null;
let employees = [];


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeTimesheet();

});


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeTimesheet() {

    setTodayDate();

    setupTimeCalculation();

    setupDefaultTask();

    await loadEmployees();

    await loadTimesheets();

    toggleUpdateButton();

    calculateWorkingHours();

}


/* =====================================================
   TOKEN
===================================================== */

function getAuthToken() {

    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt") ||
        sessionStorage.getItem("token") ||
        ""
    );

}


/* =====================================================
   TODAY
===================================================== */

function setTodayDate() {

    const input =
        document.getElementById("date");

    if (!input) return;

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(today.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(today.getDate())
            .padStart(2, "0");

    input.value =
        `${year}-${month}-${day}`;

}


/* =====================================================
   LOAD EMPLOYEES
===================================================== */

async function loadEmployees() {

    const select =
        document.getElementById("employeeName");

    if (!select) return;


    try {

        select.innerHTML = `
            <option value="">
                Loading employees...
            </option>
        `;


        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/employees`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load employees."
            );

        }


        employees =
            result.employees ||
            result.data ||
            result.users ||
            [];


        select.innerHTML = `
            <option value="">
                Select Employee
            </option>
        `;


        employees.forEach(
            (employee, index) => {

                const option =
                    document.createElement("option");


                option.value =
                    employee._id ||
                    employee.id ||
                    "";


                const employeeId =
                    employee.employeeId ||
                    employee.empId ||
                    String(index + 1)
                        .padStart(2, "0");


                option.textContent =
                    `${employeeId} - ${
                        employee.name ||
                        employee.fullName ||
                        "Unknown Employee"
                    }`;


                select.appendChild(option);

            }
        );


    }
    catch (error) {

        console.error(
            "EMPLOYEE LOAD ERROR:",
            error
        );


        select.innerHTML = `
            <option value="">
                Unable to load employees
            </option>
        `;

    }

}


/* =====================================================
   FLEXIBLE TIME PARSER
===================================================== */

function parseFlexibleTime(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }


    let time =
        String(value)
            .trim()
            .toLowerCase();


    if (!time) {
        return null;
    }


    time =
        time
            .replace(/\s+/g, " ")
            .trim();


    let period = null;


    if (/\b(am|a\.m\.)\b/i.test(time)) {

        period = "AM";

        time =
            time.replace(
                /\s*(a\.m\.|am)\s*/i,
                ""
            );

    }
    else if (/\b(pm|p\.m\.)\b/i.test(time)) {

        period = "PM";

        time =
            time.replace(
                /\s*(p\.m\.|pm)\s*/i,
                ""
            );

    }


    time = time.trim();


    if (/^\d{4}$/.test(time)) {

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);

    }
    else if (/^\d{3}$/.test(time)) {

        time =
            "0" +
            time;

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);

    }


    time =
        time.replace(/[.\s]+/g, ":");


    if (/^\d{1,2}$/.test(time)) {

        time =
            `${time}:00`;

    }


    const parts =
        time.split(":");


    if (parts.length !== 2) {

        return null;

    }


    let hours =
        Number(parts[0]);

    let minutes =
        Number(parts[1]);


    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes)
    ) {

        return null;

    }


    if (
        minutes < 0 ||
        minutes > 59
    ) {

        return null;

    }


    if (period) {

        if (
            hours < 1 ||
            hours > 12
        ) {

            return null;

        }


        if (period === "AM") {

            if (hours === 12) {
                hours = 0;
            }

        }
        else {

            if (hours !== 12) {
                hours += 12;
            }

        }

    }
    else {

        if (
            hours < 0 ||
            hours > 23
        ) {

            return null;

        }

    }


    return (
        hours * 60 +
        minutes
    );

}


/* =====================================================
   FORMAT DURATION
===================================================== */

function formatDuration(totalMinutes) {

    if (
        !Number.isFinite(totalMinutes) ||
        totalMinutes < 0
    ) {

        return "0h 0m";

    }


    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;


    return `${hours}h ${minutes}m`;

}


/* =====================================================
   TIME CALCULATION SETUP
===================================================== */

function setupTimeCalculation() {

    [
        "checkIn",
        "lunchStart",
        "lunchEnd",
        "checkOut"
    ].forEach(id => {

        const input =
            document.getElementById(id);

        if (!input) return;


        input.addEventListener(
            "input",
            calculateWorkingHours
        );


        input.addEventListener(
            "change",
            calculateWorkingHours
        );


        input.addEventListener(
            "blur",
            calculateWorkingHours
        );

    });

}


/* =====================================================
   CALCULATE HOURS
===================================================== */

function calculateWorkingHours() {

    const checkIn =
        document.getElementById("checkIn")?.value;

    const lunchStart =
        document.getElementById("lunchStart")?.value;

    const lunchEnd =
        document.getElementById("lunchEnd")?.value;

    const checkOut =
        document.getElementById("checkOut")?.value;


    const officeElement =
        document.getElementById("officeHours");

    const lunchElement =
        document.getElementById("lunchHours");

    const workingElement =
        document.getElementById("workingHours");


    if (
        !checkIn ||
        !lunchStart ||
        !lunchEnd ||
        !checkOut
    ) {

        if (officeElement)
            officeElement.textContent = "0h 0m";

        if (lunchElement)
            lunchElement.textContent = "0h 0m";

        if (workingElement)
            workingElement.textContent = "0h 0m";

        return;

    }


    const inTime =
        parseFlexibleTime(checkIn);

    const lunchStartTime =
        parseFlexibleTime(lunchStart);

    const lunchEndTime =
        parseFlexibleTime(lunchEnd);

    const outTime =
        parseFlexibleTime(checkOut);


    if (
        inTime === null ||
        lunchStartTime === null ||
        lunchEndTime === null ||
        outTime === null
    ) {

        if (workingElement)
            workingElement.textContent =
                "Invalid time";

        return;

    }


    if (lunchStartTime <= inTime) {

        showTimeError(
            "Lunch start must be after check-in"
        );

        return;

    }


    if (lunchEndTime <= lunchStartTime) {

        showTimeError(
            "Lunch end must be after lunch start"
        );

        return;

    }


    if (outTime <= lunchEndTime) {

        showTimeError(
            "Check-out must be after lunch end"
        );

        return;

    }


    const officeMinutes =
        outTime - inTime;


    const lunchMinutes =
        lunchEndTime - lunchStartTime;


    const workingMinutes =
        officeMinutes - lunchMinutes;


    officeElement.textContent =
        formatDuration(officeMinutes);


    lunchElement.textContent =
        formatDuration(lunchMinutes);


    workingElement.textContent =
        formatDuration(workingMinutes);

}


/* =====================================================
   TIME ERROR
===================================================== */

function showTimeError(message) {

    const element =
        document.getElementById("workingHours");

    if (!element) return;

    element.textContent = message;

}


/* =====================================================
   TASK SYSTEM
===================================================== */

function setupDefaultTask() {

    const container =
        document.getElementById("projectContainer");

    if (!container) return;

    container.innerHTML = "";

    addProjectCard();

}


/* =====================================================
   ADD TASK
===================================================== */

function addProjectCard(taskValue = "") {

    const container =
        document.getElementById("projectContainer");

    if (!container) return;


    const taskId =
        Date.now() +
        Math.random()
            .toString(36)
            .substring(2);


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "task-card";


    wrapper.dataset.taskId =
        taskId;


    wrapper.innerHTML = `

        <div class="task-card-top">

            <div class="task-title">

                <span class="task-number">
                    1
                </span>

                <strong>
                    Task
                </strong>

            </div>

            <button
                type="button"
                class="remove-task-btn"
                title="Remove task"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>


        <div class="task-input-row">

            <div class="task-bullet">
                <i class="fa-solid fa-circle"></i>
            </div>

            <input
                type="text"
                class="task-input"
                placeholder="Enter completed task..."
                value="${escapeHtml(taskValue)}"
            >

        </div>

    `;


    container.appendChild(wrapper);


    const removeButton =
        wrapper.querySelector(
            ".remove-task-btn"
        );


    removeButton.addEventListener(
        "click",
        () => {

            wrapper.remove();

            updateTaskNumbers();

            if (
                !container.querySelector(".task-card")
            ) {

                addProjectCard();

            }

        }
    );


    const input =
        wrapper.querySelector(".task-input");


    input.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                addProjectCard();

                const cards =
                    document.querySelectorAll(
                        ".task-card"
                    );

                const last =
                    cards[cards.length - 1];

                last
                    ?.querySelector(".task-input")
                    ?.focus();

            }

        }
    );


    updateTaskNumbers();

    updateTaskCount();

}


/* =====================================================
   TASK NUMBERS
===================================================== */

function updateTaskNumbers() {

    const cards =
        document.querySelectorAll(
            ".task-card"
        );


    cards.forEach(
        (card, index) => {

            const number =
                card.querySelector(
                    ".task-number"
                );

            const title =
                card.querySelector(
                    ".task-title strong"
                );


            if (number)
                number.textContent =
                    index + 1;


            if (title)
                title.textContent =
                    `Task ${index + 1}`;

        }
    );


    updateTaskCount();

}


/* =====================================================
   TASK COUNT
===================================================== */

function updateTaskCount() {

    const countElement =
        document.getElementById("taskCount");


    if (!countElement) return;


    const cards =
        document.querySelectorAll(
            ".task-card"
        );


    const count =
        Array.from(cards)
            .filter(card => {

                const input =
                    card.querySelector(
                        ".task-input"
                    );

                return input &&
                    input.value.trim();

            })
            .length;


    countElement.textContent =
        `${count} ${count === 1 ? "Task" : "Tasks"}`;

}


/* =====================================================
   GET TASKS
===================================================== */

function getTasks() {

    const inputs =
        document.querySelectorAll(
            ".task-input"
        );


    const tasks = [];


    inputs.forEach(input => {

        const value =
            input.value.trim();


        if (value) {

            tasks.push({
                taskName: value
            });

        }

    });


    return tasks;

}


/* =====================================================
   VALIDATE TIME
===================================================== */

function validateTimeInput(id, label) {

    const input =
        document.getElementById(id);


    if (!input) return null;


    const value =
        input.value.trim();


    if (!value) {

        alert(
            `${label} time is mandatory.`
        );

        input.focus();

        return null;

    }


    const parsed =
        parseFlexibleTime(value);


    if (parsed === null) {

        alert(
            `${label} time is invalid.\n\n` +
            `Accepted examples:\n` +
            `9\n` +
            `9.30\n` +
            `9:30\n` +
            `9:30 AM\n` +
            `9 PM\n` +
            `18:30\n` +
            `1830`
        );

        input.focus();

        return null;

    }


    return parsed;

}


/* =====================================================
   VALIDATE FORM
===================================================== */

function validateForm() {

    const employee =
        document.getElementById(
            "employeeName"
        )?.value;


    const date =
        document.getElementById(
            "date"
        )?.value;


    if (!employee) {

        alert("Please select employee.");

        return false;

    }


    if (!date) {

        alert("Please select date.");

        return false;

    }


    const inTime =
        validateTimeInput(
            "checkIn",
            "Check-in"
        );

    if (inTime === null)
        return false;


    const lunchStartTime =
        validateTimeInput(
            "lunchStart",
            "Lunch Start"
        );

    if (lunchStartTime === null)
        return false;


    const lunchEndTime =
        validateTimeInput(
            "lunchEnd",
            "Lunch End"
        );

    if (lunchEndTime === null)
        return false;


    const outTime =
        validateTimeInput(
            "checkOut",
            "Check-out"
        );

    if (outTime === null)
        return false;


    const tasks =
        getTasks();


    if (tasks.length === 0) {

        alert(
            "Please enter at least one task."
        );

        return false;

    }


    if (lunchStartTime <= inTime) {

        alert(
            "Lunch start must be after check-in."
        );

        return false;

    }


    if (lunchEndTime <= lunchStartTime) {

        alert(
            "Lunch end must be after lunch start."
        );

        return false;

    }


    if (outTime <= lunchEndTime) {

        alert(
            "Check-out must be after lunch end."
        );

        return false;

    }


    return true;

}


/* =====================================================
   COLLECT DATA
===================================================== */

function collectFormData() {

    const employee =
        document.getElementById(
            "employeeName"
        ).value;


    const date =
        document.getElementById(
            "date"
        ).value;


    const checkIn =
        document.getElementById(
            "checkIn"
        ).value.trim();


    const lunchStart =
        document.getElementById(
            "lunchStart"
        ).value.trim();


    const lunchEnd =
        document.getElementById(
            "lunchEnd"
        ).value.trim();


    const checkOut =
        document.getElementById(
            "checkOut"
        ).value.trim();


    const comments =
        document.getElementById(
            "comments"
        )?.value.trim() || "";


    const tasks =
        getTasks();


    const inTime =
        parseFlexibleTime(checkIn);


    const lunchStartTime =
        parseFlexibleTime(lunchStart);


    const lunchEndTime =
        parseFlexibleTime(lunchEnd);


    const outTime =
        parseFlexibleTime(checkOut);


    const officeMinutes =
        outTime - inTime;


    const lunchMinutes =
        lunchEndTime -
        lunchStartTime;


    const workingMinutes =
        officeMinutes -
        lunchMinutes;


    return {

        employee,

        date,

        checkIn,

        lunchStart,

        lunchEnd,

        checkOut,

        officeMinutes,

        lunchMinutes,

        workingMinutes,

        officeHours:
            formatDuration(
                officeMinutes
            ),

        lunchHours:
            formatDuration(
                lunchMinutes
            ),

        workingHours:
            formatDuration(
                workingMinutes
            ),

        tasks,

        comments

    };

}


/* =====================================================
   SAVE
===================================================== */

async function saveTimesheet() {

    if (!validateForm())
        return;


    const data =
        collectFormData();


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})

                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to save timesheet."
            );

        }


        alert(
            "Timesheet saved successfully."
        );


        resetForm();

        await loadTimesheets();

    }
    catch (error) {

        console.error(
            "SAVE TIMESHEET ERROR:",
            error
        );


        alert(error.message);

    }

}


/* =====================================================
   LOAD TIMESHEETS
===================================================== */

async function loadTimesheets() {

    const table =
        document.getElementById(
            "timesheetTable"
        );


    if (!table) return;


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets`,
                {

                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})

                    }

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load timesheets."
            );

        }


        renderTimesheets(
            result.timesheets ||
            result.data ||
            []
        );

    }
    catch (error) {

        console.error(
            "LOAD TIMESHEETS ERROR:",
            error
        );


        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="table-error"
                >
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Failed to load timesheets.
                </td>

            </tr>

        `;

    }

}


/* =====================================================
   RENDER
===================================================== */

function renderTimesheets(records) {

    const table =
        document.getElementById(
            "timesheetTable"
        );


    if (!table) return;


    table.innerHTML = "";


    if (!records.length) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >

                    <i class="fa-regular fa-calendar-xmark"></i>

                    <strong>
                        No timesheet records
                    </strong>

                    <span>
                        Saved employee timesheets will appear here.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    records.forEach(record => {

        const row =
            document.createElement("tr");


        const employee =
            record.employee || {};


        const employeeId =
            employee.employeeId ||
            employee.empId ||
            "";


        const employeeName =
            employee.name ||
            employee.fullName ||
            "Unknown";


        const employeeDisplay =
            employeeId
                ? `${employeeId} - ${employeeName}`
                : employeeName;


        const tasks =
            Array.isArray(record.tasks)
                ? record.tasks
                : [];


        const taskHtml =
            tasks.length
                ? tasks.map(
                    (task, index) => `
                        <div class="record-task">
                            <span>${index + 1}.</span>
                            ${escapeHtml(
                                task.taskName || ""
                            )}
                        </div>
                    `
                ).join("")
                : "-";


        const officeHours =
            record.officeHours ||
            formatDuration(
                record.officeMinutes || 0
            );


        const workingHours =
            record.workingHours ||
            formatDuration(
                record.workingMinutes || 0
            );


        const lunchHours =
            record.lunchHours ||
            formatDuration(
                record.lunchMinutes || 0
            );


        row.innerHTML = `

            <td>

                <div class="employee-cell">

                    <div class="employee-avatar">
                        ${escapeHtml(
                            employeeName
                                .charAt(0)
                                .toUpperCase()
                        )}
                    </div>

                    <div>
                        <strong>
                            ${escapeHtml(
                                employeeDisplay
                            )}
                        </strong>

                    </div>

                </div>

            </td>


            <td>

                <span class="date-badge">
                    ${formatDate(record.date)}
                </span>

            </td>


            <td>

                <div class="record-tasks">

                    ${taskHtml}

                </div>

            </td>


            <td>
                <span class="hours-badge">
                    ${escapeHtml(officeHours)}
                </span>
            </td>


            <td>
                <span class="hours-badge working">
                    ${escapeHtml(workingHours)}
                </span>
            </td>


            <td>
                <span class="hours-badge lunch">
                    ${escapeHtml(lunchHours)}
                </span>
            </td>


            <td>

                <div class="record-actions">

                    <button
                        type="button"
                        class="record-action edit-action"
                        onclick="editTimesheet('${record._id}')"
                        title="Edit"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>


                    <button
                        type="button"
                        class="record-action delete-action"
                        onclick="deleteTimesheet('${record._id}')"
                        title="Delete"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </td>

        `;


        table.appendChild(row);

    });

}


/* =====================================================
   EDIT
===================================================== */

async function editTimesheet(id) {

    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets/${id}`,
                {

                    method: "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})

                    }

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load timesheet."
            );

        }


        const record =
            result.timesheet ||
            result.data;


        if (!record) {

            throw new Error(
                "Timesheet record not found."
            );

        }


        editingId =
            record._id;


        const employeeValue =
            record.employee?._id ||
            record.employee ||
            "";


        document.getElementById(
            "employeeName"
        ).value =
            employeeValue;


        document.getElementById(
            "date"
        ).value =
            formatInputDate(
                record.date
            );


        document.getElementById(
            "checkIn"
        ).value =
            record.checkIn || "";


        document.getElementById(
            "lunchStart"
        ).value =
            record.lunchStart || "";


        document.getElementById(
            "lunchEnd"
        ).value =
            record.lunchEnd || "";


        document.getElementById(
            "checkOut"
        ).value =
            record.checkOut || "";


        document.getElementById(
            "comments"
        ).value =
            record.comments || "";


        const container =
            document.getElementById(
                "projectContainer"
            );


        container.innerHTML = "";


        const tasks =
            Array.isArray(record.tasks)
                ? record.tasks
                : [];


        if (!tasks.length) {

            addProjectCard();

        }
        else {

            tasks.forEach(task => {

                addProjectCard(
                    task.taskName || ""
                );

            });

        }


        calculateWorkingHours();

        toggleUpdateButton();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
    catch (error) {

        console.error(
            "EDIT ERROR:",
            error
        );


        alert(error.message);

    }

}


/* =====================================================
   UPDATE
===================================================== */

async function updateTimesheet() {

    if (!editingId)
        return;


    if (!validateForm())
        return;


    const data =
        collectFormData();


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets/${editingId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})

                    },

                    body:
                        JSON.stringify(data)

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to update timesheet."
            );

        }


        alert(
            "Timesheet updated successfully."
        );


        editingId = null;

        resetForm();

        await loadTimesheets();

    }
    catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );


        alert(error.message);

    }

}


/* =====================================================
   DELETE
===================================================== */

async function deleteTimesheet(id) {

    if (
        !confirm(
            "Are you sure you want to delete this timesheet?"
        )
    ) {

        return;

    }


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets/${id}`,
                {

                    method: "DELETE",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                Authorization:
                                    `Bearer ${token}`
                              }
                            : {})

                    }

                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete timesheet."
            );

        }


        alert(
            "Timesheet deleted successfully."
        );


        await loadTimesheets();

    }
    catch (error) {

        console.error(
            "DELETE ERROR:",
            error
        );


        alert(error.message);

    }

}


/* =====================================================
   RESET
===================================================== */

function resetForm() {

    editingId = null;


    [
        "checkIn",
        "lunchStart",
        "lunchEnd",
        "checkOut",
        "comments"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element)
            element.value = "";

    });


    setTodayDate();


    const employee =
        document.getElementById(
            "employeeName"
        );


    if (employee)
        employee.value = "";


    setupDefaultTask();

    calculateWorkingHours();

    toggleUpdateButton();

}


/* =====================================================
   TOGGLE BUTTON
===================================================== */

function toggleUpdateButton() {

    const saveBtn =
        document.getElementById("saveBtn");


    const updateBtn =
        document.getElementById("updateBtn");


    if (editingId) {

        if (saveBtn)
            saveBtn.style.display =
                "none";


        if (updateBtn)
            updateBtn.style.display =
                "inline-flex";

    }
    else {

        if (saveBtn)
            saveBtn.style.display =
                "inline-flex";


        if (updateBtn)
            updateBtn.style.display =
                "none";

    }

}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {

    if (!value)
        return "-";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =====================================================
   INPUT DATE
===================================================== */

function formatInputDate(value) {

    if (!value)
        return "";


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");


    const day =
        String(date.getDate())
            .padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

    return String(value ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


/* =====================================================
   GLOBAL
===================================================== */

window.addProjectCard =
    addProjectCard;

window.saveTimesheet =
    saveTimesheet;

window.updateTimesheet =
    updateTimesheet;

window.editTimesheet =
    editTimesheet;

window.deleteTimesheet =
    deleteTimesheet;

window.resetForm =
    resetForm;

window.calculateWorkingHours =
    calculateWorkingHours;