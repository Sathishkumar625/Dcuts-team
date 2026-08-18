/* =====================================================
   THE D CUTS - DAILY TIMESHEET
===================================================== */


/* =====================================================
   API
===================================================== */

const API_BASE =
    window.API_BASE ||
    (
        window.location.hostname === "localhost"
            ? "http://localhost:5000/api"
            : "/api"
    );


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
   GET LOGGED USER
===================================================== */

function getLoggedUser() {

    let user = null;


    const possibleKeys = [
        "loggedUser",
        "user",
        "currentUser"
    ];


    for (
        const key
        of possibleKeys
    ) {

        const value =
            localStorage.getItem(key);


        if (!value) continue;


        try {

            const parsed =
                JSON.parse(value);


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                user = parsed;

                break;
            }

        }
        catch {

            // Ignore invalid JSON
        }

    }


    return user;
}


/* =====================================================
   GET LOGGED USER NAME
===================================================== */

function getLoggedUserName() {

    const user =
        getLoggedUser();


    const values = [

        user?.name,

        user?.userName,

        user?.username,

        user?.displayName,

        user?.employeeName,

        localStorage.getItem(
            "userName"
        ),

        localStorage.getItem(
            "employeeName"
        )

    ];


    for (
        const value
        of values
    ) {

        if (
            value &&
            String(value).trim()
        ) {

            return String(
                value
            ).trim();

        }

    }


    return "";
}


/* =====================================================
   GET LOGGED USER EMAIL
===================================================== */

function getLoggedUserEmail() {

    const user =
        getLoggedUser();


    const values = [

        user?.email,

        localStorage.getItem(
            "userEmail"
        ),

        localStorage.getItem(
            "email"
        )

    ];


    for (
        const value
        of values
    ) {

        if (
            value &&
            String(value).trim()
        ) {

            return String(
                value
            ).trim()
                .toLowerCase();

        }

    }


    return "";
}


/* =====================================================
   GET ROLE
===================================================== */

function getLoggedRole() {

    const user =
        getLoggedUser();


    return (
        user?.role ||
        localStorage.getItem("role") ||
        ""
    )
        .toString()
        .toLowerCase();
}


/* =====================================================
   EMPLOYEE MATCH
===================================================== */

function isCurrentEmployee(
    employee
) {

    const loggedName =
        getLoggedUserName()
            .toLowerCase()
            .trim();


    const loggedEmail =
        getLoggedUserEmail()
            .toLowerCase()
            .trim();


    const employeeName =
        String(
            employee?.name || ""
        )
            .toLowerCase()
            .trim();


    const employeeEmail =
        String(
            employee?.email || ""
        )
            .toLowerCase()
            .trim();


    // ------------------------------------------
    // EMAIL MATCH
    // ------------------------------------------

    if (
        loggedEmail &&
        employeeEmail &&
        loggedEmail === employeeEmail
    ) {

        return true;

    }


    // ------------------------------------------
    // NAME MATCH
    // ------------------------------------------

    if (
        loggedName &&
        employeeName
    ) {

        if (
            loggedName === employeeName
        ) {

            return true;

        }


        if (
            loggedName.includes(
                employeeName
            ) ||
            employeeName.includes(
                loggedName
            )
        ) {

            return true;

        }

    }


    return false;
}


/* =====================================================
   EMPLOYEE DISPLAY ID
===================================================== */

function getEmployeeDisplayId(
    employee,
    index
) {

    // ------------------------------------------
    // Existing sequence
    // ------------------------------------------

    if (
        index !== undefined
    ) {

        return String(
            index + 1
        ).padStart(
            2,
            "0"
        );

    }


    return "01";
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
            await response.json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                "Failed to load employees."
            );

        }


        employees =
            result.employees ||
            result.data ||
            [];


        // ------------------------------------------
        // ADMIN
        // ------------------------------------------

        const role =
            getLoggedRole();


        if (
            role === "admin"
        ) {

            renderEmployeeOptions(
                select,
                employees
            );

            return;
        }


        // ------------------------------------------
        // EMPLOYEE
        // Only logged employee
        // ------------------------------------------

        const currentEmployee =
            employees.find(
                isCurrentEmployee
            );


        if (
            !currentEmployee
        ) {

            select.innerHTML = `
                <option value="">
                    Employee not found
                </option>
            `;

            console.warn(
                "CURRENT EMPLOYEE NOT FOUND",
                {
                    loggedName:
                        getLoggedUserName(),

                    loggedEmail:
                        getLoggedUserEmail(),

                    employees
                }
            );

            return;
        }


        const index =
            employees.indexOf(
                currentEmployee
            );


        const displayId =
            getEmployeeDisplayId(
                currentEmployee,
                index
            );


        select.innerHTML = "";


        const option =
            document.createElement(
                "option"
            );


        option.value =
            currentEmployee._id;


        option.textContent =
            `${displayId}-${currentEmployee.name || "Employee"}`;


        option.selected =
            true;


        select.appendChild(
            option
        );


        // Make sure employee cannot
        // select another employee.
        select.disabled =
            true;

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
   RENDER EMPLOYEE OPTIONS
===================================================== */

function renderEmployeeOptions(
    select,
    list
) {

    select.innerHTML = `
        <option value="">
            Select Employee
        </option>
    `;


    list.forEach(
        (
            employee,
            index
        ) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                employee._id;


            const displayId =
                getEmployeeDisplayId(
                    employee,
                    index
                );


            option.textContent =
                `${displayId}-${employee.name || "Unknown"}`;


            select.appendChild(
                option
            );

        }
    );
}


/* =====================================================
   FLEXIBLE TIME PARSER
===================================================== */

function parseFlexibleTime(
    value
) {

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


    let period =
        null;


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


    // 1830
    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);

    }

    // 930
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


    // 9.30 / 9 30
    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    // 9
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
   TIME CALCULATION EVENTS
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
   CALCULATE WORKING HOURS
===================================================== */

function calculateWorkingHours() {

    const checkIn =
        document.getElementById(
            "checkIn"
        )?.value?.trim() || "";


    const lunchStart =
        document.getElementById(
            "lunchStart"
        )?.value?.trim() || "";


    const lunchEnd =
        document.getElementById(
            "lunchEnd"
        )?.value?.trim() || "";


    const checkOut =
        document.getElementById(
            "checkOut"
        )?.value?.trim() || "";


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


    let officeMinutes =
        DEFAULT_OFFICE_MINUTES;


    let lunchMinutes =
        0;


    let workingMinutes =
        DEFAULT_OFFICE_MINUTES;


    // ------------------------------------------
    // OFFICE
    // ------------------------------------------

    const inTime =
        checkIn
            ? parseFlexibleTime(checkIn)
            : null;


    const outTime =
        checkOut
            ? parseFlexibleTime(checkOut)
            : null;


    if (
        inTime !== null &&
        outTime !== null
    ) {

        officeMinutes =
            outTime - inTime;


        if (
            officeMinutes < 0
        ) {

            officeMinutes = 0;

        }

    }


    // ------------------------------------------
    // LUNCH
    // ------------------------------------------

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


    // ------------------------------------------
    // WORKING
    // ------------------------------------------

    workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {

        workingMinutes = 0;

    }


    // ------------------------------------------
    // DISPLAY
    // ------------------------------------------

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


    return taskInput.value
        .split(/\r?\n/)
        .map(
            task =>
                task.trim()
        )
        .filter(
            task =>
                task.length > 0
        )
        .map(
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


    if (!taskInput) return;


    if (
        !Array.isArray(tasks)
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
        return true;
    }


    const value =
        input.value.trim();


    // Empty = allowed
    if (!value) {
        return true;
    }


    const parsed =
        parseFlexibleTime(
            value
        );


    if (
        parsed === null
    ) {

        alert(
            `${label} time is invalid.\n\nAccepted examples:\n09:30\n18:30\n0930\n1830\n9.30\n9:30 AM\n6 PM`
        );


        input.focus();


        return false;

    }


    return true;

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
        const [
            id,
            label
        ]
        of timeFields
    ) {

        if (
            !validateTimeInput(
                id,
                label
            )
        ) {

            return false;

        }

    }


    const tasks =
        getTasks();


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


    const outTime =
        checkOut
            ? parseFlexibleTime(checkOut)
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
   SAVE TIMESHEET
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
            await response.json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                result.error ||
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
            await response.json()
                .catch(
                    () => ({})
                );


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

function renderTimesheets(
    records
) {

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


            const employeeName =
                employee.name ||
                "Unknown";


            const employeeId =
                employee.employeeId ||
                "";


            // ------------------------------------------
            // Display 01 / 02
            // ------------------------------------------

            const index =
                employees.findIndex(
                    employeeItem =>
                        employeeItem._id ===
                        employee._id
                );


            const displayId =
                index >= 0
                    ? getEmployeeDisplayId(
                        employee,
                        index
                    )
                    : "";


            const employeeDisplay =
                displayId
                    ? `${displayId}-${employeeName}`
                    : employeeName;


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

                                <div class="record-task">

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
            await response.json()
                .catch(
                    () => ({})
                );


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


        if (!record) {

            throw new Error(
                "Timesheet record not found."
            );

        }


        editingId =
            record._id;


        const employeeSelect =
            document.getElementById(
                "employeeName"
            );


        if (
            employeeSelect
        ) {

            employeeSelect.disabled =
                false;


            employeeSelect.value =
                record.employee?._id ||
                record.employee ||
                "";

        }


        const date =
            document.getElementById(
                "date"
            );


        if (date) {

            date.value =
                formatInputDate(
                    record.date
                );

        }


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
            Array.isArray(
                record.tasks
            )
                ? record.tasks
                : []
        );


        calculateWorkingHours();


        toggleUpdateButton();


        window.scrollTo({

            top: 0,

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
            await response.json()
                .catch(
                    () => ({})
                );


        if (
            !response.ok
        ) {

            throw new Error(
                result.message ||
                result.error ||
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
            await response.json()
                .catch(
                    () => ({})
                );


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


    // ------------------------------------------
    // Restore employee selection
    // ------------------------------------------

    const select =
        document.getElementById(
            "employeeName"
        );


    if (
        select &&
        getLoggedRole() !== "admin"
    ) {

        const currentEmployee =
            employees.find(
                isCurrentEmployee
            );


        if (
            currentEmployee
        ) {

            select.value =
                currentEmployee._id;

            select.disabled =
                true;

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


    if (
        editingId
    ) {

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

function formatDate(
    value
) {

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

function formatInputDate(
    value
) {

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