/* =====================================================
   THE D CUTS - DAILY TIMESHEET
   FINAL VERSION

   RULES
   -----------------------------------------------------
   01 - Sathish Kumar
   02 - Naveen

   Employee login:
   -> Own employee only

   Admin login:
   -> All employees

   TOTAL TASK:
   -> Entire textarea = ONE TASK
   -> No 1,2,3 numbering
   -> Line breaks and spaces preserved

   TIME:
   -> AM / PM
   -> 24 hour
   -> No fixed office-time restriction
   -> Calculate from entered times
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
    initializeTimesheet
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

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

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
   LOGGED USER
===================================================== */

function getLoggedUser() {

    try {

        return JSON.parse(
            localStorage.getItem("loggedUser") ||
            "null"
        );

    }

    catch (error) {

        console.error(
            "LOGGED USER PARSE ERROR:",
            error
        );

        return null;
    }
}


/* =====================================================
   CHECK ADMIN
===================================================== */

function isAdmin() {

    const user =
        getLoggedUser();

    return (
        user &&
        String(user.role || "")
            .toLowerCase() === "admin"
    );
}


/* =====================================================
   FIND LOGGED EMPLOYEE
===================================================== */

function findLoggedEmployee() {

    const user =
        getLoggedUser();

    if (!user || !Array.isArray(employees)) {

        return null;
    }


    let employee =
        null;


    /* ---------------------------------------------
       EMPLOYEE ID
    --------------------------------------------- */

    if (user.employeeId) {

        employee =
            employees.find(
                emp =>
                    String(
                        emp.employeeId || ""
                    ).trim() ===
                    String(
                        user.employeeId
                    ).trim()
            );
    }


    /* ---------------------------------------------
       EMAIL
    --------------------------------------------- */

    if (!employee && user.email) {

        employee =
            employees.find(
                emp =>
                    String(
                        emp.email || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    String(
                        user.email
                    )
                    .trim()
                    .toLowerCase()
            );
    }


    /* ---------------------------------------------
       NAME
    --------------------------------------------- */

    if (!employee && user.name) {

        employee =
            employees.find(
                emp =>
                    String(
                        emp.name || ""
                    )
                    .trim()
                    .toLowerCase() ===
                    String(
                        user.name
                    )
                    .trim()
                    .toLowerCase()
            );
    }


    return employee;
}


/* =====================================================
   LOAD EMPLOYEES
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
                `Employee API error: ${response.status}`
            );
        }


        const data =
            await response.json();


        employees =
            data.employees ||
            data.data ||
            [];


        const loggedUser =
            getLoggedUser();


        /* =================================================
           EMPLOYEE LOGIN
           ONLY OWN EMPLOYEE
        ================================================= */

        if (
            loggedUser &&
            !isAdmin()
        ) {

            const ownEmployee =
                findLoggedEmployee();


            select.innerHTML = "";


            if (!ownEmployee) {

                select.innerHTML = `
                    <option value="">
                        Employee not found
                    </option>
                `;

                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                ownEmployee._id;


            option.textContent =
                `${getEmployeeId(ownEmployee)} - ${ownEmployee.name || "Unknown"}`;


            option.selected =
                true;


            select.appendChild(
                option
            );


            return;
        }


        /* =================================================
           ADMIN LOGIN
           ALL EMPLOYEES
        ================================================= */

        select.innerHTML = `
            <option value="">
                Select Employee
            </option>
        `;


        employees.forEach(
            employee => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employee._id;


                option.textContent =
                    `${getEmployeeId(employee)} - ${employee.name || "Unknown"}`;


                select.appendChild(
                    option
                );
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
   EMPLOYEE ID
   IMPORTANT:
   ONLY 01 / 02
===================================================== */

function getEmployeeId(employee) {

    if (!employee) {
        return "";
    }


    const id =
        String(
            employee.employeeId || ""
        ).trim();


    /*
       Never generate:
       1
       2
       3
       etc.

       Database employeeId must contain:
       01
       02
    */

    if (id === "01") {

        return "01";
    }


    if (id === "02") {

        return "02";
    }


    return id;
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


    let period =
        null;


    /* ---------------------------------------------
       AM
    --------------------------------------------- */

    if (
        /\b(am|a\.m\.)\b/i.test(time)
    ) {

        period =
            "AM";


        time =
            time.replace(
                /\s*(a\.m\.|am)\s*/i,
                ""
            );
    }


    /* ---------------------------------------------
       PM
    --------------------------------------------- */

    else if (
        /\b(pm|p\.m\.)\b/i.test(time)
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


    /* ---------------------------------------------
       1830
    --------------------------------------------- */

    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);
    }


    /* ---------------------------------------------
       930
    --------------------------------------------- */

    else if (
        /^\d{3}$/.test(time)
    ) {

        time =
            "0" + time;


        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);
    }


    /* ---------------------------------------------
       9.30
       9 30
    --------------------------------------------- */

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    /* ---------------------------------------------
       9
    --------------------------------------------- */

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


    /* ---------------------------------------------
       AM / PM
    --------------------------------------------- */

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


    /* ---------------------------------------------
       24 HOUR
    --------------------------------------------- */

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
                document.getElementById(
                    id
                );


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
        )?.value.trim();


    const lunchStart =
        document.getElementById(
            "lunchStart"
        )?.value.trim();


    const lunchEnd =
        document.getElementById(
            "lunchEnd"
        )?.value.trim();


    const checkOut =
        document.getElementById(
            "checkOut"
        )?.value.trim();


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


    if (
        !checkIn &&
        !lunchStart &&
        !lunchEnd &&
        !checkOut
    ) {

        if (officeElement)
            officeElement.textContent =
                "0h 0m";

        if (lunchElement)
            lunchElement.textContent =
                "0h 0m";

        if (workingElement)
            workingElement.textContent =
                "0h 0m";

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

        if (officeElement)
            officeElement.textContent =
                "0h 0m";

        if (lunchElement)
            lunchElement.textContent =
                "0h 0m";

        if (workingElement)
            workingElement.textContent =
                "0h 0m";

        return;
    }


    let officeMinutes =
        0;


    let lunchMinutes =
        0;


    /* ---------------------------------------------
       OFFICE TIME
    --------------------------------------------- */

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


    /* ---------------------------------------------
       LUNCH
    --------------------------------------------- */

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
   TASK EVENTS
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
   TASK COUNT
   ENTIRE TEXTAREA = ONE TASK
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


    taskCount.textContent =
        taskInput.value.trim()
            ? "1 Task"
            : "0 Tasks";
}


/* =====================================================
   GET TASKS
   ONE TASK ONLY
===================================================== */

function getTasks() {

    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (!taskInput) {

        return [];
    }


    /*
       IMPORTANT:

       Do NOT use trim() here.

       We need to preserve exactly
       what the user typed.

       Spaces + line breaks remain.
    */

    const value =
        taskInput.value;


    if (
        !value.trim()
    ) {

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


    if (!taskInput) return;


    if (
        !Array.isArray(tasks) ||
        tasks.length === 0
    ) {

        taskInput.value =
            "";

        updateTaskCount();

        return;
    }


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

        alert(
            `${label} time is required.`
        );

        input.focus();

        return "INVALID";
    }


    const parsed =
        parseFlexibleTime(value);


    if (
        parsed === null
    ) {

        alert(
            `${label} time is invalid.\n\nExamples:\n9:30 AM\n1:30 PM\n2:30 PM\n7:30 PM\n09:30\n13:30\n14:30\n19:30`
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


    /* ---------------------------------------------
       TIME ORDER CHECK
    --------------------------------------------- */

    const checkIn =
        parseFlexibleTime(
            document.getElementById(
                "checkIn"
            ).value
        );


    const lunchStart =
        parseFlexibleTime(
            document.getElementById(
                "lunchStart"
            ).value
        );


    const lunchEnd =
        parseFlexibleTime(
            document.getElementById(
                "lunchEnd"
            ).value
        );


    const checkOut =
        parseFlexibleTime(
            document.getElementById(
                "checkOut"
            ).value
        );


    if (
        lunchStart <= checkIn
    ) {

        alert(
            "Lunch Start must be after Check-in."
        );

        return false;
    }


    if (
        lunchEnd <= lunchStart
    ) {

        alert(
            "Lunch End must be after Lunch Start."
        );

        return false;
    }


    if (
        checkOut <= lunchEnd
    ) {

        alert(
            "Check-out must be after Lunch End."
        );

        return false;
    }


    if (
        tasks.length === 0
    ) {

        alert(
            "Please enter the completed task."
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
        parseFlexibleTime(checkIn);


    const lunchStartTime =
        parseFlexibleTime(lunchStart);


    const lunchEndTime =
        parseFlexibleTime(lunchEnd);


    const outTime =
        parseFlexibleTime(checkOut);


    const officeMinutes =
        Math.max(
            0,
            outTime - inTime
        );


    const lunchMinutes =
        Math.max(
            0,
            lunchEndTime -
            lunchStartTime
        );


    const workingMinutes =
        Math.max(
            0,
            officeMinutes -
            lunchMinutes
        );


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
            error.message ||
            "Failed to save timesheet."
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
        !records.length
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
                getEmployeeId(
                    employee
                );


            const employeeName =
                employee.name ||
                "Unknown";


            const employeeDisplay =
                employeeId
                    ? `${employeeId} - ${employeeName}`
                    : employeeName;


            /* ---------------------------------------------
               TASK
               ONE BOX
               NO NUMBERING
            --------------------------------------------- */

            const tasks =
                Array.isArray(
                    record.tasks
                )
                    ? record.tasks
                    : [];


            let taskText =
                "";


            if (
                tasks.length
            ) {

                taskText =
                    tasks[0]?.taskName ||
                    tasks[0]?.name ||
                    tasks[0]?.title ||
                    "";
            }


            const taskHtml =
                taskText
                    ? `
                        <div class="record-tasks">

                            <div class="record-task">

                                ${escapeHtml(
                                    taskText
                                )}

                            </div>

                        </div>
                    `
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

                    ${taskHtml}

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


        const employeeSelect =
            document.getElementById(
                "employeeName"
            );


        if (
            employeeSelect
        ) {

            employeeSelect.value =
                record.employee?._id ||
                record.employee ||
                "";
        }


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


        setTasks(
            Array.isArray(record.tasks)
                ? record.tasks
                : []
        );


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
   RESET
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


    /*
       IMPORTANT:

       Employee login must remain
       on own employee.

       Do not reset employee select.
    */

    if (!isAdmin()) {

        const ownEmployee =
            findLoggedEmployee();


        const select =
            document.getElementById(
                "employeeName"
            );


        if (
            ownEmployee &&
            select
        ) {

            select.value =
                ownEmployee._id;
        }
    }
}


/* =====================================================
   SAVE / UPDATE BUTTON
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
   FORMAT DATE
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
   GLOBAL
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