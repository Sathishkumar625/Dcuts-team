/* =========================================================
   THE D CUTS
   PROFESSIONAL REPORTS CONTROLLER
   TIMESHEET REPORTS
========================================================= */

"use strict";


/* =========================================================
   API CONFIG
========================================================= */

const REPORTS_API_BASE =
    window.API_BASE_URL ||
    window.apiBaseUrl ||
    "/api";


const TIMESHEET_API =
    `${REPORTS_API_BASE}/timesheets`;


/* =========================================================
   STATE
========================================================= */

let allReports = [];

let filteredReports = [];

let currentReport = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeReportsPage();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeReportsPage() {

    bindReportEvents();

    loadReports();

}


/* =========================================================
   EVENTS
========================================================= */

function bindReportEvents() {


    /* Refresh */

    const refreshButton =
        document.getElementById(
            "refreshReports"
        );

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadReports
        );

    }


    /* Search */

    const searchInput =
        document.getElementById(
            "reportSearch"
        );

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            applyFilters
        );

    }


    /* Employee */

    const employeeFilter =
        document.getElementById(
            "employeeFilter"
        );

    if (employeeFilter) {

        employeeFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    /* Client */

    const clientFilter =
        document.getElementById(
            "clientFilter"
        );

    if (clientFilter) {

        clientFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    /* Status */

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    /* Date */

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );

    if (dateFilter) {

        dateFilter.addEventListener(
            "change",
            applyFilters
        );

    }


    /* Clear */

    const clearButton =
        document.getElementById(
            "clearFilters"
        );

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    /* Empty clear */

    const emptyClearButton =
        document.getElementById(
            "emptyClearFilters"
        );

    if (emptyClearButton) {

        emptyClearButton.addEventListener(
            "click",
            clearFilters
        );

    }


    /* CSV */

    const exportButton =
        document.getElementById(
            "exportCSV"
        );

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportCSV
        );

    }


    /* Print */

    const printButton =
        document.getElementById(
            "printReport"
        );

    if (printButton) {

        printButton.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

    }


    /* Modal close */

    const closeModal =
        document.getElementById(
            "closeModal"
        );

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeReportModal
        );

    }


    /* Modal overlay */

    const overlay =
        document.querySelector(
            ".modal-overlay"
        );

    if (overlay) {

        overlay.addEventListener(
            "click",
            closeReportModal
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeReportModal();

            }

        }
    );

}


/* =========================================================
   LOAD REPORTS
========================================================= */

async function loadReports() {

    showLoading();

    try {

        const response =
            await fetch(
                TIMESHEET_API,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await parseJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data?.message ||
                `Failed to load reports (${response.status})`
            );

        }


        allReports =
            normalizeReports(
                data
            );


        populateEmployeeFilter(
            allReports
        );


        populateClientFilter(
            allReports
        );


        applyFilters();


    }

    catch (error) {

        console.error(
            "LOAD REPORTS ERROR:",
            error
        );


        allReports = [];

        filteredReports = [];


        updateSummary([]);


        renderReports([]);


        showToast(
            error.message ||
            "Failed to load reports.",
            "error"
        );

    }

}


/* =========================================================
   RESPONSE PARSER
========================================================= */

async function parseJSONResponse(
    response
) {

    const text =
        await response.text();


    if (!text) {

        return {};

    }


    try {

        return JSON.parse(text);

    }

    catch {

        return {

            message:
                text

        };

    }

}


/* =========================================================
   NORMALIZE REPORT DATA
========================================================= */

function normalizeReports(
    data
) {

    let reports = [];


    if (
        Array.isArray(data)
    ) {

        reports = data;

    }

    else if (
        Array.isArray(
            data?.timesheets
        )
    ) {

        reports =
            data.timesheets;

    }

    else if (
        Array.isArray(
            data?.reports
        )
    ) {

        reports =
            data.reports;

    }

    else if (
        Array.isArray(
            data?.data
        )
    ) {

        reports =
            data.data;

    }


    return reports.map(
        normalizeReport
    );

}


/* =========================================================
   NORMALIZE SINGLE REPORT
========================================================= */

function normalizeReport(
    report
) {

    const employee =
        report?.employee &&
        typeof report.employee === "object"
            ? report.employee
            : null;


    const tasks =
        Array.isArray(
            report?.tasks
        )
            ? report.tasks
            : [];


    const totalVideos =
        Math.max(
            Number(
                report?.totalVideos
            ) || 0,
            0
        );


    const completedVideos =
        Math.max(
            Number(
                report?.completedVideos
            ) || 0,
            0
        );


    const balanceVideos =
        Math.max(
            totalVideos -
            completedVideos,
            0
        );


    return {

        ...report,

        employee,

        employeeId:
            employee?.employeeId ||
            employee?.id ||
            report?.employeeId ||
            "",

        employeeName:
            employee?.name ||
            report?.employeeName ||
            "Unknown Employee",

        employeeEmail:
            employee?.email ||
            "",

        employeeDepartment:
            employee?.department ||
            "",

        employeeDesignation:
            employee?.designation ||
            "",

        employeeRole:
            employee?.role ||
            "",

        project:
            report?.projectName ||
            getProjectName(
                report?.project
            ) ||
            "",

        client:
            report?.clientName ||
            getClientName(
                report?.client
            ) ||
            getClientName(
                report?.project
            ) ||
            "",

        taskText:
            tasks
                .map(
                    task =>
                        task?.taskName ||
                        task?.task ||
                        ""
                )
                .filter(Boolean)
                .join(", "),

        totalVideos,

        completedVideos,

        balanceVideos,

        status:
            report?.status ||
            "Pending",

        workingMinutes:
            Number(
                report?.workingMinutes
            ) || 0,

        officeMinutes:
            Number(
                report?.officeMinutes
            ) || 0,

        lunchMinutes:
            Number(
                report?.lunchMinutes
            ) || 0

    };

}


/* =========================================================
   PROJECT NAME
========================================================= */

function getProjectName(
    project
) {

    if (!project) {

        return "";

    }


    if (
        typeof project === "string"
    ) {

        return project;

    }


    return (
        project?.name ||
        project?.projectName ||
        project?.title ||
        project?.code ||
        ""
    );

}


/* =========================================================
   CLIENT NAME
========================================================= */

function getClientName(
    client
) {

    if (!client) {

        return "";

    }


    if (
        typeof client === "string"
    ) {

        return client;

    }


    return (
        client?.name ||
        client?.clientName ||
        client?.code ||
        ""
    );

}


/* =========================================================
   FILTER OPTIONS
========================================================= */

function populateEmployeeFilter(
    reports
) {

    const select =
        document.getElementById(
            "employeeFilter"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const employees =
        new Map();


    reports.forEach(
        report => {

            const id =
                report.employee?._id ||
                report.employeeId ||
                report.employeeName;


            if (!id) {

                return;

            }


            employees.set(
                String(id),
                report.employeeName
            );

        }
    );


    select.innerHTML = `

        <option value="">
            All Employees
        </option>

    `;


    [...employees.entries()]
        .sort(
            (a, b) =>
                a[1].localeCompare(
                    b[1]
                )
        )
        .forEach(
            ([id, name]) => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    id;

                option.textContent =
                    name;


                select.appendChild(
                    option
                );

            }
        );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   CLIENT FILTER
========================================================= */

function populateClientFilter(
    reports
) {

    const select =
        document.getElementById(
            "clientFilter"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const clients =
        new Set();


    reports.forEach(
        report => {

            if (
                report.client
            ) {

                clients.add(
                    report.client
                );

            }

        }
    );


    select.innerHTML = `

        <option value="">
            All Clients
        </option>

    `;


    [...clients]
        .sort(
            (a, b) =>
                a.localeCompare(b)
        )
        .forEach(
            client => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    client;

                option.textContent =
                    client;


                select.appendChild(
                    option
                );

            }
        );


    if (
        [...select.options]
            .some(
                option =>
                    option.value ===
                    currentValue
            )
    ) {

        select.value =
            currentValue;

    }

}


/* =========================================================
   APPLY FILTERS
========================================================= */

function applyFilters() {

    const search =
        (
            document.getElementById(
                "reportSearch"
            )?.value ||
            ""
        )
            .trim()
            .toLowerCase();


    const employee =
        document.getElementById(
            "employeeFilter"
        )?.value ||
        "";


    const client =
        document.getElementById(
            "clientFilter"
        )?.value ||
        "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value ||
        "";


    const selectedDate =
        document.getElementById(
            "dateFilter"
        )?.value ||
        "";


    filteredReports =
        allReports.filter(
            report => {


                /* SEARCH */

                if (search) {

                    const searchText = [

                        report.employeeId,

                        report.employeeName,

                        report.employeeEmail,

                        report.employeeDepartment,

                        report.employeeDesignation,

                        report.client,

                        report.project,

                        report.taskText,

                        report.comments,

                        report.status

                    ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !searchText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                /* EMPLOYEE */

                if (employee) {

                    const employeeId =
                        String(
                            report.employee?._id ||
                            report.employeeId ||
                            ""
                        );


                    if (
                        employeeId !==
                        String(employee)
                    ) {

                        return false;

                    }

                }


                /* CLIENT */

                if (client) {

                    if (
                        report.client !==
                        client
                    ) {

                        return false;

                    }

                }


                /* STATUS */

                if (status) {

                    if (
                        String(
                            report.status
                        ).toLowerCase() !==
                        String(
                            status
                        ).toLowerCase()
                    ) {

                        return false;

                    }

                }


                /* DATE */

                if (selectedDate) {

                    if (
                        formatDateInput(
                            report.date
                        ) !==
                        selectedDate
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    updateSummary(
        filteredReports
    );


    renderReports(
        filteredReports
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {

    const searchInput =
        document.getElementById(
            "reportSearch"
        );

    const employeeFilter =
        document.getElementById(
            "employeeFilter"
        );

    const clientFilter =
        document.getElementById(
            "clientFilter"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );


    if (searchInput) {

        searchInput.value = "";

    }


    if (employeeFilter) {

        employeeFilter.value = "";

    }


    if (clientFilter) {

        clientFilter.value = "";

    }


    if (statusFilter) {

        statusFilter.value = "";

    }


    if (dateFilter) {

        dateFilter.value = "";

    }


    applyFilters();

}


/* =========================================================
   RENDER REPORTS
========================================================= */

function renderReports(
    reports
) {

    const tbody =
        document.getElementById(
            "reportTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = "";


    if (
        !reports.length
    ) {

        if (emptyState) {

            emptyState.classList.remove(
                "hidden"
            );

        }


        updateRecordInfo(
            0
        );


        return;

    }


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    reports.forEach(
        (report, index) => {

            tbody.appendChild(
                createReportRow(
                    report,
                    index
                )
            );

        }
    );


    updateRecordInfo(
        reports.length
    );

}


/* =========================================================
   CREATE TABLE ROW
========================================================= */

function createReportRow(
    report,
    index
) {

    const row =
        document.createElement(
            "tr"
        );


    const employeeId =
        escapeHTML(
            report.employeeId ||
            "-"
        );


    const employeeName =
        escapeHTML(
            report.employeeName ||
            "Unknown"
        );


    const initials =
        getInitials(
            report.employeeName
        );


    const date =
        formatDisplayDate(
            report.date
        );


    const client =
        escapeHTML(
            report.client ||
            "-"
        );


    const project =
        escapeHTML(
            report.project ||
            "-"
        );


    const taskText =
        escapeHTML(
            report.taskText ||
            "-"
        );


    const officeHours =
        report.officeHours ||
        formatMinutes(
            report.officeMinutes
        );


    const lunchHours =
        report.lunchHours ||
        formatMinutes(
            report.lunchMinutes
        );


    const workingHours =
        report.workingHours ||
        formatMinutes(
            report.workingMinutes
        );


    const status =
        report.status ||
        "Pending";


    const statusClass =
        getStatusClass(
            status
        );


    const balanceClass =
        Number(
            report.balanceVideos
        ) === 0
            ? "balance-zero"
            : "balance-number";


    const isPending =
        String(status)
            .toLowerCase()
            .trim() ===
        "pending";


    row.innerHTML = `

        <td>
            ${index + 1}
        </td>


        <td class="employee-id">
            ${employeeId}
        </td>


        <td>

            <div class="employee-cell">

                <div class="employee-avatar">
                    ${escapeHTML(initials)}
                </div>

                <div class="employee-info">

                    <strong>
                        ${employeeName}
                    </strong>

                    <small>
                        ${escapeHTML(
                            report.employeeDesignation ||
                            report.employeeDepartment ||
                            ""
                        )}
                    </small>

                </div>

            </div>

        </td>


        <td>
            ${date}
        </td>


        <td>

            <span class="client-badge">
                ${client}
            </span>

        </td>


        <td class="project-name">
            ${project}
        </td>


        <td>

            <div class="task-details">
                ${taskText}
            </div>

        </td>


        <td class="number-cell total-number">
            ${report.totalVideos}
        </td>


        <td class="number-cell completed-number">
            ${report.completedVideos}
        </td>


        <td class="number-cell ${balanceClass}">
            ${report.balanceVideos}
        </td>


        <td class="hours-cell">
            ${escapeHTML(officeHours)}
        </td>


        <td class="hours-cell">
            ${escapeHTML(lunchHours)}
        </td>


        <td class="hours-cell">
            ${escapeHTML(workingHours)}
        </td>


        <td>

            <span class="status-badge ${statusClass}">
                ${escapeHTML(status)}
            </span>

        </td>


        <td>

            <div class="row-actions">

                <!-- VIEW -->

                <button
                    type="button"
                    class="row-action view-action"
                    title="View"
                    data-action="view"
                    data-id="${escapeHTML(
                        String(report._id || "")
                    )}"
                >

                    <i class="fa-solid fa-eye"></i>

                </button>


                <!-- EDIT -->

                <button
                    type="button"
                    class="row-action edit-action"
                    title="Edit"
                    data-action="edit"
                    data-id="${escapeHTML(
                        String(report._id || "")
                    )}"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <!-- APPROVE -->

                ${
                    isPending
                        ? `
                            <button
                                type="button"
                                class="row-action approve-action"
                                title="Approve"
                                data-action="approve"
                                data-id="${escapeHTML(
                                    String(report._id || "")
                                )}"
                            >

                                <i class="fa-solid fa-circle-check"></i>

                            </button>
                        `
                        : ""
                }


                <!-- DELETE -->

                <button
                    type="button"
                    class="row-action delete-action"
                    title="Delete"
                    data-action="delete"
                    data-id="${escapeHTML(
                        String(report._id || "")
                    )}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    row.querySelectorAll(
        "[data-action]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;

                    const id =
                        button.dataset.id;


                    handleRowAction(
                        action,
                        id
                    );

                }
            );

        }
    );


    return row;

}


/* =========================================================
   ROW ACTION
========================================================= */

async function handleRowAction(
    action,
    id
) {

    const report =
        allReports.find(
            item =>
                String(item._id) ===
                String(id)
        );


    if (!report) {

        showToast(
            "Report not found.",
            "error"
        );

        return;

    }


    /* VIEW */

    if (
        action === "view"
    ) {

        openReportModal(
            report
        );

        return;

    }


    /* EDIT */

    if (
        action === "edit"
    ) {

        editReport(
            report
        );

        return;

    }


    /* APPROVE */

    if (
        action === "approve"
    ) {

        await approveReport(
            report
        );

        return;

    }


    /* DELETE */

    if (
        action === "delete"
    ) {

        await deleteReport(
            report
        );

    }

}


/* =========================================================
   APPROVE REPORT
========================================================= */

async function approveReport(
    report
) {

    if (!report?._id) {

        showToast(
            "Invalid report ID.",
            "error"
        );

        return;

    }


    const currentStatus =
        String(
            report.status ||
            "Pending"
        )
            .toLowerCase()
            .trim();


    if (
        currentStatus !==
        "pending"
    ) {

        showToast(
            "This report is already processed.",
            "warning"
        );

        return;

    }


    const employee =
        report.employeeName ||
        "this employee";


    const confirmed =
        window.confirm(
            `Approve this timesheet report for ${employee}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${TIMESHEET_API}/${encodeURIComponent(
                    report._id
                )}`,
                {

                    method:
                        "PUT",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            status:
                                "Approved"

                        })

                }
            );


        const data =
            await parseJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data?.message ||
                `Failed to approve report (${response.status})`
            );

        }


        showToast(
            "Report approved successfully.",
            "success"
        );


        await loadReports();

    }

    catch (error) {

        console.error(
            "APPROVE REPORT ERROR:",
            error
        );


        showToast(
            error.message ||
            "Failed to approve report.",
            "error"
        );

    }

}


/* =========================================================
   VIEW MODAL
========================================================= */

function openReportModal(
    report
) {

    currentReport =
        report;


    const modal =
        document.getElementById(
            "reportModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const content =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !content) {

        return;

    }


    if (title) {

        title.textContent =
            `${report.employeeName} - ${formatDisplayDate(report.date)}`;

    }


    const tasks =
        Array.isArray(
            report.tasks
        )
            ? report.tasks
                .map(
                    task =>
                        task?.taskName ||
                        task?.task ||
                        ""
                )
                .filter(Boolean)
                .join("<br>")
            : escapeHTML(
                report.taskText ||
                "-"
            );


    content.innerHTML = `

        <div class="modal-grid">


            <div class="modal-item">

                <span>
                    Employee ID
                </span>

                <strong>
                    ${escapeHTML(
                        report.employeeId ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Employee
                </span>

                <strong>
                    ${escapeHTML(
                        report.employeeName ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Email
                </span>

                <strong>
                    ${escapeHTML(
                        report.employeeEmail ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Department
                </span>

                <strong>
                    ${escapeHTML(
                        report.employeeDepartment ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Date
                </span>

                <strong>
                    ${formatDisplayDate(
                        report.date
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Client
                </span>

                <strong>
                    ${escapeHTML(
                        report.client ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Project
                </span>

                <strong>
                    ${escapeHTML(
                        report.project ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Status
                </span>

                <strong>
                    ${escapeHTML(
                        report.status ||
                        "Pending"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Check In
                </span>

                <strong>
                    ${escapeHTML(
                        report.checkIn ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Lunch Start
                </span>

                <strong>
                    ${escapeHTML(
                        report.lunchStart ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Lunch End
                </span>

                <strong>
                    ${escapeHTML(
                        report.lunchEnd ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Check Out
                </span>

                <strong>
                    ${escapeHTML(
                        report.checkOut ||
                        "-"
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Office Time
                </span>

                <strong>
                    ${escapeHTML(
                        report.officeHours ||
                        formatMinutes(
                            report.officeMinutes
                        )
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Lunch Time
                </span>

                <strong>
                    ${escapeHTML(
                        report.lunchHours ||
                        formatMinutes(
                            report.lunchMinutes
                        )
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Working Time
                </span>

                <strong>
                    ${escapeHTML(
                        report.workingHours ||
                        formatMinutes(
                            report.workingMinutes
                        )
                    )}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Total Videos
                </span>

                <strong>
                    ${report.totalVideos}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Completed Videos
                </span>

                <strong>
                    ${report.completedVideos}
                </strong>

            </div>


            <div class="modal-item">

                <span>
                    Balance Videos
                </span>

                <strong>
                    ${report.balanceVideos}
                </strong>

            </div>


            <div class="modal-item full">

                <span>
                    Tasks
                </span>

                <strong>
                    ${tasks || "-"}
                </strong>

            </div>


            <div class="modal-item full">

                <span>
                    Comments
                </span>

                <strong>
                    ${escapeHTML(
                        report.comments ||
                        "-"
                    )}
                </strong>

            </div>


        </div>

    `;


    modal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeReportModal() {

    const modal =
        document.getElementById(
            "reportModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";


    currentReport =
        null;

}


/* =========================================================
   EDIT
========================================================= */

function editReport(
    report
) {

    if (!report?._id) {

        showToast(
            "Invalid report ID.",
            "error"
        );

        return;

    }


    const target =
        `timesheet.html?edit=${encodeURIComponent(
            report._id
        )}`;


    window.location.href =
        target;

}


/* =========================================================
   DELETE
========================================================= */

async function deleteReport(
    report
) {

    if (!report?._id) {

        return;

    }


    const employee =
        report.employeeName ||
        "this employee";


    const confirmed =
        window.confirm(
            `Delete this timesheet report for ${employee}?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${TIMESHEET_API}/${encodeURIComponent(
                    report._id
                )}`,
                {

                    method:
                        "DELETE",

                    credentials:
                        "include",

                    headers: {

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        const data =
            await parseJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data?.message ||
                "Failed to delete report."
            );

        }


        allReports =
            allReports.filter(
                item =>
                    String(item._id) !==
                    String(report._id)
            );


        populateEmployeeFilter(
            allReports
        );


        populateClientFilter(
            allReports
        );


        applyFilters();


        showToast(
            "Report deleted successfully.",
            "success"
        );

    }

    catch (error) {

        console.error(
            "DELETE REPORT ERROR:",
            error
        );


        showToast(
            error.message ||
            "Failed to delete report.",
            "error"
        );

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(
    reports
) {

    const totalRecords =
        reports.length;


    const totalVideos =
        reports.reduce(
            (
                total,
                report
            ) =>
                total +
                Number(
                    report.totalVideos
                ),
            0
        );


    const completedVideos =
        reports.reduce(
            (
                total,
                report
            ) =>
                total +
                Number(
                    report.completedVideos
                ),
            0
        );


    const balanceVideos =
        reports.reduce(
            (
                total,
                report
            ) =>
                total +
                Number(
                    report.balanceVideos
                ),
            0
        );


    const workingMinutes =
        reports.reduce(
            (
                total,
                report
            ) =>
                total +
                Number(
                    report.workingMinutes
                ),
            0
        );


    setText(
        "totalRecords",
        totalRecords
    );


    setText(
        "totalVideos",
        totalVideos
    );


    setText(
        "completedVideos",
        completedVideos
    );


    setText(
        "balanceVideos",
        balanceVideos
    );


    setText(
        "workingHours",
        formatMinutes(
            workingMinutes
        )
    );

}


/* =========================================================
   RECORD INFO
========================================================= */

function updateRecordInfo(
    count
) {

    const element =
        document.getElementById(
            "recordInfo"
        );


    if (!element) {

        return;

    }


    element.textContent =
        `Showing ${count} ${
            count === 1
                ? "record"
                : "records"
        }`;

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    const tbody =
        document.getElementById(
            "reportTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (emptyState) {

        emptyState.classList.add(
            "hidden"
        );

    }


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="15"
                class="loading-row"
            >

                <div class="table-loader">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Loading reports...

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDisplayDate(
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
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   DATE INPUT FORMAT
========================================================= */

function formatDateInput(
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


    return `${year}-${month}-${day}`;

}


/* =========================================================
   FORMAT MINUTES
========================================================= */

function formatMinutes(
    minutes
) {

    minutes =
        Math.max(
            Number(minutes) || 0,
            0
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;

}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(
    status
) {

    const value =
        String(
            status || ""
        )
            .toLowerCase()
            .trim();


    if (
        value === "completed"
    ) {

        return "status-completed";

    }


    if (
        value === "approved"
    ) {

        return "status-approved";

    }


    if (
        value === "rejected"
    ) {

        return "status-rejected";

    }


    return "status-pending";

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {

        return "?";

    }


    const parts =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            String(value);

    }

}


/* =========================================================
   CSV EXPORT
========================================================= */

function exportCSV() {

    if (
        !filteredReports.length
    ) {

        showToast(
            "No reports available to export.",
            "warning"
        );

        return;

    }


    const headers = [

        "No",

        "Employee ID",

        "Employee",

        "Date",

        "Client",

        "Project",

        "Task Details",

        "Total Videos",

        "Completed Videos",

        "Balance Videos",

        "Office Hours",

        "Lunch Hours",

        "Working Hours",

        "Status",

        "Check In",

        "Lunch Start",

        "Lunch End",

        "Check Out",

        "Comments"

    ];


    const rows =
        filteredReports.map(
            (report, index) => [

                index + 1,

                report.employeeId,

                report.employeeName,

                formatDisplayDate(
                    report.date
                ),

                report.client,

                report.project,

                report.taskText,

                report.totalVideos,

                report.completedVideos,

                report.balanceVideos,

                report.officeHours ||
                    formatMinutes(
                        report.officeMinutes
                    ),

                report.lunchHours ||
                    formatMinutes(
                        report.lunchMinutes
                    ),

                report.workingHours ||
                    formatMinutes(
                        report.workingMinutes
                    ),

                report.status,

                report.checkIn,

                report.lunchStart,

                report.lunchEnd,

                report.checkOut,

                report.comments

            ]
        );


    const csv = [

        headers,

        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        csvEscape
                    )
                    .join(",")
        )
        .join("\r\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        `THE-D-CUTS-Report-${getTodayString()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "CSV exported successfully.",
        "success"
    );

}


/* =========================================================
   CSV ESCAPE
========================================================= */

function csvEscape(
    value
) {

    const text =
        String(
            value ??
            ""
        );


    if (
        /[",\r\n]/.test(text)
    ) {

        return `"${text.replace(
            /"/g,
            '""'
        )}"`;

    }


    return text;

}


/* =========================================================
   TODAY
========================================================= */

function getTodayString() {

    const date =
        new Date();


    return [

        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        )

    ].join("-");

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message,
    type = "info"
) {

    if (
        typeof window.showToast ===
        "function" &&
        window.showToast !==
        showToast
    ) {

        window.showToast(
            message,
            type
        );

        return;

    }


    let container =
        document.querySelector(
            ".toast-container"
        );


    if (!container) {

        container =
            document.createElement(
                "div"
            );

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.textContent =
        message;


    toast.style.cssText = `

        position: fixed;
        right: 20px;
        bottom: 20px;
        z-index: 100000;
        padding: 13px 18px;
        border-radius: 10px;
        background: #111827;
        border: 1px solid rgba(255,255,255,.12);
        color: #f8fafc;
        box-shadow: 0 15px 40px rgba(0,0,0,.35);
        font-size: 13px;
        font-weight: 600;

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.loadReports =
    loadReports;

window.applyReportFilters =
    applyFilters;

window.exportReportCSV =
    exportCSV;

window.closeReportModal =
    closeReportModal;

window.approveReport =
    approveReport;