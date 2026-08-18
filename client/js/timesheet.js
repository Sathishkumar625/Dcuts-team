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
   GET LOGGED USER
===================================================== */

function getLoggedUser() {

    let loggedUser = null;


    /* ================================================
       loggedUser OBJECT
    ================================================= */

    try {

        const storedUser =
            localStorage.getItem(
                "loggedUser"
            );


        if (storedUser) {

            loggedUser =
                JSON.parse(
                    storedUser
                );
        }

    }
    catch (error) {

        console.warn(
            "loggedUser parse error:",
            error
        );

    }


    /* ================================================
       FALLBACK LOCALSTORAGE
    ================================================= */

    if (!loggedUser) {

        loggedUser = {

            name:
                localStorage.getItem(
                    "userName"
                ) ||
                localStorage.getItem(
                    "name"
                ) ||
                "",

            email:
                localStorage.getItem(
                    "userEmail"
                ) ||
                localStorage.getItem(
                    "email"
                ) ||
                "",

            employeeId:
                localStorage.getItem(
                    "employeeId"
                ) ||
                "",

            role:
                localStorage.getItem(
                    "role"
                ) ||
                ""

        };

    }


    return loggedUser;
}


/* =====================================================
   LOAD EMPLOYEES
=====================================================

   IMPORTANT:

   Sathish login
   -> ONLY Sathish

   Naveen login
   -> ONLY Naveen

   Display IDs:

   Sathish = 01
   Naveen  = 02

   Long Mongo Employee IDs are NEVER displayed.
===================================================== */

async function loadEmployees() {

    const select =
        document.getElementById(
            "employeeName"
        );

    if (!select) return;


    try {

        select.innerHTML = `
            <option value="">
                Loading...
            </option>
        `;


        const token =
            getAuthToken();


        const response =
            await fetch(
                `${API_BASE}/employees`,
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


        /* ============================================
           LOGGED USER
        ============================================ */

        const loggedUser =
            getLoggedUser();


        const loggedName =
            String(
                loggedUser?.name ||
                loggedUser?.displayName ||
                loggedUser?.employeeName ||
                ""
            )
            .trim()
            .toLowerCase();


        const loggedEmail =
            String(
                loggedUser?.email ||
                ""
            )
            .trim()
            .toLowerCase();


        const loggedEmployeeId =
            String(
                loggedUser?.employeeId ||
                ""
            )
            .trim()
            .toLowerCase();


        console.log(
            "Logged User:",
            loggedUser
        );


        console.log(
            "Logged Name:",
            loggedName
        );


        console.log(
            "Logged Email:",
            loggedEmail
        );


        /* ============================================
           FIND LOGGED-IN EMPLOYEE
        ============================================ */

        let loggedEmployee =
            null;


        /* --------------------------------------------
           1. EMPLOYEE ID MATCH
        -------------------------------------------- */

        if (
            loggedEmployeeId
        ) {

            loggedEmployee =
                employees.find(
                    employee => {

                        const id =
                            String(
                                employee.employeeId ||
                                employee._id ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        return (
                            id ===
                            loggedEmployeeId
                        );

                    }
                );

        }


        /* --------------------------------------------
           2. EMAIL MATCH
        -------------------------------------------- */

        if (
            !loggedEmployee &&
            loggedEmail
        ) {

            loggedEmployee =
                employees.find(
                    employee => {

                        const email =
                            String(
                                employee.email ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        return (
                            email &&
                            email ===
                            loggedEmail
                        );

                    }
                );

        }


        /* --------------------------------------------
           3. NAME MATCH
        -------------------------------------------- */

        if (
            !loggedEmployee &&
            loggedName
        ) {

            loggedEmployee =
                employees.find(
                    employee => {

                        const employeeName =
                            String(
                                employee.name ||
                                ""
                            )
                            .trim()
                            .toLowerCase();


                        if (
                            !employeeName
                        ) {
                            return false;
                        }


                        return (
                            employeeName ===
                                loggedName
                            ||
                            employeeName.includes(
                                loggedName
                            )
                            ||
                            loggedName.includes(
                                employeeName
                            )
                        );

                    }
                );

        }


        /* ============================================
           SPECIAL NAME MATCH
           
           Helps when Google name and employee
           database name are slightly different.
        ============================================ */

        if (
            !loggedEmployee &&
            loggedName
        ) {

            if (
                loggedName.includes(
                    "sathish"
                )
            ) {

                loggedEmployee =
                    employees.find(
                        employee =>
                            String(
                                employee.name ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                "sathish"
                            )
                    );

            }


            else if (
                loggedName.includes(
                    "naveen"
                )
            ) {

                loggedEmployee =
                    employees.find(
                        employee =>
                            String(
                                employee.name ||
                                ""
                            )
                            .toLowerCase()
                            .includes(
                                "naveen"
                            )
                    );

            }

        }


        /* ============================================
           IF EMPLOYEE NOT FOUND
        ============================================ */

        if (
            !loggedEmployee
        ) {

            console.warn(
                "Logged-in employee not found.",
                {
                    loggedUser,
                    employees
                }
            );


            select.innerHTML = `
                <option value="">
                    Employee not found
                </option>
            `;


            return;
        }


        /* ============================================
           SIMPLE DISPLAY ID
           
           Sathish = 01
           Naveen  = 02
        ============================================ */

        const employeeName =
            String(
                loggedEmployee.name ||
                ""
            )
            .trim()
            .toLowerCase();


        let simpleId =
            "01";


        if (
            employeeName.includes(
                "naveen"
            )
        ) {

            simpleId =
                "02";

        }


        else if (
            employeeName.includes(
                "sathish"
            )
        ) {

            simpleId =
                "01";

        }


        /* ============================================
           ONLY LOGGED-IN EMPLOYEE
        ============================================ */

        select.innerHTML =
            "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            loggedEmployee._id;


        option.textContent =
            `${simpleId}-${loggedEmployee.name}`;


        option.selected =
            true;


        select.appendChild(
            option
        );


        /* ============================================
           AUTO SELECT
        ============================================ */

        select.value =
            loggedEmployee._id;


        /* ============================================
           KEEP ONLY CURRENT EMPLOYEE
        ============================================ */

        employees =
            [
                loggedEmployee
            ];


        console.log(
            "Selected employee:",
            option.textContent
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
=====================================================

   ACCEPTS:

   9
   9.30
   9:30
   9 30
   9:30 AM
   9.30 AM
   9 AM
   6 PM
   18:30
   1830
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
            .replace(
                /\s+/g,
                " "
            )
            .trim();


    let period = null;


    if (
        /\b(am|a\.m\.)\b/i.test(
            time
        )
    ) {

        period =
            "AM";


        time =
            time.replace(
                /\s*(a\.m\.|am)\s*/i,
                ""
            );

    }


    else if (
        /\b(pm|p\.m\.)\b/i.test(
            time
        )
    ) {

        period =
            "PM";


        time =
            time.replace(
                /\s*(p\.m\.|pm)\s*/i,
                ""
            );

    }


    time =
        time.trim();


    /* 0930 -> 09:30 */

    if (
        /^\d{4}$/.test(
            time
        )
    ) {

        time =
            time.substring(
                0,
                2
            )
            +
            ":"
            +
            time.substring(
                2
            );

    }


    /* 930 -> 09:30 */

    else if (
        /^\d{3}$/.test(
            time
        )
    ) {

        time =
            "0" +
            time;


        time =
            time.substring(
                0,
                2
            )
            +
            ":"
            +
            time.substring(
                2
            );

    }


    /* 9.30 / 9 30 */

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    /* ONLY HOUR */

    if (
        /^\d{1,2}$/.test(
            time
        )
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
        Number(
            parts[0]
        );


    let minutes =
        Number(
            parts[1]
        );


    if (
        !Number.isInteger(
            hours
        ) ||
        !Number.isInteger(
            minutes
        )
    ) {

        return null;
    }


    if (
        minutes < 0 ||
        minutes > 59
    ) {

        return null;
    }


    /* 12 HOUR */

    if (period) {

        if (
            hours < 1 ||
            hours > 12
        ) {

            return null;
        }


        if (
            period ===
            "AM"
        ) {

            if (
                hours === 12
            ) {

                hours =
                    0;
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


    /* 24 HOUR */

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
   TIME ALIAS
===================================================== */

function timeToMinutes(
    value
) {

    return parseFlexibleTime(
        value
    );
}


/* =====================================================
   FORMAT DURATION
===================================================== */

function formatDuration(
    totalMinutes
) {

    if (
        !Number.isFinite(
            totalMinutes
        ) ||
        totalMinutes < 0
    ) {

        return "0h 0m";
    }


    totalMinutes =
        Math.floor(
            totalMinutes
        );


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    return (
        `${hours}h ${minutes}m`
    );
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
                document.getElementById(
                    id
                );


            if (!input) {
                return;
            }


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
=====================================================

   DEFAULT OFFICE HOURS:
   9 HOURS 30 MINUTES

   User can enter ANY time.

   No fixed time restriction.

   AM / PM supported.

   Example:

   09:30 AM -> 07:00 PM
   Lunch 01:00 PM -> 02:00 PM

   Office = 9h 30m
   Lunch  = 1h
   Working = 8h 30m
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


    /* DEFAULT */

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


    /* NO TIME ENTERED */

    if (
        !checkIn &&
        !lunchStart &&
        !lunchEnd &&
        !checkOut
    ) {

        return;
    }


    /* PARSE */

    const inTime =
        checkIn
            ? parseFlexibleTime(
                checkIn
            )
            : null;


    const lunchStartTime =
        lunchStart
            ? parseFlexibleTime(
                lunchStart
            )
            : null;


    const lunchEndTime =
        lunchEnd
            ? parseFlexibleTime(
                lunchEnd
            )
            : null;


    const outTime =
        checkOut
            ? parseFlexibleTime(
                checkOut
            )
            : null;


    /* INVALID FORMAT */

    if (

        (
            checkIn &&
            inTime === null
        )

        ||

        (
            lunchStart &&
            lunchStartTime === null
        )

        ||

        (
            lunchEnd &&
            lunchEndTime === null
        )

        ||

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


    /* OFFICE HOURS */

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

            officeMinutes =
                0;
        }

    }


    /* LUNCH */

    let lunchMinutes =
        0;


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

            lunchMinutes =
                0;
        }

    }


    /* WORKING */

    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {

        workingMinutes =
            0;
    }


    /* DISPLAY */

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
   TIME ERROR
===================================================== */

function showTimeError(
    message
) {

    const element =
        document.getElementById(
            "workingHours"
        );


    if (element) {

        element.textContent =
            "0h 0m";
    }
}


/* =====================================================
   TASK INPUT EVENTS
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


    taskEventsReady =
        true;


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
   UPDATE TASK COUNT
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


    const tasks =
        taskInput.value
            .split(/\r?\n/)
            .map(
                task =>
                    task.trim()
            )
            .filter(
                task =>
                    task.length > 0
            );


    const count =
        tasks.length;


    taskCount.textContent =
        `${count} ${
            count === 1
                ? "Task"
                : "Tasks"
        }`;
}


/* =====================================================
   GET TASKS
===================================================== */

function getTasks() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (!taskInput) {
        return [];
    }


    const lines =
        taskInput.value
            .split(/\r?\n/)
            .map(
                task =>
                    task.trim()
            )
            .filter(
                task =>
                    task.length > 0
            );


    return lines.map(
        task => ({

            taskName:
                task

        })
    );
}


/* =====================================================
   SET TASKS
===================================================== */

function setTasks(
    tasks
) {

    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (!taskInput) {
        return;
    }


    if (
        !Array.isArray(
            tasks
        )
    ) {

        taskInput.value =
            "";


        updateTaskCount();


        return;
    }


    taskInput.value =
        tasks
            .map(
                task => {

                    if (
                        typeof task ===
                        "string"
                    ) {

                        return task;
                    }


                    return (
                        task.taskName ||
                        task.name ||
                        task.title ||
                        ""
                    );

                }
            )
            .filter(
                task =>
                    String(
                        task
                    ).trim()
            )
            .join("\n");


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
        document.getElementById(
            id
        );


    if (!input) {
        return null;
    }


    const value =
        input.value.trim();


    /* TIME OPTIONAL */

    if (!value) {
        return null;
    }


    const parsed =
        parseFlexibleTime(
            value
        );


    if (
        parsed === null
    ) {

        alert(
            `${label} time is invalid.\n\n` +
            `Accepted examples:\n` +
            `09:30\n` +
            `18:30\n` +
            `0930\n` +
            `1830\n` +
            `9.30\n` +
            `9:30 AM\n` +
            `6 PM`
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

        [
            "checkIn",
            "Check-in"
        ],

        [
            "lunchStart",
            "Lunch Start"
        ],

        [
            "lunchEnd",
            "Lunch End"
        ],

        [
            "checkOut",
            "Check-out"
        ]

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
            result ===
            "INVALID"
        ) {

            return false;
        }
    }


    /* TASK REQUIRED */

    if (
        tasks.length === 0
    ) {

        alert(
            "Please enter at least one task."
        );


        const taskInput =
            document.getElementById(
                "taskInput"
            );


        taskInput?.focus();


        return false;
    }


    /*
       NO TIME ORDER VALIDATION.

       User can enter any time.

       Negative values are simply
       converted to 0.
    */


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
            ? parseFlexibleTime(
                checkIn
            )
            : null;


    const lunchStartTime =
        lunchStart
            ? parseFlexibleTime(
                lunchStart
            )
            : null;


    const lunchEndTime =
        lunchEnd
            ? parseFlexibleTime(
                lunchEnd
            )
            : null;


    const outTime =
        checkOut
            ? parseFlexibleTime(
                checkOut
            )
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

            officeMinutes =
                0;
        }

    }


    let lunchMinutes =
        0;


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

            lunchMinutes =
                0;
        }

    }


    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {

        workingMinutes =
            0;
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


    if (!table) {
        return;
    }


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
   RENDER
===================================================== */

function renderTimesheets(
    records
) {

    const table =
        document.getElementById(
            "timesheetTable"
        );


    if (!table) {
        return;
    }


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


            const employeeName =
                employee.name ||
                "Unknown";


            /* =========================================
               SIMPLE EMPLOYEE ID
            ========================================= */

            const employeeNameLower =
                String(
                    employeeName
                )
                .toLowerCase();


            let simpleId =
                "01";


            if (
                employeeNameLower.includes(
                    "naveen"
                )
            ) {

                simpleId =
                    "02";
            }


            else if (
                employeeNameLower.includes(
                    "sathish"
                )
            ) {

                simpleId =
                    "01";
            }


            const employeeDisplay =
                `${simpleId}-${employeeName}`;


            const tasks =
                Array.isArray(
                    record.tasks
                )
                    ? record.tasks
                    : [];


            const taskHtml =
                tasks.length

                    ? tasks
                        .map(
                            (
                                task,
                                index
                            ) => `

                                <div
                                    class="record-task"
                                >

                                    ${index + 1}.
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

                    <div
                        class="record-tasks"
                    >

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

                    <div
                        class="record-actions"
                    >

                        <button
                            type="button"
                            class="record-action edit-action"
                            onclick="editTimesheet('${record._id}')"
                            title="Edit"
                        >

                            <i
                                class="fa-solid fa-pen"
                            ></i>

                        </button>


                        <button
                            type="button"
                            class="record-action delete-action"
                            onclick="deleteTimesheet('${record._id}')"
                            title="Delete"
                        >

                            <i
                                class="fa-solid fa-trash"
                            ></i>

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

async function editTimesheet(
    id
) {

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


        /* EMPLOYEE */

        document.getElementById(
            "employeeName"
        ).value =
            record.employee?._id ||
            record.employee ||
            "";


        /* DATE */

        document.getElementById(
            "date"
        ).value =
            formatInputDate(
                record.date
            );


        /* CHECK IN */

        document.getElementById(
            "checkIn"
        ).value =
            record.checkIn ||
            "";


        /* LUNCH START */

        document.getElementById(
            "lunchStart"
        ).value =
            record.lunchStart ||
            "";


        /* LUNCH END */

        document.getElementById(
            "lunchEnd"
        ).value =
            record.lunchEnd ||
            "";


        /* CHECK OUT */

        document.getElementById(
            "checkOut"
        ).value =
            record.checkOut ||
            "";


        /* COMMENTS */

        const comments =
            document.getElementById(
                "comments"
            );


        if (comments) {

            comments.value =
                record.comments ||
                "";
        }


        /* TASKS */

        const tasks =
            Array.isArray(
                record.tasks
            )
                ? record.tasks
                : [];


        setTasks(
            tasks
        );


        calculateWorkingHours();


        toggleUpdateButton();


        window.scrollTo({

            top:
                0,

            behavior:
                "smooth"

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

async function deleteTimesheet(
    id
) {

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

function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(
            value
        );


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

            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric"

        }
    );
}


/* =====================================================
   INPUT DATE
===================================================== */

function formatInputDate(
    value
) {

    if (!value) {
        return "";
    }


    const date =
        new Date(
            value
        );


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
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
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