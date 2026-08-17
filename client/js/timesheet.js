/* =====================================================
   THE D CUTS - DAILY TIMESHEET JS
   SINGLE TASK TEXTAREA VERSION
   EMPLOYEE AUTO-SELECT VERSION
===================================================== */


/* =====================================================
   API
===================================================== */

const API_BASE =
    window.API_BASE ||
    "http://localhost:5000/api";


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
   GET LOGGED-IN USER
===================================================== */

function getLoggedInUser() {

    let user = null;


    /*
       Try loggedUser first
    */

    const loggedUserRaw =
        localStorage.getItem("loggedUser") ||
        sessionStorage.getItem("loggedUser");


    if (loggedUserRaw) {

        try {

            user =
                JSON.parse(loggedUserRaw);

        }

        catch {

            user = {
                name: loggedUserRaw
            };

        }

    }


    /*
       Try currentUser
    */

    if (!user) {

        const currentUserRaw =
            localStorage.getItem("currentUser") ||
            sessionStorage.getItem("currentUser");

        if (currentUserRaw) {

            try {

                user =
                    JSON.parse(currentUserRaw);

            }

            catch {

                user = {
                    name: currentUserRaw
                };

            }

        }

    }


    /*
       Try user
    */

    if (!user) {

        const userRaw =
            localStorage.getItem("user") ||
            sessionStorage.getItem("user");

        if (userRaw) {

            try {

                user =
                    JSON.parse(userRaw);

            }

            catch {

                user = {
                    name: userRaw
                };

            }

        }

    }


    /*
       Individual localStorage values
    */

    if (!user) {

        const name =
            localStorage.getItem("userName") ||
            localStorage.getItem("employeeName") ||
            sessionStorage.getItem("userName") ||
            sessionStorage.getItem("employeeName");


        const email =
            localStorage.getItem("email") ||
            sessionStorage.getItem("email");


        if (name || email) {

            user = {
                name: name || "",
                email: email || ""
            };

        }

    }


    /*
       Normalize string
    */

    if (typeof user === "string") {

        user = {
            name: user
        };

    }


    return user || {};

}


/* =====================================================
   GET LOGGED-IN EMPLOYEE NAME
===================================================== */

function getLoggedEmployeeName() {

    const user =
        getLoggedInUser();


    return (
        user.name ||
        user.userName ||
        user.employeeName ||
        user.fullName ||
        user.displayName ||
        ""
    ).trim();

}


/* =====================================================
   GET LOGGED-IN EMPLOYEE EMAIL
===================================================== */

function getLoggedEmployeeEmail() {

    const user =
        getLoggedInUser();


    return (
        user.email ||
        user.emailAddress ||
        ""
    ).trim();

}


/* =====================================================
   FIND LOGGED-IN EMPLOYEE
===================================================== */

function findLoggedInEmployee(list) {

    if (!Array.isArray(list)) {

        return null;

    }


    const loggedName =
        getLoggedEmployeeName()
            .toLowerCase()
            .trim();


    const loggedEmail =
        getLoggedEmployeeEmail()
            .toLowerCase()
            .trim();


    if (!loggedName && !loggedEmail) {

        return null;

    }


    /*
       Match by email first
    */

    if (loggedEmail) {

        const emailMatch =
            list.find(
                employee => {

                    const employeeEmail =
                        String(
                            employee.email ||
                            employee.emailAddress ||
                            ""
                        )
                        .toLowerCase()
                        .trim();

                    return (
                        employeeEmail &&
                        employeeEmail === loggedEmail
                    );

                }
            );


        if (emailMatch) {

            return emailMatch;

        }

    }


    /*
       Match by employee name
    */

    if (loggedName) {

        const nameMatch =
            list.find(
                employee => {

                    const employeeName =
                        String(
                            employee.name ||
                            employee.fullName ||
                            employee.userName ||
                            ""
                        )
                        .toLowerCase()
                        .trim();

                    return (
                        employeeName ===
                        loggedName
                    );

                }
            );


        if (nameMatch) {

            return nameMatch;

        }

    }


    /*
       Partial name match
    */

    if (loggedName) {

        const partialMatch =
            list.find(
                employee => {

                    const employeeName =
                        String(
                            employee.name ||
                            employee.fullName ||
                            employee.userName ||
                            ""
                        )
                        .toLowerCase()
                        .trim();

                    return (
                        employeeName.includes(
                            loggedName
                        ) ||
                        loggedName.includes(
                            employeeName
                        )
                    );

                }
            );


        if (partialMatch) {

            return partialMatch;

        }

    }


    return null;

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


    const loggedName =
        getLoggedEmployeeName();


    const loggedEmail =
        getLoggedEmployeeEmail();


    /*
       Always start with neutral option.
       NEVER show "Unable to load employees".
    */

    select.innerHTML = `
        <option value="">
            Select Employee
        </option>
    `;


    try {

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


        if (!Array.isArray(employees)) {

            employees = [];

        }


        /*
           Clear dropdown
        */

        select.innerHTML = `
            <option value="">
                Select Employee
            </option>
        `;


        /*
           Add employees
        */

        employees.forEach(
            (employee, index) => {

                if (!employee) return;


                const number =
                    employee.employeeId ||
                    String(index + 1)
                        .padStart(2, "0");


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    employee._id ||
                    employee.id ||
                    "";


                const employeeName =
                    employee.name ||
                    employee.fullName ||
                    employee.userName ||
                    "Unknown";


                option.textContent =
                    `${number}-${employeeName}`;


                option.dataset.name =
                    employeeName;


                option.dataset.email =
                    employee.email ||
                    "";


                select.appendChild(
                    option
                );

            }
        );


        /*
           Find logged-in employee
        */

        const loggedEmployee =
            findLoggedInEmployee(
                employees
            );


        if (loggedEmployee) {

            const loggedId =
                loggedEmployee._id ||
                loggedEmployee.id ||
                "";


            if (loggedId) {

                select.value =
                    loggedId;

            }

        }


        /*
           If API employee exists but
           name matching fails, try direct
           option name/email matching.
        */

        if (
            !select.value &&
            (loggedName || loggedEmail)
        ) {

            const options =
                Array.from(
                    select.options
                );


            const matchingOption =
                options.find(
                    option => {

                        const optionName =
                            String(
                                option.dataset.name ||
                                option.textContent ||
                                ""
                            )
                            .toLowerCase()
                            .trim();


                        const optionEmail =
                            String(
                                option.dataset.email ||
                                ""
                            )
                            .toLowerCase()
                            .trim();


                        return (
                            (
                                loggedName &&
                                optionName.includes(
                                    loggedName
                                )
                            )
                            ||
                            (
                                loggedEmail &&
                                optionEmail ===
                                loggedEmail
                            )
                        );

                    }
                );


            if (matchingOption) {

                select.value =
                    matchingOption.value;

            }

        }

    }


    catch (error) {

        console.error(
            "EMPLOYEE LOAD ERROR:",
            error
        );


        /*
           IMPORTANT:
           Do NOT show:
           "Unable to load employees"
        */


        select.innerHTML = "";


        /*
           If logged-in employee name
           is available, show that employee
           as fallback.
        */

        if (loggedName) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                loggedName;


            option.textContent =
                loggedName;


            option.selected =
                true;


            select.appendChild(
                option
            );

        }


        else {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                "";


            option.textContent =
                "Select Employee";


            option.selected =
                true;


            select.appendChild(
                option
            );

        }

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
            .replace(
                /\s+/g,
                " "
            )
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
            time.substring(0, 2) +
            ":" +
            time.substring(2);

    }


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
   TIME ALIAS
===================================================== */

function timeToMinutes(value) {

    return parseFlexibleTime(value);

}


/* =====================================================
   FORMAT DURATION
===================================================== */

function formatDuration(totalMinutes) {

    if (
        !Number.isFinite(totalMinutes)
    ) {

        return "0h 0m";

    }


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
        )?.value;


    const lunchStart =
        document.getElementById(
            "lunchStart"
        )?.value;


    const lunchEnd =
        document.getElementById(
            "lunchEnd"
        )?.value;


    const checkOut =
        document.getElementById(
            "checkOut"
        )?.value;


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

        if (workingElement) {

            workingElement.textContent =
                "Invalid time";

        }

        return;

    }


    if (
        lunchStartTime <= inTime
    ) {

        showTimeError(
            "Lunch start must be after check-in."
        );

        return;

    }


    if (
        lunchEndTime <= lunchStartTime
    ) {

        showTimeError(
            "Lunch end must be after lunch start."
        );

        return;

    }


    if (
        outTime <= lunchEndTime
    ) {

        showTimeError(
            "Check-out must be after lunch end."
        );

        return;

    }


    const officeMinutes =
        outTime - inTime;


    const lunchMinutes =
        lunchEndTime -
        lunchStartTime;


    const workingMinutes =
        officeMinutes -
        lunchMinutes;


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

function showTimeError(message) {

    const element =
        document.getElementById(
            "workingHours"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* =====================================================
   SINGLE TASK INPUT EVENTS
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
                task => task.trim()
            )
            .filter(
                task => task.length > 0
            );


    const count =
        tasks.length;


    taskCount.textContent =
        `${count} ${count === 1 ? "Task" : "Tasks"}`;

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
                task => task.trim()
            )
            .filter(
                task => task.length > 0
            );


    return lines.map(
        task => ({
            taskName: task
        })
    );

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
        !Array.isArray(tasks)
    ) {

        taskInput.value = "";

        updateTaskCount();

        return;

    }


    taskInput.value =
        tasks
            .map(
                task => {

                    if (
                        typeof task === "string"
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
                    String(task).trim()
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
        document.getElementById(id);


    if (!input) {

        return null;

    }


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


    if (
        parsed === null
    ) {

        alert(
            `${label} time is invalid.\n\nAccepted examples:\n9\n9.30\n9:30\n9:30 AM\n9 PM\n18:30\n1830`
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


    const inTime =
        validateTimeInput(
            "checkIn",
            "Check-in"
        );


    if (
        inTime === null
    ) {

        return false;

    }


    const lunchStartTime =
        validateTimeInput(
            "lunchStart",
            "Lunch Start"
        );


    if (
        lunchStartTime === null
    ) {

        return false;

    }


    const lunchEndTime =
        validateTimeInput(
            "lunchEnd",
            "Lunch End"
        );


    if (
        lunchEndTime === null
    ) {

        return false;

    }


    const outTime =
        validateTimeInput(
            "checkOut",
            "Check-out"
        );


    if (
        outTime === null
    ) {

        return false;

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


    if (
        lunchStartTime <= inTime
    ) {

        alert(
            "Lunch start must be after check-in."
        );

        return false;

    }


    if (
        lunchEndTime <= lunchStartTime
    ) {

        alert(
            "Lunch end must be after lunch start."
        );

        return false;

    }


    if (
        outTime <= lunchEndTime
    ) {

        alert(
            "Check-out must be after lunch end."
        );

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

function renderTimesheets(records) {

    const table =
        document.getElementById(
            "timesheetTable"
        );


    if (!table) return;


    table.innerHTML = "";


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


            table.appendChild(row);

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


        if (employeeSelect) {

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


        const comments =
            document.getElementById(
                "comments"
            );


        if (comments) {

            comments.value =
                record.comments || "";

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
                document.getElementById(id);


            if (element) {

                element.value = "";

            }

        }
    );


    const taskInput =
        document.getElementById(
            "taskInput"
        );


    if (taskInput) {

        taskInput.value = "";

    }


    setTodayDate();

    updateTaskCount();

    calculateWorkingHours();

    toggleUpdateButton();


    /*
       IMPORTANT:
       After reset, keep the logged-in
       employee selected.
    */

    const employeeSelect =
        document.getElementById(
            "employeeName"
        );


    if (
        employeeSelect &&
        employees.length
    ) {

        const loggedEmployee =
            findLoggedInEmployee(
                employees
            );


        if (loggedEmployee) {

            employeeSelect.value =
                loggedEmployee._id ||
                loggedEmployee.id ||
                "";

        }

    }

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