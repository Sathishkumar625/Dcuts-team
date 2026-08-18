/* =====================================================
   THE D CUTS - DAILY TIMESHEET JS
   SINGLE TASK TEXTAREA VERSION
===================================================== */


/* =====================================================
   API
===================================================== */

const API_BASE =
    window.API_BASE ||
    "https://dcuts-team.onrender.com/api";


/* =====================================================
   GLOBAL
===================================================== */

let editingId = null;

let employees = [];

let taskEventsReady = false;


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {
        initializeTimesheet();
    }
);


/* =====================================================
   INITIALIZE
===================================================== */

async function initializeTimesheet() {

    setTodayDate();

    setupTimeCalculation();

    setupTaskInputEvents();

    updateTaskCount();

    await loadEmployees();

    await loadTimesheets();

    calculateWorkingHours();

    toggleUpdateButton();
}


/* =====================================================
   TODAY DATE
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
   AUTH TOKEN
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

        if (!response.ok) {
            throw new Error(
                "Failed to load employees."
            );
        }

        const data =
            await response.json();

        employees =
            data.employees ||
            data.data ||
            [];

        select.innerHTML = `
            <option value="">
                Select Employee
            </option>
        `;

        employees.forEach(
            (employee, index) => {

                const number =
                    employee.employeeId ||
                    String(index + 1)
                        .padStart(2, "0");

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    employee._id;

                option.textContent =
                    `${number}-${employee.name || "Unknown"}`;

                select.appendChild(
                    option
                );
            }
        );

        /* ==========================================
           LOGGED-IN EMPLOYEE DEFAULT SELECTION
        ========================================== */

        const loggedUser =
            JSON.parse(
                localStorage.getItem(
                    "loggedUser"
                ) ||
                "null"
            );

        if (loggedUser) {

            let matchedEmployee =
                null;


            if (
                loggedUser.employeeId
            ) {

                matchedEmployee =
                    employees.find(
                        employee =>
                            String(
                                employee.employeeId
                            ) ===
                            String(
                                loggedUser.employeeId
                            )
                    );
            }


            if (
                !matchedEmployee &&
                loggedUser.email
            ) {

                matchedEmployee =
                    employees.find(
                        employee =>
                            String(
                                employee.email || ""
                            ).toLowerCase() ===
                            String(
                                loggedUser.email
                            ).toLowerCase()
                    );
            }


            if (
                !matchedEmployee &&
                loggedUser.name
            ) {

                matchedEmployee =
                    employees.find(
                        employee =>
                            String(
                                employee.name || ""
                            ).toLowerCase() ===
                            String(
                                loggedUser.name
                            ).toLowerCase()
                    );
            }


            if (matchedEmployee) {

                select.value =
                    matchedEmployee._id;

                /*
                   Employee login:
                   only own employee option remains.
                */

                if (
                    loggedUser.role !== "admin"
                ) {

                    select.innerHTML = "";

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        matchedEmployee._id;

                    option.textContent =
                        `${matchedEmployee.employeeId || ""}-${matchedEmployee.name || "Unknown"}`;

                    option.selected =
                        true;

                    select.appendChild(
                        option
                    );
                }
            }
        }

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

    if (
        /\b(am|a\.m\.)\b/i.test(time)
    ) {

        period = "AM";

        time =
            time.replace(
                /\s*(a\.m\.|am)\s*/i,
                ""
            );
    }

    else if (
        /\b(pm|p\.m\.)\b/i.test(time)
    ) {

        period = "PM";

        time =
            time.replace(
                /\s*(p\.m\.|pm)\s*/i,
                ""
            );
    }

    time =
        time.trim();


    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2)
            + ":" +
            time.substring(2);
    }

    else if (
        /^\d{3}$/.test(time)
    ) {

        time =
            "0" + time;

        time =
            time.substring(0, 2)
            + ":" +
            time.substring(2);
    }


    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    if (
        /^\d{1,2}$/.test(time)
    ) {

        time =
            `${time}:00`;
    }


    const parts =
        time.split(":");


    if (
        parts.length !== 2
    ) {
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

        if (
            period === "AM"
        ) {

            if (
                hours === 12
            ) {
                hours = 0;
            }

        }

        else {

            if (
                hours !== 12
            ) {
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

    totalMinutes =
        Math.floor(totalMinutes);

    const hours =
        Math.floor(
            totalMinutes / 60
        );

    const minutes =
        totalMinutes % 60;

    return `${hours}h ${minutes}m`;
}


/* =====================================================
   TIME EVENTS
===================================================== */

function setupTimeCalculation() {

    const fields = [
        "checkIn",
        "lunchStart",
        "lunchEnd",
        "checkOut"
    ];

    fields.forEach(
        id => {

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
        }
    );
}


/* =====================================================
   CALCULATE HOURS
===================================================== */

function calculateWorkingHours() {

    const checkIn =
        document.getElementById(
            "checkIn"
        )?.value?.trim();

    const lunchStart =
        document.getElementById(
            "lunchStart"
        )?.value?.trim();

    const lunchEnd =
        document.getElementById(
            "lunchEnd"
        )?.value?.trim();

    const checkOut =
        document.getElementById(
            "checkOut"
        )?.value?.trim();


    const officeElement =
        document.getElementById(
            "officeHours"
        );

    const lunchElement =
        document.getElementById(
            "lunchHours"
        );

    const workingElement =
        document.getElementById(
            "workingHours"
        );


    const DEFAULT_OFFICE_MINUTES =
        9 * 60 + 30;


    if (officeElement) {
        officeElement.textContent =
            "9h 30m";
    }

    if (lunchElement) {
        lunchElement.textContent =
            "0h 0m";
    }

    if (workingElement) {
        workingElement.textContent =
            "9h 30m";
    }


    if (
        !checkIn &&
        !lunchStart &&
        !lunchEnd &&
        !checkOut
    ) {
        return;
    }


    const inTime =
        checkIn
            ? parseFlexibleTime(checkIn)
            : null;

    const lunchStartTime =
        lunchStart
            ? parseFlexibleTime(lunchStart)
            : null;

    const lunchEndTime =
        lunchEnd
            ? parseFlexibleTime(lunchEnd)
            : null;

    const outTime =
        checkOut
            ? parseFlexibleTime(checkOut)
            : null;


    if (
        (
            checkIn &&
            inTime === null
        ) ||
        (
            lunchStart &&
            lunchStartTime === null
        ) ||
        (
            lunchEnd &&
            lunchEndTime === null
        ) ||
        (
            checkOut &&
            outTime === null
        )
    ) {

        if (workingElement) {
            workingElement.textContent =
                "0h 0m";
        }

        return;
    }


    let officeMinutes =
        DEFAULT_OFFICE_MINUTES;


    if (
        inTime !== null &&
        outTime !== null
    ) {

        officeMinutes =
            outTime -
            inTime;

        if (
            officeMinutes < 0
        ) {
            officeMinutes = 0;
        }
    }


    let lunchMinutes = 0;


    if (
        lunchStartTime !== null &&
        lunchEndTime !== null
    ) {

        lunchMinutes =
            lunchEndTime -
            lunchStartTime;

        if (
            lunchMinutes < 0
        ) {
            lunchMinutes = 0;
        }
    }


    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {
        workingMinutes = 0;
    }


    if (officeElement) {

        officeElement.textContent =
            formatDuration(
                officeMinutes
            );
    }


    if (lunchElement) {

        lunchElement.textContent =
            formatDuration(
                lunchMinutes
            );
    }


    if (workingElement) {

        workingElement.textContent =
            formatDuration(
                workingMinutes
            );
    }
}


/* =====================================================
   TASK INPUT
===================================================== */

function setupTaskInputEvents() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    if (
        !taskInput ||
        taskEventsReady
    ) {
        return;
    }

    taskEventsReady = true;

    taskInput.addEventListener(
        "input",
        updateTaskCount
    );

    taskInput.addEventListener(
        "keyup",
        updateTaskCount
    );

    taskInput.addEventListener(
        "change",
        updateTaskCount
    );
}


/* =====================================================
   TASK COUNT
=====================================================

   IMPORTANT:

   Entire textarea = ONE TASK.

   Even if multiple lines are entered,
   it will always display:

   1 Task
===================================================== */

function updateTaskCount() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    const taskCount =
        document.getElementById(
            "taskCount"
        );

    if (
        !taskInput ||
        !taskCount
    ) {
        return;
    }


    const hasTask =
        taskInput.value.trim().length > 0;


    taskCount.textContent =
        hasTask
            ? "1 Task"
            : "0 Tasks";
}


/* =====================================================
   GET TASKS
=====================================================

   IMPORTANT:

   Entire textarea is ONE TASK.

   New lines are kept inside the same task.
===================================================== */

function getTasks() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    if (!taskInput) {
        return [];
    }


    const value =
        taskInput.value.trim();


    if (!value) {
        return [];
    }


    return [
        {
            taskName:
                value
        }
    ];
}


/* =====================================================
   SET TASKS
===================================================== */

function setTasks(tasks) {

    const taskInput =
        document.getElementById(
            "taskInput"
        );

    if (!taskInput) {
        return;
    }


    if (
        !Array.isArray(tasks) ||
        tasks.length === 0
    ) {

        taskInput.value =
            "";

        updateTaskCount();

        return;
    }


    /*
       Since all lines are one task,
       preserve the complete task text.
    */

    const firstTask =
        tasks[0];


    if (
        typeof firstTask ===
        "string"
    ) {

        taskInput.value =
            firstTask;

    }

    else {

        taskInput.value =
            firstTask.taskName ||
            firstTask.name ||
            firstTask.title ||
            "";
    }


    updateTaskCount();
}


/* =====================================================
   VALIDATE TIME
===================================================== */

function validateTimeInput(
    id,
    label
) {

    const input =
        document.getElementById(id);

    if (!input) {
        return null;
    }


    const value =
        input.value.trim();


    if (!value) {
        return null;
    }


    const parsed =
        parseFlexibleTime(value);


    if (
        parsed === null
    ) {

        alert(
            `${label} time is invalid.\n\nAccepted examples:\n09:30\n18:30\n0930\n1830\n9.30\n9:30 AM\n6 PM`
        );

        input.focus();

        return "INVALID";
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

    const tasks =
        getTasks();


    if (!employee) {

        alert(
            "Please select employee."
        );

        return false;
    }


    if (!date) {

        alert(
            "Please select date."
        );

        return false;
    }


    const timeFields = [
        ["checkIn", "Check-in"],
        ["lunchStart", "Lunch Start"],
        ["lunchEnd", "Lunch End"],
        ["checkOut", "Check-out"]
    ];


    for (
        const [id, label]
        of timeFields
    ) {

        const result =
            validateTimeInput(
                id,
                label
            );


        if (
            result === "INVALID"
        ) {
            return false;
        }
    }


    if (
        tasks.length === 0
    ) {

        alert(
            "Please enter at least one task."
        );

        document
            .getElementById(
                "taskInput"
            )
            ?.focus();

        return false;
    }


    return true;
}


/* =====================================================
   COLLECT FORM DATA
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
        )?.value || "";


    const tasks =
        getTasks();


    const inTime =
        checkIn
            ? parseFlexibleTime(checkIn)
            : null;

    const lunchStartTime =
        lunchStart
            ? parseFlexibleTime(lunchStart)
            : null;

    const lunchEndTime =
        lunchEnd
            ? parseFlexibleTime(lunchEnd)
            : null;

    const outTime =
        checkOut
            ? parseFlexibleTime(checkOut)
            : null;


    const DEFAULT_OFFICE_MINUTES =
        9 * 60 + 30;


    let officeMinutes =
        DEFAULT_OFFICE_MINUTES;


    if (
        inTime !== null &&
        outTime !== null
    ) {

        officeMinutes =
            outTime -
            inTime;

        if (
            officeMinutes < 0
        ) {
            officeMinutes = 0;
        }
    }


    let lunchMinutes = 0;


    if (
        lunchStartTime !== null &&
        lunchEndTime !== null
    ) {

        lunchMinutes =
            lunchEndTime -
            lunchStartTime;

        if (
            lunchMinutes < 0
        ) {
            lunchMinutes = 0;
        }
    }


    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {
        workingMinutes = 0;
    }


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

    if (
        !validateForm()
    ) {
        return;
    }


    const data =
        collectFormData();


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets`,
                {

                    method:
                        "POST",

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
                        JSON.stringify(
                            data
                        )
                }
            );


        const result =
            await response.json();


        if (
            !response.ok
        ) {

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

        alert(
            error.message
        );
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

                    method:
                        "GET",

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


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Failed to load timesheets."
            );
        }


        renderTimesheets(
            result.timesheets ||
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

                    Failed to load timesheets.

                </td>

            </tr>

        `;
    }
}


/* =====================================================
   RENDER TIMESHEETS
=====================================================

   IMPORTANT CHANGE:

   Task numbering REMOVED.

   Multiple lines inside textarea
   remain one task.

   No:

   1.
   2.
   3.

   Only the actual task text is displayed.
===================================================== */

function renderTimesheets(records) {

    const table =
        document.getElementById(
            "timesheetTable"
        );

    if (!table) return;


    table.innerHTML =
        "";


    if (
        records.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-table"
                >

                    No timesheet records found.

                </td>

            </tr>

        `;

        return;
    }


    records.forEach(
        record => {

            const row =
                document.createElement(
                    "tr"
                );


            const employee =
                record.employee ||
                {};


            const employeeId =
                employee.employeeId ||
                "";


            const employeeName =
                employee.name ||
                "Unknown";


            const employeeDisplay =
                employeeId
                    ? `${employeeId}-${employeeName}`
                    : employeeName;


            const tasks =
                Array.isArray(
                    record.tasks
                )
                    ? record.tasks
                    : [];


            /*
               IMPORTANT:

               No index + 1.

               No numbering.

               Each task is displayed
               exactly as stored.
            */

            const taskHtml =
                tasks.length
                    ? tasks
                        .map(
                            task => `

                                <div class="record-task">

                                    ${escapeHtml(
                                        task.taskName ||
                                        ""
                                    )}

                                </div>

                            `
                        )
                        .join("")
                    : "-";


            const officeHours =
                record.officeHours ||
                "0h 0m";


            const workingHours =
                record.workingHours ||
                "0h 0m";


            const lunchHours =
                record.lunchHours ||
                "0h 0m";


            row.innerHTML = `

                <td>

                    ${escapeHtml(
                        employeeDisplay
                    )}

                </td>


                <td>

                    ${formatDate(
                        record.date
                    )}

                </td>


                <td>

                    <div class="record-tasks">

                        ${taskHtml}

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        officeHours
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        workingHours
                    )}

                </td>


                <td>

                    ${escapeHtml(
                        lunchHours
                    )}

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


            table.appendChild(
                row
            );

        }
    );
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

                    method:
                        "GET",

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


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Failed to load timesheet."
            );
        }


        const record =
            result.timesheet;


        editingId =
            record._id;


        document.getElementById(
            "employeeName"
        ).value =
            record.employee?._id ||
            record.employee ||
            "";


        document.getElementById(
            "date"
        ).value =
            formatInputDate(
                record.date
            );


        document.getElementById(
            "checkIn"
        ).value =
            record.checkIn ||
            "";


        document.getElementById(
            "lunchStart"
        ).value =
            record.lunchStart ||
            "";


        document.getElementById(
            "lunchEnd"
        ).value =
            record.lunchEnd ||
            "";


        document.getElementById(
            "checkOut"
        ).value =
            record.checkOut ||
            "";


        const comments =
            document.getElementById(
                "comments"
            );


        if (comments) {

            comments.value =
                record.comments ||
                "";
        }


        const tasks =
            Array.isArray(
                record.tasks
            )
                ? record.tasks
                : [];


        setTasks(tasks);


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

        alert(
            error.message
        );
    }
}


/* =====================================================
   UPDATE
===================================================== */

async function updateTimesheet() {

    if (!editingId) {
        return;
    }


    if (
        !validateForm()
    ) {
        return;
    }


    const data =
        collectFormData();


    try {

        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/timesheets/${editingId}`,
                {

                    method:
                        "PUT",

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
                        JSON.stringify(
                            data
                        )
                }
            );


        const result =
            await response.json();


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Failed to update timesheet."
            );
        }


        alert(
            "Timesheet updated successfully."
        );


        editingId =
            null;


        resetForm();


        await loadTimesheets();

    }

    catch (error) {

        console.error(
            "UPDATE ERROR:",
            error
        );

        alert(
            error.message
        );
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

                    method:
                        "DELETE",

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


        if (
            !response.ok
        ) {

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

        alert(
            error.message
        );
    }
}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    editingId =
        null;


    [
        "checkIn",
        "lunchStart",
        "lunchEnd",
        "checkOut",
        "comments"
    ]
    .forEach(
        id => {

            const element =
                document.getElementById(
                    id
                );

            if (element) {

                element.value =
                    "";
            }
        }
    );


    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (taskInput) {

        taskInput.value =
            "";
    }


    setTodayDate();

    updateTaskCount();

    calculateWorkingHours();

    toggleUpdateButton();
}


/* =====================================================
   TOGGLE SAVE / UPDATE
===================================================== */

function toggleUpdateButton() {

    const saveBtn =
        document.getElementById(
            "saveBtn"
        );

    const updateBtn =
        document.getElementById(
            "updateBtn"
        );


    if (editingId) {

        if (saveBtn) {

            saveBtn.style.display =
                "none";
        }


        if (updateBtn) {

            updateBtn.style.display =
                "inline-flex";
        }

    }

    else {

        if (saveBtn) {

            saveBtn.style.display =
                "inline-flex";
        }


        if (updateBtn) {

            updateBtn.style.display =
                "none";
        }
    }
}


/* =====================================================
   DATE FORMAT
===================================================== */

function formatDate(value) {

    if (!value) {
        return "-";
    }


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

            month: "2-digit",

            year: "numeric"

        }
    );
}


/* =====================================================
   INPUT DATE
===================================================== */

function formatInputDate(value) {

    if (!value) {
        return "";
    }


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
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHtml(value) {

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
===================================================== */

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

window.updateTaskCount =
    updateTaskCount;