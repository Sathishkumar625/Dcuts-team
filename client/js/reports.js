/* =====================================================
   THE D CUTS
   TIMESHEET REPORTS
   ADMIN ONLY

   TASK DISPLAY:
   - NO 1,2,3 NUMBERING
   - PRESERVE ORIGINAL TASK TEXT
   - PRESERVE LINE BREAKS
   - PRESERVE SPACING
===================================================== */


/* =====================================================
   API
===================================================== */

const API = "/api";


/* =====================================================
   TOKEN
===================================================== */

function getToken() {

    return (
        localStorage.getItem("token") ||
        ""
    );

}


/* =====================================================
   AUTH HEADERS
===================================================== */

function authHeaders() {

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${getToken()}`

    };

}


/* =====================================================
   ADMIN CHECK
===================================================== */

function checkAdmin() {

    const role =
        String(
            localStorage.getItem("role") || ""
        )
        .toLowerCase()
        .trim();


    const token =
        getToken();


    if (
        !token ||
        role !== "admin"
    ) {

        window.location.href =
            "../login.html";

        return false;

    }


    return true;

}


/* =====================================================
   PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        if (!checkAdmin()) {

            return;

        }


        loadReports();


        const refreshButton =
            document.getElementById(
                "refreshReportsBtn"
            );


        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadReports
            );

        }

    }
);


/* =====================================================
   LOAD REPORTS
===================================================== */

async function loadReports() {

    const tableBody =
        document.getElementById(
            "reportTableBody"
        );


    const status =
        document.getElementById(
            "reportStatus"
        );


    if (!tableBody) {

        return;

    }


    tableBody.innerHTML = `

        <tr>

            <td
                colspan="7"
                class="loading-cell">

                Loading Timesheet Records...

            </td>

        </tr>

    `;


    if (status) {

        status.innerText =
            "Loading...";

    }


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
            "REPORT STATUS:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "REPORT DATA:",
            data
        );


        /* =========================================
           SESSION EXPIRED
        ========================================== */

        if (
            response.status === 401
        ) {

            alert(
                "Session expired. Please login again."
            );


            window.location.href =
                "../login.html";


            return;

        }


        /* =========================================
           API ERROR
        ========================================== */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load reports."
            );

        }


        const records =
            Array.isArray(
                data.timesheets
            )
                ? data.timesheets
                : [];


        /* =========================================
           SUMMARY
        ========================================== */

        updateSummary(
            records
        );


        /* =========================================
           EMPTY
        ========================================== */

        if (
            records.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="empty-cell">

                        <i class="fa-regular fa-file-lines"></i>

                        <br><br>

                        No Timesheet Records Found

                    </td>

                </tr>

            `;


            if (status) {

                status.innerText =
                    "0 Records";

            }


            return;

        }


        /* =========================================
           CLEAR TABLE
        ========================================== */

        tableBody.innerHTML =
            "";


        /* =========================================
           RENDER RECORDS
        ========================================== */

        records.forEach(
            function (item) {


                /* =================================
                   EMPLOYEE
                ================================= */

                let employeeName =
                    "Unknown";


                let employeeId =
                    "";


                if (
                    item.employee &&
                    typeof item.employee ===
                    "object"
                ) {

                    employeeName =
                        item.employee.name ||
                        item.employee.employeeName ||
                        item.employee.email ||
                        "Unknown";


                    employeeId =
                        item.employee.employeeId ||
                        "";

                }


                else if (
                    item.employeeName
                ) {

                    employeeName =
                        item.employeeName;

                }


                else if (
                    typeof item.employee ===
                    "string"
                ) {

                    employeeName =
                        item.employee;

                }


                /*
                   Employee display:

                   01 - Naveen
                   02 - Sathish

                   if ID exists.
                */

                const employeeDisplay =
                    employeeId
                        ? `${employeeId} - ${employeeName}`
                        : employeeName;



                /* =================================
                   DATE
                ================================= */

                let formattedDate =
                    "-";


                if (item.date) {

                    const date =
                        new Date(
                            item.date
                        );


                    if (
                        !isNaN(
                            date.getTime()
                        )
                    ) {

                        formattedDate =
                            date.toLocaleDateString(
                                "en-IN",
                                {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric"
                                }
                            );

                    }

                }



                /* =================================
                   TASKS
                ================================= */

                const taskText =
                    getOriginalTaskText(
                        item
                    );


                /* =================================
                   OFFICE HOURS
                ================================= */

                const officeHours =
                    item.officeHours ||
                    calculateHoursText(
                        item.officeMinutes
                    );



                /* =================================
                   WORKING HOURS
                ================================= */

                const workingHours =
                    item.workingHours ||
                    calculateHoursText(
                        item.workingMinutes
                    );



                /* =================================
                   LUNCH HOURS
                ================================= */

                const lunchHours =
                    item.lunchHours ||
                    calculateHoursText(
                        item.lunchMinutes
                    );



                /* =================================
                   COMMENTS
                ================================= */

                const comments =
                    item.comments ||
                    "-";



                /* =================================
                   TASK BOX
                ================================= */

                const taskBoxHtml =
                    taskText
                        ? `

                            <div class="report-task-box">

                                <div class="report-task-content">

                                    ${escapeHtml(
                                        taskText
                                    )}

                                </div>

                            </div>

                        `
                        : `

                            <div class="empty-task-box">

                                No Task Entered

                            </div>

                        `;



                /* =================================
                   ROW
                ================================= */

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <!-- EMPLOYEE -->

                    <td>

                        <strong
                            class="employee-report-name">

                            ${escapeHtml(
                                employeeDisplay
                            )}

                        </strong>

                    </td>


                    <!-- DATE -->

                    <td>

                        ${escapeHtml(
                            formattedDate
                        )}

                    </td>


                    <!-- TOTAL TASK -->

                    <td class="task-report-cell">

                        ${taskBoxHtml}

                    </td>


                    <!-- OFFICE HOURS -->

                    <td>

                        ${escapeHtml(
                            officeHours
                        )}

                    </td>


                    <!-- WORKING HOURS -->

                    <td>

                        ${escapeHtml(
                            workingHours
                        )}

                    </td>


                    <!-- LUNCH -->

                    <td>

                        ${escapeHtml(
                            lunchHours
                        )}

                    </td>


                    <!-- COMMENTS -->

                    <td>

                        <span
                            class="comment-text"
                            title="${escapeHtml(
                                comments
                            )}">

                            ${escapeHtml(
                                comments
                            )}

                        </span>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


        /* =========================================
           STATUS
        ========================================== */

        if (status) {

            status.innerText =
                `${records.length} Records`;

        }

    }


    catch (error) {

        console.error(
            "REPORT LOAD ERROR:",
            error
        );


        tableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="error-cell">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <br><br>

                    Unable to load Timesheet Records.

                    <br><br>

                    Please try again.

                </td>

            </tr>

        `;


        if (status) {

            status.innerText =
                "Error";

        }

    }

}



/* =====================================================
   GET ORIGINAL TASK TEXT
=====================================================

   Timesheet stores the entire textarea as ONE TASK.

   Example:

   Today Task :-

   > DRT 3 videos

   Others Task :-

   > SRG video shoot

   We do NOT split it.
   We do NOT number it.
   We display it exactly as saved.
===================================================== */

function getOriginalTaskText(item) {

    /* =========================================
       CASE 1
       tasks array
    ========================================== */

    if (
        Array.isArray(
            item.tasks
        ) &&
        item.tasks.length > 0
    ) {

        /*
           IMPORTANT:

           Use only the FIRST task because
           the entire textarea is ONE task.
        */

        const firstTask =
            item.tasks[0];


        if (
            typeof firstTask ===
            "string"
        ) {

            return normalizeTaskText(
                firstTask
            );

        }


        if (
            firstTask &&
            typeof firstTask ===
            "object"
        ) {

            return normalizeTaskText(

                firstTask.taskName ||
                firstTask.name ||
                firstTask.title ||
                ""

            );

        }

    }



    /* =========================================
       CASE 2
       direct taskName
    ========================================== */

    if (
        item.taskName
    ) {

        return normalizeTaskText(
            item.taskName
        );

    }



    /* =========================================
       CASE 3
       task
    ========================================== */

    if (
        typeof item.task ===
        "string"
    ) {

        return normalizeTaskText(
            item.task
        );

    }



    /* =========================================
       CASE 4
       tasksText
    ========================================== */

    if (
        item.tasksText
    ) {

        return normalizeTaskText(
            item.tasksText
        );

    }



    return "";

}



/* =====================================================
   NORMALIZE TASK TEXT
=====================================================

   IMPORTANT:

   We do NOT split lines.

   We do NOT add numbers.

   We keep the user's original text.

===================================================== */

function normalizeTaskText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim();

}



/* =====================================================
   HOURS FORMAT
===================================================== */

function calculateHoursText(
    minutes
) {

    const total =
        Number(minutes);


    if (
        !Number.isFinite(total) ||
        total < 0
    ) {

        return "0h 0m";

    }


    const rounded =
        Math.floor(total);


    const hours =
        Math.floor(
            rounded / 60
        );


    const mins =
        rounded % 60;


    return `${hours}h ${mins}m`;

}



/* =====================================================
   SUMMARY
===================================================== */

function updateSummary(
    records
) {

    let totalVideos =
        0;


    let completedVideos =
        0;


    let balanceVideos =
        0;


    records.forEach(
        function (item) {

            const total =
                Number(
                    item.totalVideos
                ) || 0;


            const completed =
                Number(
                    item.completedVideos
                ) || 0;


            const balance =
                Number(
                    item.balanceVideos
                ) ||
                Math.max(
                    total -
                    completed,
                    0
                );


            totalVideos +=
                total;


            completedVideos +=
                completed;


            balanceVideos +=
                balance;

        }
    );


    const totalEntries =
        document.getElementById(
            "totalEntries"
        );


    const totalVideosElement =
        document.getElementById(
            "totalVideos"
        );


    const completedVideosElement =
        document.getElementById(
            "completedVideos"
        );


    const balanceVideosElement =
        document.getElementById(
            "balanceVideos"
        );


    if (totalEntries) {

        totalEntries.innerText =
            records.length;

    }


    if (totalVideosElement) {

        totalVideosElement.innerText =
            totalVideos;

    }


    if (completedVideosElement) {

        completedVideosElement.innerText =
            completedVideos;

    }


    if (balanceVideosElement) {

        balanceVideosElement.innerText =
            balanceVideos;

    }

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