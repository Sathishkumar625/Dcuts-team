/* =========================================================
   THE D CUTS
   PROFESSIONAL REPORT SYSTEM
   EXCEL STYLE TABLE
========================================================= */


/* =========================================================
   API
========================================================= */

const REPORT_API_BASE = "/api";


/* =========================================================
   GLOBAL DATA
========================================================= */

let allReports = [];

let filteredReports = [];

let clientsData = [];

let employeesData = [];


/* =========================================================
   AUTH TOKEN
========================================================= */

function getReportToken() {

    return (
        localStorage.getItem("token") ||
        ""
    );

}


function reportAuthHeaders() {

    const token =
        getReportToken();


    return {

        "Content-Type":
            "application/json",

        ...(token
            ? {
                Authorization:
                    `Bearer ${token}`
            }
            : {})

    };

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupEvents();

        await loadReports();

    }
);


/* =========================================================
   SETUP EVENTS
========================================================= */

function setupEvents() {


    const search =
        document.getElementById(
            "reportSearch"
        );


    if (search) {

        search.addEventListener(
            "input",
            applyFilters
        );

    }


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


    const clear =
        document.getElementById(
            "clearFilters"
        );


    if (clear) {

        clear.addEventListener(
            "click",
            clearFilters
        );

    }


    const emptyClear =
        document.getElementById(
            "emptyClearFilters"
        );


    if (emptyClear) {

        emptyClear.addEventListener(
            "click",
            clearFilters
        );

    }


    const refresh =
        document.getElementById(
            "refreshReports"
        );


    if (refresh) {

        refresh.addEventListener(
            "click",
            async function () {

                await loadReports();

            }
        );

    }


    const exportBtn =
        document.getElementById(
            "exportCSV"
        );


    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            exportCSV
        );

    }


    const printBtn =
        document.getElementById(
            "printReport"
        );


    if (printBtn) {

        printBtn.addEventListener(
            "click",
            function () {

                window.print();

            }
        );

    }


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


    const modal =
        document.getElementById(
            "reportModal"
        );


    if (modal) {

        const overlay =
            modal.querySelector(
                ".modal-overlay"
            );


        if (overlay) {

            overlay.addEventListener(
                "click",
                closeReportModal
            );

        }

    }

}


/* =========================================================
   LOAD REPORTS
========================================================= */

async function loadReports() {

    showLoading();


    try {

        await loadClients();

        await loadEmployees();


        let reports =
            await loadTimesheetsFromAPI();


        /*
            If API returns no data,
            use localStorage as fallback.
        */

        if (
            !Array.isArray(reports) ||
            reports.length === 0
        ) {

            reports =
                loadTimesheetsFromStorage();

        }


        allReports =
            normalizeReports(
                reports
            );


        populateFilters();

        applyFilters();


    }

    catch (error) {

        console.error(
            "REPORT LOAD ERROR:",
            error
        );


        const fallback =
            loadTimesheetsFromStorage();


        allReports =
            normalizeReports(
                fallback
            );


        populateFilters();

        applyFilters();

    }

}


/* =========================================================
   LOAD CLIENTS
========================================================= */

async function loadClients() {

    try {

        const response =
            await fetch(
                `${REPORT_API_BASE}/clients`,
                {
                    method: "GET",

                    headers:
                        reportAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Client API failed"
            );

        }


        const data =
            await response.json();


        clientsData =
            data.clients ||
            data.data ||
            [];


    }

    catch (error) {

        console.warn(
            "Using local clients:",
            error
        );


        clientsData =
            JSON.parse(
                localStorage.getItem(
                    "clients"
                ) || "[]"
            );

    }

}


/* =========================================================
   LOAD EMPLOYEES
========================================================= */

async function loadEmployees() {

    try {

        const response =
            await fetch(
                `${REPORT_API_BASE}/employees`,
                {
                    method: "GET",

                    headers:
                        reportAuthHeaders()
                }
            );


        if (!response.ok) {

            throw new Error(
                "Employee API failed"
            );

        }


        const data =
            await response.json();


        employeesData =
            data.employees ||
            data.data ||
            [];


    }

    catch (error) {

        console.warn(
            "Using local employees:",
            error
        );


        employeesData =
            JSON.parse(
                localStorage.getItem(
                    "employees"
                ) || "[]"
            );

    }

}


/* =========================================================
   LOAD TIMESHEETS API
========================================================= */

async function loadTimesheetsFromAPI() {

    const response =
        await fetch(
            `${REPORT_API_BASE}/timesheets`,
            {
                method: "GET",

                headers:
                    reportAuthHeaders()
            }
        );


    if (!response.ok) {

        throw new Error(
            "Unable to load timesheets"
        );

    }


    const data =
        await response.json();


    return (
        data.timesheets ||
        data.data ||
        []
    );

}


/* =========================================================
   LOCAL STORAGE FALLBACK
========================================================= */

function loadTimesheetsFromStorage() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "timesheets"
            ) || "[]"
        );

    }

    catch (error) {

        console.error(
            "LOCAL TIMESHEET ERROR:",
            error
        );


        return [];

    }

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeReports(
    records
) {

    if (!Array.isArray(records)) {

        return [];

    }


    return records.map(
        function (item, index) {

            const employee =
                resolveEmployee(
                    item.employee
                );


            const client =
                resolveClient(
                    item.client ||
                    item.project
                );


            const total =
                Number(
                    item.totalVideos
                ) || 0;


            const completed =
                Number(
                    item.completedVideos
                ) || 0;


            const balance =
                Math.max(
                    Number(
                        item.balanceVideos
                    ) ||
                    total - completed,
                    0
                );


            const working =
                item.workingHours ||
                item.hoursWorked ||
                "0h 0m";


            const office =
                item.officeHours ||
                item.officeWorked ||
                "—";


            const lunch =
                item.lunchHours ||
                item.lunchBreak ||
                "—";


            const project =
                item.projectName ||
                item.project?.name ||
                item.project?.projectName ||
                item.project ||
                client?.code ||
                "—";


            const task =
                item.taskDetails ||
                item.comments ||
                item.task ||
                item.description ||
                "—";


            const status =
                balance === 0 &&
                total > 0
                    ? "Completed"
                    : "Pending";


            return {

                original:
                    item,

                index:
                    index,

                id:
                    item._id ||
                    item.id ||
                    `REPORT-${index + 1}`,

                employeeId:
                    employee?.employeeId ||
                    item.employeeId ||
                    employee?._id ||
                    item.employee ||
                    "—",

                employeeName:
                    employee?.name ||
                    item.employeeName ||
                    "Unknown Employee",

                date:
                    formatDate(
                        item.date
                    ),

                rawDate:
                    item.date || "",

                clientCode:
                    client?.code ||
                    item.clientCode ||
                    "—",

                clientName:
                    client?.name ||
                    item.clientName ||
                    "—",

                project:
                    project,

                task:
                    task,

                totalVideos:
                    total,

                completedVideos:
                    completed,

                balanceVideos:
                    balance,

                officeHours:
                    office,

                lunchHours:
                    lunch,

                workingHours:
                    working,

                status:
                    status

            };

        }
    );

}


/* =========================================================
   RESOLVE EMPLOYEE
========================================================= */

function resolveEmployee(
    employee
) {

    if (!employee) {

        return null;

    }


    if (
        typeof employee ===
        "object"
    ) {

        return employee;

    }


    return (
        employeesData.find(
            function (item) {

                return (
                    String(
                        item._id
                    ) ===
                    String(
                        employee
                    )
                );

            }
        ) || null
    );

}


/* =========================================================
   RESOLVE CLIENT
========================================================= */

function resolveClient(
    client
) {

    if (!client) {

        return null;

    }


    if (
        typeof client ===
        "object"
    ) {

        return client;

    }


    return (
        clientsData.find(
            function (item) {

                return (

                    String(
                        item._id
                    ) ===
                    String(
                        client
                    )

                    ||

                    String(
                        item.code
                    ).toLowerCase() ===
                    String(
                        client
                    ).toLowerCase()

                );

            }
        ) || null
    );

}


/* =========================================================
   POPULATE FILTERS
========================================================= */

function populateFilters() {


    const employeeSelect =
        document.getElementById(
            "employeeFilter"
        );


    const clientSelect =
        document.getElementById(
            "clientFilter"
        );


    if (employeeSelect) {

        const employees =
            [...new Map(
                allReports.map(
                    function (item) {

                        return [
                            item.employeeId,
                            item.employeeName
                        ];

                    }
                )
            )];


        employeeSelect.innerHTML = `
            <option value="">
                All Employees
            </option>
        `;


        employees.forEach(
            function ([id, name]) {

                employeeSelect.innerHTML += `

                    <option value="${escapeHtml(id)}">

                        ${escapeHtml(name)}

                    </option>

                `;

            }
        );

    }


    if (clientSelect) {

        const clients =
            [...new Map(
                allReports.map(
                    function (item) {

                        return [
                            item.clientCode,
                            item.clientName
                        ];

                    }
                )
            )];


        clientSelect.innerHTML = `
            <option value="">
                All Clients
            </option>
        `;


        clients.forEach(
            function ([code, name]) {

                if (
                    !code ||
                    code === "—"
                ) {

                    return;

                }


                clientSelect.innerHTML += `

                    <option value="${escapeHtml(code)}">

                        ${escapeHtml(code)}
                        -
                        ${escapeHtml(name)}

                    </option>

                `;

            }
        );

    }

}


/* =========================================================
   FILTERS
========================================================= */

function applyFilters() {


    const search =
        (
            document.getElementById(
                "reportSearch"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const employee =
        document.getElementById(
            "employeeFilter"
        )?.value || "";


    const client =
        document.getElementById(
            "clientFilter"
        )?.value || "";


    const status =
        document.getElementById(
            "statusFilter"
        )?.value || "";


    const date =
        document.getElementById(
            "dateFilter"
        )?.value || "";


    filteredReports =
        allReports.filter(
            function (item) {


                const searchText = [

                    item.employeeId,

                    item.employeeName,

                    item.clientCode,

                    item.clientName,

                    item.project,

                    item.task

                ]
                .join(" ")
                .toLowerCase();


                if (
                    search &&
                    !searchText.includes(
                        search
                    )
                ) {

                    return false;

                }


                if (
                    employee &&
                    item.employeeId !==
                    employee
                ) {

                    return false;

                }


                if (
                    client &&
                    item.clientCode !==
                    client
                ) {

                    return false;

                }


                if (
                    status &&
                    item.status !==
                    status
                ) {

                    return false;

                }


                if (date) {

                    const itemDate =
                        normalizeDateForFilter(
                            item.rawDate
                        );


                    if (
                        itemDate !==
                        date
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    renderTable(
        filteredReports
    );


    updateSummary(
        filteredReports
    );

}


/* =========================================================
   RENDER TABLE
========================================================= */

function renderTable(
    reports
) {


    const body =
        document.getElementById(
            "reportTableBody"
        );


    const empty =
        document.getElementById(
            "emptyState"
        );


    if (!body) {

        return;

    }


    body.innerHTML = "";


    if (
        !reports ||
        reports.length === 0
    ) {

        if (empty) {

            empty.classList.remove(
                "hidden"
            );

        }


        return;

    }


    if (empty) {

        empty.classList.add(
            "hidden"
        );

    }


    reports.forEach(
        function (item, index) {


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td class="employee-id">

                    ${escapeHtml(
                        item.employeeId
                    )}

                </td>


                <td>

                    <div class="employee-cell">

                        <div class="employee-avatar">

                            ${getInitials(
                                item.employeeName
                            )}

                        </div>


                        <div class="employee-info">

                            <strong>

                                ${escapeHtml(
                                    item.employeeName
                                )}

                            </strong>

                            <small>
                                Employee
                            </small>

                        </div>

                    </div>

                </td>


                <td>

                    ${escapeHtml(
                        item.date
                    )}

                </td>


                <td>

                    <span class="client-badge">

                        ${escapeHtml(
                            item.clientCode
                        )}

                    </span>

                </td>


                <td>

                    <span class="project-name">

                        ${escapeHtml(
                            item.project
                        )}

                    </span>

                </td>


                <td>

                    <div class="task-details">

                        ${escapeHtml(
                            item.task
                        )}

                    </div>

                </td>


                <td class="number-cell total-number">

                    ${item.totalVideos}

                </td>


                <td class="number-cell completed-number">

                    ${item.completedVideos}

                </td>


                <td class="
                    number-cell
                    ${
                        item.balanceVideos === 0
                            ? "balance-zero"
                            : "balance-number"
                    }
                ">

                    ${item.balanceVideos}

                </td>


                <td class="hours-cell">

                    ${escapeHtml(
                        item.officeHours
                    )}

                </td>


                <td class="hours-cell">

                    ${escapeHtml(
                        item.lunchHours
                    )}

                </td>


                <td class="hours-cell">

                    ${escapeHtml(
                        item.workingHours
                    )}

                </td>


                <td>

                    <span class="
                        status-badge
                        ${
                            item.status ===
                            "Completed"
                                ? "status-completed"
                                : "status-pending"
                        }
                    ">

                        ${item.status}

                    </span>

                </td>


                <td>

                    <div class="row-actions">


                        <button
                            class="row-action view-action"
                            title="View"
                            onclick="viewReport('${escapeAttr(item.id)}')"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            class="row-action edit-action"
                            title="Edit"
                            onclick="editReport('${escapeAttr(item.id)}')"
                        >

                            <i class="fa-solid fa-pen"></i>

                        </button>


                        <button
                            class="row-action delete-action"
                            title="Delete"
                            onclick="deleteReport('${escapeAttr(item.id)}')"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>


                    </div>

                </td>

            `;


            body.appendChild(
                row
            );

        }
    );


    const info =
        document.getElementById(
            "recordInfo"
        );


    if (info) {

        info.textContent =
            `Showing ${reports.length} ${
                reports.length === 1
                    ? "record"
                    : "records"
            }`;

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary(
    reports
) {


    let total =
        0;


    let completed =
        0;


    let balance =
        0;


    let workingMinutes =
        0;


    reports.forEach(
        function (item) {

            total +=
                Number(
                    item.totalVideos
                ) || 0;


            completed +=
                Number(
                    item.completedVideos
                ) || 0;


            balance +=
                Number(
                    item.balanceVideos
                ) || 0;


            workingMinutes +=
                parseHours(
                    item.workingHours
                );

        }
    );


    setText(
        "totalRecords",
        reports.length
    );


    setText(
        "totalVideos",
        total
    );


    setText(
        "completedVideos",
        completed
    );


    setText(
        "balanceVideos",
        balance
    );


    setText(
        "workingHours",
        formatMinutes(
            workingMinutes
        )
    );

}


/* =========================================================
   VIEW REPORT
========================================================= */

function viewReport(
    id
) {


    const item =
        allReports.find(
            function (report) {

                return String(
                    report.id
                ) === String(id);

            }
        );


    if (!item) {

        return;

    }


    const title =
        document.getElementById(
            "modalTitle"
        );


    const content =
        document.getElementById(
            "modalContent"
        );


    if (title) {

        title.textContent =
            `${item.employeeName} - ${item.project}`;

    }


    if (content) {

        content.innerHTML = `

            <div class="modal-grid">


                <div class="modal-item">

                    <span>
                        Employee ID
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.employeeId
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Employee
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.employeeName
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Date
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.date
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Client
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.clientCode
                        )}
                        -
                        ${escapeHtml(
                            item.clientName
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Project
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.project
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Status
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.status
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Total Videos
                    </span>

                    <strong>
                        ${item.totalVideos}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Completed Videos
                    </span>

                    <strong>
                        ${item.completedVideos}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Balance Videos
                    </span>

                    <strong>
                        ${item.balanceVideos}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Office Hours
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.officeHours
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Lunch
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.lunchHours
                        )}
                    </strong>

                </div>


                <div class="modal-item">

                    <span>
                        Working Hours
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.workingHours
                        )}
                    </strong>

                </div>


                <div class="modal-item full">

                    <span>
                        Task Details
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.task
                        )}
                    </strong>

                </div>


            </div>

        `;

    }


    const modal =
        document.getElementById(
            "reportModal"
        );


    if (modal) {

        modal.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeReportModal() {

    const modal =
        document.getElementById(
            "reportModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   EDIT
========================================================= */

function editReport(
    id
) {

    const item =
        allReports.find(
            function (report) {

                return String(
                    report.id
                ) === String(id);

            }
        );


    if (!item) {

        return;

    }


    /*
        Existing Timesheet page is the
        correct editing interface.

        Send the user there with the
        record ID.
    */

    sessionStorage.setItem(
        "editTimesheetId",
        item.id
    );


    window.location.href =
        "timesheet.html";

}


/* =========================================================
   DELETE
========================================================= */

async function deleteReport(
    id
) {


    const item =
        allReports.find(
            function (report) {

                return String(
                    report.id
                ) === String(id);

            }
        );


    if (!item) {

        return;

    }


    const confirmed =
        confirm(
            `Delete this timesheet report?\n\n` +
            `${item.employeeName} - ${item.project}`
        );


    if (!confirmed) {

        return;

    }


    try {


        const response =
            await fetch(
                `${REPORT_API_BASE}/timesheets/${id}`,
                {
                    method: "DELETE",

                    headers:
                        reportAuthHeaders()
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to delete report."
            );

        }


        alert(
            "Report deleted successfully."
        );


        await loadReports();

    }

    catch (error) {

        console.error(
            "DELETE REPORT ERROR:",
            error
        );


        /*
            LocalStorage fallback
            for older records.
        */

        const local =
            loadTimesheetsFromStorage();


        const index =
            local.findIndex(
                function (item) {

                    return String(
                        item._id ||
                        item.id
                    ) === String(id);

                }
            );


        if (index !== -1) {

            local.splice(
                index,
                1
            );


            localStorage.setItem(
                "timesheets",
                JSON.stringify(
                    local
                )
            );


            alert(
                "Report deleted successfully."
            );


            await loadReports();

            return;

        }


        alert(
            error.message ||
            "Unable to delete report."
        );

    }

}


/* =========================================================
   EXPORT CSV
========================================================= */

function exportCSV() {


    if (
        !filteredReports.length
    ) {

        alert(
            "No report data to export."
        );

        return;

    }


    const headers = [

        "Employee ID",

        "Employee",

        "Date",

        "Client",

        "Client Name",

        "Project",

        "Task Details",

        "Total Videos",

        "Completed Videos",

        "Balance Videos",

        "Office Hours",

        "Lunch",

        "Working Hours",

        "Status"

    ];


    const rows =
        filteredReports.map(
            function (item) {

                return [

                    item.employeeId,

                    item.employeeName,

                    item.date,

                    item.clientCode,

                    item.clientName,

                    item.project,

                    item.task,

                    item.totalVideos,

                    item.completedVideos,

                    item.balanceVideos,

                    item.officeHours,

                    item.lunchHours,

                    item.workingHours,

                    item.status

                ];

            }
        );


    const csv = [

        headers,

        ...rows

    ]
    .map(
        function (row) {

            return row
                .map(
                    function (value) {

                        return `"${String(
                            value ?? ""
                        )
                        .replace(
                            /"/g,
                            '""'
                        )}"`;

                    }
                )
                .join(",");

        }
    )
    .join("\n");


    const blob =
        new Blob(
            [csv],
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
        `DCUTS_Report_${getFileDate()}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   CLEAR FILTERS
========================================================= */

function clearFilters() {


    const search =
        document.getElementById(
            "reportSearch"
        );


    const employee =
        document.getElementById(
            "employeeFilter"
        );


    const client =
        document.getElementById(
            "clientFilter"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    const date =
        document.getElementById(
            "dateFilter"
        );


    if (search)
        search.value = "";


    if (employee)
        employee.value = "";


    if (client)
        client.value = "";


    if (status)
        status.value = "";


    if (date)
        date.value = "";


    applyFilters();

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {


    const body =
        document.getElementById(
            "reportTableBody"
        );


    if (!body) {

        return;

    }


    body.innerHTML = `

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
   DATE
========================================================= */

function formatDate(
    value
) {


    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

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


function normalizeDateForFilter(
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

        return String(value)
            .substring(0,10);

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        )
        .padStart(2, "0");


    const day =
        String(
            date.getDate()
        )
        .padStart(2, "0");


    return `${year}-${month}-${day}`;

}


/* =========================================================
   HOURS
========================================================= */

function parseHours(
    value
) {


    if (
        typeof value ===
        "number"
    ) {

        return Math.round(
            value * 60
        );

    }


    if (!value) {

        return 0;

    }


    const text =
        String(value)
        .toLowerCase()
        .trim();


    let minutes = 0;


    const hourMatch =
        text.match(
            /(\d+(?:\.\d+)?)\s*h/
        );


    const minuteMatch =
        text.match(
            /(\d+)\s*m/
        );


    if (hourMatch) {

        minutes +=
            parseFloat(
                hourMatch[1]
            ) * 60;

    }


    if (minuteMatch) {

        minutes +=
            parseInt(
                minuteMatch[1],
                10
            );

    }


    if (
        !hourMatch &&
        !minuteMatch
    ) {

        const decimal =
            parseFloat(text);


        if (
            !Number.isNaN(
                decimal
            )
        ) {

            minutes =
                decimal * 60;

        }

    }


    return Math.round(
        minutes
    );

}


function formatMinutes(
    minutes
) {


    minutes =
        Number(minutes) || 0;


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {


    const parts =
        String(
            name || "E"
        )
        .trim()
        .split(/\s+/);


    if (
        parts.length === 1
    ) {

        return parts[0]
            .substring(0,2)
            .toUpperCase();

    }


    return (
        parts[0][0] +
        parts[parts.length - 1][0]
    )
    .toUpperCase();

}


/* =========================================================
   HELPERS
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
            value;

    }

}


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


function escapeAttr(
    value
) {

    return String(
        value ?? ""
    )
    .replace(
        /'/g,
        "\\'"
    );

}


function getFileDate() {

    const date =
        new Date();


    return [
        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(2,"0"),

        String(
            date.getDate()
        ).padStart(2,"0")

    ].join("-");

}