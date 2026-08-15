/* =====================================================
   THE D CUTS
   DAILY TIMESHEET
===================================================== */


/* =====================================================
   EMPLOYEES
===================================================== */

const EMPLOYEES = [

    {
        id: "01",
        name: "01 - Naveen"
    },

    {
        id: "02",
        name: "02 - Sathish"
    }

];


/* =====================================================
   ELEMENTS
===================================================== */

const employeeSelect =
    document.getElementById(
        "employeeName"
    );

const dateInput =
    document.getElementById(
        "date"
    );

const checkInInput =
    document.getElementById(
        "checkIn"
    );

const lunchStartInput =
    document.getElementById(
        "lunchStart"
    );

const lunchEndInput =
    document.getElementById(
        "lunchEnd"
    );

const checkOutInput =
    document.getElementById(
        "checkOut"
    );

const officeHoursElement =
    document.getElementById(
        "officeHours"
    );

const lunchBreakElement =
    document.getElementById(
        "lunchBreak"
    );

const workingHoursElement =
    document.getElementById(
        "workingHours"
    );

const taskInput =
    document.getElementById(
        "taskInput"
    );

const taskCount =
    document.getElementById(
        "taskCount"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

const clearBtn =
    document.getElementById(
        "clearBtn"
    );

const timesheetTable =
    document.getElementById(
        "timesheetTable"
    );

const emptyState =
    document.getElementById(
        "emptyState"
    );


/* =====================================================
   STORAGE KEY
===================================================== */

const STORAGE_KEY =
    "dcuts_timesheet_records";


/* =====================================================
   CURRENT EDIT ID
===================================================== */

let editingId = null;


/* =====================================================
   INITIALIZE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setToday();

        loadEmployees();

        loadRecords();

        setupTimeCalculation();

        setupTaskInput();

    }
);


/* =====================================================
   EMPLOYEES
===================================================== */

function loadEmployees() {

    if (!employeeSelect) {

        return;

    }


    employeeSelect.innerHTML = `

        <option value="">
            Select Employee
        </option>

    `;


    EMPLOYEES.forEach(
        function (employee) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                employee.id;

            option.textContent =
                employee.name;

            employeeSelect.appendChild(
                option
            );

        }
    );

}


/* =====================================================
   TODAY
===================================================== */

function setToday() {

    if (!dateInput) {

        return;

    }


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


    dateInput.value =
        `${year}-${month}-${day}`;

}


/* =====================================================
   TIME EVENTS
===================================================== */

function setupTimeCalculation() {

    const inputs = [

        checkInInput,

        lunchStartInput,

        lunchEndInput,

        checkOutInput

    ];


    inputs.forEach(
        function (input) {

            if (!input) {

                return;

            }


            input.addEventListener(
                "input",
                calculateHours
            );

            input.addEventListener(
                "change",
                calculateHours
            );

        }
    );

}


/* =====================================================
   TIME TO MINUTES
===================================================== */

function timeToMinutes(
    time
) {

    if (!time) {

        return null;

    }


    const parts =
        time.split(":");


    if (parts.length !== 2) {

        return null;

    }


    const hours =
        Number(parts[0]);


    const minutes =
        Number(parts[1]);


    if (
        Number.isNaN(hours) ||
        Number.isNaN(minutes)
    ) {

        return null;

    }


    return (
        hours * 60
        +
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


    const hours =
        Math.floor(
            totalMinutes / 60
        );


    const minutes =
        totalMinutes % 60;


    return `${hours}h ${minutes}m`;

}


/* =====================================================
   CALCULATE HOURS
===================================================== */

function calculateHours() {

    const checkIn =
        timeToMinutes(
            checkInInput?.value
        );


    const lunchStart =
        timeToMinutes(
            lunchStartInput?.value
        );


    const lunchEnd =
        timeToMinutes(
            lunchEndInput?.value
        );


    const checkOut =
        timeToMinutes(
            checkOutInput?.value
        );


    let officeMinutes = 0;

    let lunchMinutes = 0;

    let workingMinutes = 0;


    /* ==========================================
       OFFICE HOURS
    =========================================== */

    if (
        checkIn !== null &&
        checkOut !== null &&
        checkOut >= checkIn
    ) {

        officeMinutes =
            checkOut - checkIn;

    }


    /* ==========================================
       LUNCH BREAK
    =========================================== */

    if (
        lunchStart !== null &&
        lunchEnd !== null &&
        lunchEnd >= lunchStart
    ) {

        lunchMinutes =
            lunchEnd - lunchStart;

    }


    /* ==========================================
       WORKING HOURS
    =========================================== */

    workingMinutes =
        Math.max(
            officeMinutes -
            lunchMinutes,
            0
        );


    /* ==========================================
       DISPLAY
    =========================================== */

    if (officeHoursElement) {

        officeHoursElement.textContent =
            formatDuration(
                officeMinutes
            );

    }


    if (lunchBreakElement) {

        lunchBreakElement.textContent =
            formatDuration(
                lunchMinutes
            );

    }


    if (workingHoursElement) {

        workingHoursElement.textContent =
            formatDuration(
                workingMinutes
            );

    }


    return {

        officeMinutes,

        lunchMinutes,

        workingMinutes,

        officeHours:
            formatDuration(
                officeMinutes
            ),

        lunchBreak:
            formatDuration(
                lunchMinutes
            ),

        workingHours:
            formatDuration(
                workingMinutes
            )

    };

}


/* =====================================================
   TASK INPUT
===================================================== */

function setupTaskInput() {

    if (!taskInput) {

        return;

    }


    /*
     * First click / focus
     */

    taskInput.addEventListener(
        "focus",
        function () {

            if (
                taskInput.value.trim() === ""
            ) {

                taskInput.value =
                    "• ";

                moveCursorToEnd();

            }


            updateTaskCount();

        }
    );


    /*
     * ENTER
     */

    taskInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            /*
             * IMPORTANT:
             *
             * Enter should NOT submit
             * the form.
             */

            event.preventDefault();


            const start =
                taskInput.selectionStart;


            const end =
                taskInput.selectionEnd;


            const value =
                taskInput.value;


            const before =
                value.substring(
                    0,
                    start
                );


            const after =
                value.substring(
                    end
                );


            /*
             * Always create
             * new bullet line.
             */

            const insertText =
                "\n• ";


            taskInput.value =
                before +
                insertText +
                after;


            /*
             * Put cursor after bullet.
             */

            const newPosition =
                before.length +
                insertText.length;


            taskInput.selectionStart =
                newPosition;

            taskInput.selectionEnd =
                newPosition;


            updateTaskCount();

        }
    );


    /*
     * Normal typing
     */

    taskInput.addEventListener(
        "input",
        function () {

            updateTaskCount();

        }
    );

}


/* =====================================================
   MOVE CURSOR END
===================================================== */

function moveCursorToEnd() {

    if (!taskInput) {

        return;

    }


    const position =
        taskInput.value.length;


    taskInput.selectionStart =
        position;

    taskInput.selectionEnd =
        position;

}


/* =====================================================
   GET TASKS
===================================================== */

function getTasks() {

    if (!taskInput) {

        return [];

    }


    return taskInput.value
        .split(/\r?\n/)
        .map(
            function (line) {

                return line
                    .replace(
                        /^•\s*/,
                        ""
                    )
                    .trim();

            }
        )
        .filter(
            function (task) {

                return task.length > 0;

            }
        );

}


/* =====================================================
   TASK COUNT
===================================================== */

function updateTaskCount() {

    const tasks =
        getTasks();


    if (!taskCount) {

        return;

    }


    if (tasks.length === 1) {

        taskCount.textContent =
            "1 Task";

    }

    else {

        taskCount.textContent =
            `${tasks.length} Tasks`;

    }

}


/* =====================================================
   VALIDATION
===================================================== */

function validateForm() {

    if (
        !employeeSelect ||
        !employeeSelect.value
    ) {

        alert(
            "Please select an employee."
        );

        employeeSelect?.focus();

        return false;

    }


    if (
        !dateInput ||
        !dateInput.value
    ) {

        alert(
            "Please select the date."
        );

        dateInput?.focus();

        return false;

    }


    if (
        !checkInInput ||
        !checkInInput.value
    ) {

        alert(
            "Check-in time is mandatory."
        );

        checkInInput?.focus();

        return false;

    }


    if (
        !lunchStartInput ||
        !lunchStartInput.value
    ) {

        alert(
            "Lunch start time is mandatory."
        );

        lunchStartInput?.focus();

        return false;

    }


    if (
        !lunchEndInput ||
        !lunchEndInput.value
    ) {

        alert(
            "Lunch end time is mandatory."
        );

        lunchEndInput?.focus();

        return false;

    }


    if (
        !checkOutInput ||
        !checkOutInput.value
    ) {

        alert(
            "Check-out time is mandatory."
        );

        checkOutInput?.focus();

        return false;

    }


    const tasks =
        getTasks();


    if (!tasks.length) {

        alert(
            "Please enter at least one task."
        );

        taskInput?.focus();

        return false;

    }


    const checkIn =
        timeToMinutes(
            checkInInput.value
        );


    const lunchStart =
        timeToMinutes(
            lunchStartInput.value
        );


    const lunchEnd =
        timeToMinutes(
            lunchEndInput.value
        );


    const checkOut =
        timeToMinutes(
            checkOutInput.value
        );


    if (
        checkOut < checkIn
    ) {

        alert(
            "Check-out time cannot be earlier than Check-in."
        );

        checkOutInput.focus();

        return false;

    }


    if (
        lunchEnd < lunchStart
    ) {

        alert(
            "Lunch end cannot be earlier than Lunch start."
        );

        lunchEndInput.focus();

        return false;

    }


    if (
        lunchStart < checkIn ||
        lunchEnd > checkOut
    ) {

        alert(
            "Lunch time must be within office hours."
        );

        return false;

    }


    return true;

}


/* =====================================================
   SAVE
===================================================== */

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        saveTimesheet
    );

}


function saveTimesheet() {

    if (!validateForm()) {

        return;

    }


    const hours =
        calculateHours();


    const tasks =
        getTasks();


    const selectedEmployee =
        employeeSelect.options[
            employeeSelect.selectedIndex
        ];


    const employeeName =
        selectedEmployee.textContent;


    const record = {

        id:
            editingId ||
            Date.now().toString(),

        employeeId:
            employeeSelect.value,

        employee:
            employeeName,

        date:
            dateInput.value,

        checkIn:
            checkInInput.value,

        lunchStart:
            lunchStartInput.value,

        lunchEnd:
            lunchEndInput.value,

        checkOut:
            checkOutInput.value,

        officeMinutes:
            hours.officeMinutes,

        lunchMinutes:
            hours.lunchMinutes,

        workingMinutes:
            hours.workingMinutes,

        officeHours:
            hours.officeHours,

        lunchBreak:
            hours.lunchBreak,

        workingHours:
            hours.workingHours,

        tasks:
            tasks,

        totalTask:
            tasks.length,

        createdAt:
            new Date().toISOString()

    };


    let records =
        getStoredRecords();


    if (editingId) {

        records =
            records.map(
                function (item) {

                    return item.id === editingId
                        ? record
                        : item;

                }
            );

    }

    else {

        records.push(
            record
        );

    }


    saveStoredRecords(
        records
    );


    alert(
        editingId
            ? "Timesheet updated successfully."
            : "Timesheet saved successfully."
    );


    editingId = null;


    resetForm();


    renderRecords();

}


/* =====================================================
   GET STORAGE
===================================================== */

function getStoredRecords() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!data) {

            return [];

        }


        const records =
            JSON.parse(
                data
            );


        return Array.isArray(
            records
        )
            ? records
            : [];

    }

    catch (error) {

        console.error(
            "Storage read error:",
            error
        );

        return [];

    }

}


/* =====================================================
   SAVE STORAGE
===================================================== */

function saveStoredRecords(
    records
) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            records
        )
    );

}


/* =====================================================
   LOAD RECORDS
===================================================== */

function loadRecords() {

    renderRecords();

}


/* =====================================================
   RENDER RECORDS
===================================================== */

function renderRecords() {

    if (!timesheetTable) {

        return;

    }


    const records =
        getStoredRecords();


    timesheetTable.innerHTML =
        "";


    if (!records.length) {

        if (emptyState) {

            emptyState.style.display =
                "block";

        }

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    records
        .slice()
        .reverse()
        .forEach(
            function (record) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const taskHTML =
                    (record.tasks || [])
                        .map(
                            function (task) {

                                return `
                                    <span class="record-task">
                                        • ${escapeHTML(task)}
                                    </span>
                                `;

                            }
                        )
                        .join("");


                row.innerHTML = `

                    <td>

                        <strong>
                            ${escapeHTML(
                                record.employee
                            )}
                        </strong>

                    </td>


                    <td>

                        ${formatDate(
                            record.date
                        )}

                    </td>


                    <td>

                        <div class="record-tasks">

                            ${taskHTML}

                        </div>

                    </td>


                    <td>

                        <span
                            class="total-task-badge">

                            ${record.totalTask || 0}

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            record.officeHours || "0h 0m"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            record.workingHours || "0h 0m"
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            record.lunchBreak || "0h 0m"
                        )}

                    </td>


                    <td>

                        <div class="record-actions">


                            <button
                                type="button"
                                class="record-action edit-action"
                                title="Edit"
                                onclick="editRecord('${record.id}')">

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                type="button"
                                class="record-action delete-action"
                                title="Delete"
                                onclick="deleteRecord('${record.id}')">

                                <i class="fa-solid fa-trash"></i>

                            </button>


                        </div>

                    </td>

                `;


                timesheetTable.appendChild(
                    row
                );

            }
        );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(
    dateString
) {

    if (!dateString) {

        return "-";

    }


    const parts =
        dateString.split("-");


    if (
        parts.length !== 3
    ) {

        return dateString;

    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =====================================================
   EDIT RECORD
===================================================== */

function editRecord(
    id
) {

    const records =
        getStoredRecords();


    const record =
        records.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!record) {

        return;

    }


    editingId =
        id;


    employeeSelect.value =
        record.employeeId;


    dateInput.value =
        record.date;


    checkInInput.value =
        record.checkIn;


    lunchStartInput.value =
        record.lunchStart;


    lunchEndInput.value =
        record.lunchEnd;


    checkOutInput.value =
        record.checkOut;


    taskInput.value =
        (record.tasks || [])
            .map(
                function (task) {

                    return `• ${task}`;

                }
            )
            .join("\n");


    calculateHours();

    updateTaskCount();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =====================================================
   DELETE RECORD
===================================================== */

function deleteRecord(
    id
) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this timesheet?"
        );


    if (!confirmDelete) {

        return;

    }


    const records =
        getStoredRecords()
            .filter(
                function (record) {

                    return record.id !== id;

                }
            );


    saveStoredRecords(
        records
    );


    if (
        editingId === id
    ) {

        editingId = null;

        resetForm();

    }


    renderRecords();

}


/* =====================================================
   CLEAR
===================================================== */

if (clearBtn) {

    clearBtn.addEventListener(
        "click",
        function () {

            const shouldClear =
                confirm(
                    "Clear all entered timesheet details?"
                );


            if (!shouldClear) {

                return;

            }


            editingId = null;

            resetForm();

        }
    );

}


/* =====================================================
   RESET FORM
===================================================== */

function resetForm() {

    employeeSelect.value =
        "";


    setToday();


    checkInInput.value =
        "";


    lunchStartInput.value =
        "";


    lunchEndInput.value =
        "";


    checkOutInput.value =
        "";


    taskInput.value =
        "";


    officeHoursElement.textContent =
        "0h 0m";


    lunchBreakElement.textContent =
        "0h 0m";


    workingHoursElement.textContent =
        "0h 0m";


    updateTaskCount();

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text == null
            ? ""
            : String(text);


    return div.innerHTML;

}


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.editRecord =
    editRecord;

window.deleteRecord =
    deleteRecord;

window.saveTimesheet =
    saveTimesheet;