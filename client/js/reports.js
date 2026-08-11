/* =====================================================
   THE D CUTS
   TIMESHEET REPORTS
   ADMIN ONLY
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
        localStorage.getItem("token") || ""
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


    if (!token || role !== "admin") {

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
                colspan="8"
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


        /* -----------------------------------------
           SESSION EXPIRED
        ----------------------------------------- */

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


        /* -----------------------------------------
           ERROR
        ----------------------------------------- */

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
            data.timesheets || [];


        /* -----------------------------------------
           SUMMARY
        ----------------------------------------- */

        updateSummary(
            records
        );


        /* -----------------------------------------
           EMPTY
        ----------------------------------------- */

        if (
            records.length === 0
        ) {

            tableBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
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


        /* -----------------------------------------
           TABLE
        ----------------------------------------- */

        tableBody.innerHTML =
            "";


        records.forEach(
            function (
                item,
                index
            ) {


                let employeeName =
                    "Unknown";


                /* ---------------------------------
                   POPULATED EMPLOYEE OBJECT
                --------------------------------- */

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

                }


                /* ---------------------------------
                   EMPLOYEE NAME
                --------------------------------- */

                else if (
                    item.employeeName
                ) {

                    employeeName =
                        item.employeeName;

                }


                /* ---------------------------------
                   DATE
                --------------------------------- */

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
                                "en-IN"
                            );

                    }

                }


                /* ---------------------------------
                   PROJECT
                --------------------------------- */

                const project =
                    item.project ||
                    item.projectName ||
                    "-";


                /* ---------------------------------
                   VIDEOS
                --------------------------------- */

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
                        total - completed,
                        0
                    );


                /* ---------------------------------
                   COMMENTS
                --------------------------------- */

                const comments =
                    item.comments ||
                    "-";


                /* ---------------------------------
                   ROW
                --------------------------------- */

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        ${index + 1}

                    </td>


                    <td>

                        <strong>

                            ${escapeHtml(
                                employeeName
                            )}

                        </strong>

                    </td>


                    <td>

                        ${escapeHtml(
                            formattedDate
                        )}

                    </td>


                    <td>

                        <span
                            class="project-badge">

                            ${escapeHtml(
                                project
                            )}

                        </span>

                    </td>


                    <td>

                        ${total}

                    </td>


                    <td>

                        <span
                            class="completed-badge">

                            ${completed}

                        </span>

                    </td>


                    <td>

                        <span
                            class="balance-badge">

                            ${balance}

                        </span>

                    </td>


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
                    colspan="8"
                    class="error-cell">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <br><br>

                    Unable to load Timesheet Records.

                    <br>

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
   SUMMARY
===================================================== */

function updateSummary(
    records
) {

    let totalVideos = 0;

    let completedVideos = 0;

    let balanceVideos = 0;


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
                    total - completed,
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