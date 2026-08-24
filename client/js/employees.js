/* =========================================================
   DCUTS.TS
   PROFESSIONAL EMPLOYEE MANAGEMENT
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "employees";


let employees = JSON.parse(
    localStorage.getItem(STORAGE_KEY)
) || [];


let editingEmployeeId = null;

let selectedEmployeeId = null;

let selectedImage = "";


/* =========================================================
   DEFAULT EMPLOYEES
   ONLY CREATED IF STORAGE IS EMPTY
========================================================= */

if (!localStorage.getItem(STORAGE_KEY)) {

    employees = [

        {
            id: "DCUTS001",
            name: "Sathish Kumar",
            email: "sathish@dcuts.team",
            phone: "+91 98765 43210",
            department: "Editing Department",
            designation: "Video Editor",
            joiningDate: "2023-03-15",
            location: "Salem, India",
            status: "Active",
            projects: 28,
            completed: 24,
            pending: 4,
            leaves: 6,
            image: ""
        },

        {
            id: "DCUTS002",
            name: "Naveen",
            email: "naveen@dcuts.team",
            phone: "+91 98765 43211",
            department: "Editing Department",
            designation: "Video Editor",
            joiningDate: "2023-06-10",
            location: "Salem, India",
            status: "Active",
            projects: 20,
            completed: 17,
            pending: 3,
            leaves: 4,
            image: ""
        }

    ];

    saveEmployees();

}


/* =========================================================
   ELEMENTS
========================================================= */

const employeeGrid =
    document.getElementById("employeeGrid");

const totalEmployees =
    document.getElementById("totalEmployees");

const searchEmployee =
    document.getElementById("searchEmployee");

const departmentFilter =
    document.getElementById("departmentFilter");

const designationFilter =
    document.getElementById("designationFilter");

const statusFilter =
    document.getElementById("statusFilter");

const sortEmployees =
    document.getElementById("sortEmployees");

const clearFilters =
    document.getElementById("clearFilters");


const employeeModal =
    document.getElementById("employeeModal");

const employeeForm =
    document.getElementById("employeeForm");

const openAddEmployee =
    document.getElementById("openAddEmployee");

const closeEmployeeModal =
    document.getElementById("closeEmployeeModal");

const cancelEmployee =
    document.getElementById("cancelEmployee");


const employeeOverlay =
    document.getElementById("employeeOverlay");

const employeeDetailsPanel =
    document.getElementById("employeeDetailsPanel");

const closeDetails =
    document.getElementById("closeDetails");


const empImage =
    document.getElementById("empImage");

const imagePreview =
    document.getElementById("imagePreview");

const defaultImageIcon =
    document.getElementById("defaultImageIcon");


/* =========================================================
   SAVE STORAGE
========================================================= */

function saveEmployees() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(employees)
    );

}


/* =========================================================
   GENERATE ID
========================================================= */

function generateEmployeeId() {

    let maxNumber = 0;

    employees.forEach(employee => {

        const match =
            employee.id.match(/DCUTS(\d+)/);

        if (match) {

            const number =
                parseInt(match[1]);

            if (number > maxNumber) {

                maxNumber = number;

            }

        }

    });


    return "DCUTS" +
        String(maxNumber + 1)
        .padStart(3, "0");

}


/* =========================================================
   IMAGE
========================================================= */

function getEmployeeImage(employee) {

    if (employee.image) {

        return employee.image;

    }


    const initials =
        employee.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();


    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        initials
    )}&background=1e3a8a&color=ffffff&size=300&bold=true`;

}


/* =========================================================
   LOAD FILTER OPTIONS
========================================================= */

function loadFilters() {

    const departments = [
        ...new Set(
            employees
                .map(emp => emp.department)
                .filter(Boolean)
        )
    ];


    const designations = [
        ...new Set(
            employees
                .map(emp => emp.designation)
                .filter(Boolean)
        )
    ];


    departmentFilter.innerHTML =
        `<option value="">All Department</option>`;


    departments.forEach(department => {

        departmentFilter.innerHTML += `
            <option value="${escapeHTML(department)}">
                ${escapeHTML(department)}
            </option>
        `;

    });


    designationFilter.innerHTML =
        `<option value="">All Designation</option>`;


    designations.forEach(designation => {

        designationFilter.innerHTML += `
            <option value="${escapeHTML(designation)}">
                ${escapeHTML(designation)}
            </option>
        `;

    });

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   RENDER
========================================================= */

function renderEmployees() {

    loadFilters();


    const search =
        searchEmployee.value
            .trim()
            .toLowerCase();


    const department =
        departmentFilter.value;


    const designation =
        designationFilter.value;


    const status =
        statusFilter.value;


    let filtered =
        employees.filter(employee => {


            const matchesSearch =

                !search ||

                employee.name
                    .toLowerCase()
                    .includes(search) ||

                employee.email
                    .toLowerCase()
                    .includes(search) ||

                employee.id
                    .toLowerCase()
                    .includes(search) ||

                employee.department
                    .toLowerCase()
                    .includes(search) ||

                employee.designation
                    .toLowerCase()
                    .includes(search);


            const matchesDepartment =
                !department ||
                employee.department === department;


            const matchesDesignation =
                !designation ||
                employee.designation === designation;


            const matchesStatus =
                !status ||
                employee.status === status;


            return (
                matchesSearch &&
                matchesDepartment &&
                matchesDesignation &&
                matchesStatus
            );

        });


    /* SORT */

    const sort =
        sortEmployees.value;


    if (sort === "nameAsc") {

        filtered.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

    }


    if (sort === "nameDesc") {

        filtered.sort((a, b) =>
            b.name.localeCompare(a.name)
        );

    }


    if (sort === "newest") {

        filtered.sort((a, b) =>
            new Date(b.joiningDate || 0) -
            new Date(a.joiningDate || 0)
        );

    }


    if (sort === "oldest") {

        filtered.sort((a, b) =>
            new Date(a.joiningDate || 0) -
            new Date(b.joiningDate || 0)
        );

    }


    totalEmployees.textContent =
        employees.length;


    employeeGrid.innerHTML = "";


    if (filtered.length === 0) {

        employeeGrid.innerHTML = `

            <div class="empty-employees">

                <i class="fa-solid fa-users-slash"></i>

                <h3>No Employees Found</h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(employee => {

        employeeGrid.innerHTML += `

            <article
                class="employee-card"
                data-id="${employee.id}"
            >

                <span
                    class="card-status-dot ${
                        employee.status === "Active"
                            ? "active"
                            : "inactive"
                    }"
                ></span>


                <div class="card-menu">

                    <button
                        onclick="showEmployeeMenu(event, '${employee.id}')"
                    >

                        <i class="fa-solid fa-ellipsis-vertical"></i>

                    </button>

                </div>


                <img
                    class="employee-card-image"
                    src="${getEmployeeImage(employee)}"
                    alt="${escapeHTML(employee.name)}"
                >


                <h2>
                    ${escapeHTML(employee.name)}
                </h2>


                <div class="designation">

                    ${escapeHTML(
                        employee.designation || "Employee"
                    )}

                </div>


                <div class="department">

                    <i class="fa-solid fa-users"></i>

                    ${escapeHTML(
                        employee.department || "Department"
                    )}

                </div>


                <div class="card-actions">

                    <button
                        class="card-action"
                        title="View"
                        onclick="viewEmployee('${employee.id}')"
                    >

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    <button
                        class="card-action"
                        title="Edit"
                        onclick="editEmployee('${employee.id}')"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        class="card-action delete"
                        title="Delete"
                        onclick="deleteEmployee('${employee.id}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </article>

        `;

    });

}


/* =========================================================
   VIEW EMPLOYEE
========================================================= */

function viewEmployee(id) {

    const employee =
        employees.find(
            emp => emp.id === id
        );


    if (!employee) return;


    selectedEmployeeId = id;


    document.getElementById("detailsImage").src =
        getEmployeeImage(employee);


    document.getElementById("detailsName")
        .textContent =
        employee.name;


    document.getElementById("detailsDesignation")
        .textContent =
        employee.designation || "Employee";


    document.getElementById("detailsId")
        .textContent =
        employee.id;


    document.getElementById("detailsDepartment")
        .textContent =
        employee.department || "-";


    document.getElementById("detailsDesignationInfo")
        .textContent =
        employee.designation || "-";


    document.getElementById("detailsJoiningDate")
        .textContent =
        formatDate(employee.joiningDate);


    document.getElementById("detailsEmail")
        .textContent =
        employee.email || "-";


    document.getElementById("detailsPhone")
        .textContent =
        employee.phone || "-";


    document.getElementById("detailsLocation")
        .textContent =
        employee.location || "-";


    document.getElementById("detailsStatusInfo")
        .textContent =
        employee.status;


    document.getElementById("detailsProjects")
        .textContent =
        employee.projects || 0;


    document.getElementById("detailsCompleted")
        .textContent =
        employee.completed || 0;


    document.getElementById("detailsPending")
        .textContent =
        employee.pending || 0;


    document.getElementById("detailsLeaves")
        .textContent =
        employee.leaves || 0;


    const status =
        document.getElementById("detailsStatus");


    status.textContent =
        employee.status;


    status.classList.toggle(
        "inactive",
        employee.status !== "Active"
    );


    const statusDot =
        document.getElementById("detailsStatusDot");


    statusDot.classList.toggle(
        "inactive",
        employee.status !== "Active"
    );


    employeeDetailsPanel.classList.add("show");

    employeeOverlay.classList.add("show");

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeEmployeeDetails() {

    employeeDetailsPanel.classList.remove("show");

    employeeOverlay.classList.remove("show");

    selectedEmployeeId = null;

}


closeDetails.addEventListener(
    "click",
    closeEmployeeDetails
);


employeeOverlay.addEventListener(
    "click",
    closeEmployeeDetails
);


/* =========================================================
   OPEN ADD
========================================================= */

openAddEmployee.addEventListener(
    "click",
    function () {

        editingEmployeeId = null;

        resetForm();

        document.getElementById("modalTitle")
            .textContent =
            "Add Employee";


        document.getElementById("saveButtonText")
            .textContent =
            "Save Employee";


        employeeModal.classList.add("show");

    }
);


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeEmployeeModalFunction() {

    employeeModal.classList.remove("show");

    editingEmployeeId = null;

}


closeEmployeeModal.addEventListener(
    "click",
    closeEmployeeModalFunction
);


cancelEmployee.addEventListener(
    "click",
    closeEmployeeModalFunction
);


employeeModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            employeeModal
        ) {

            closeEmployeeModalFunction();

        }

    }
);


/* =========================================================
   EDIT EMPLOYEE
========================================================= */

function editEmployee(id) {

    const employee =
        employees.find(
            emp => emp.id === id
        );


    if (!employee) return;


    editingEmployeeId = id;


    document.getElementById("modalTitle")
        .textContent =
        "Edit Employee";


    document.getElementById("saveButtonText")
        .textContent =
        "Update Employee";


    document.getElementById("empName").value =
        employee.name || "";


    document.getElementById("empEmail").value =
        employee.email || "";


    document.getElementById("empPhone").value =
        employee.phone || "";


    document.getElementById("empDepartment").value =
        employee.department || "";


    document.getElementById("empDesignation").value =
        employee.designation || "";


    document.getElementById("empJoiningDate").value =
        employee.joiningDate || "";


    document.getElementById("empLocation").value =
        employee.location || "";


    document.getElementById("empStatus").value =
        employee.status || "Active";


    document.getElementById("empProjects").value =
        employee.projects || 0;


    document.getElementById("empCompleted").value =
        employee.completed || 0;


    document.getElementById("empPending").value =
        employee.pending || 0;


    document.getElementById("empLeaves").value =
        employee.leaves || 0;


    selectedImage =
        employee.image || "";


    if (selectedImage) {

        imagePreview.src =
            selectedImage;

        imagePreview.style.display =
            "block";

        defaultImageIcon.style.display =
            "none";

    }
    else {

        imagePreview.style.display =
            "none";

        defaultImageIcon.style.display =
            "block";

    }


    employeeModal.classList.add("show");

}


/* =========================================================
   DELETE
========================================================= */

function deleteEmployee(id) {

    const employee =
        employees.find(
            emp => emp.id === id
        );


    if (!employee) return;


    const confirmed =
        confirm(
            `Delete ${employee.name}?\n\nThis action cannot be undone.`
        );


    if (!confirmed) return;


    employees =
        employees.filter(
            emp => emp.id !== id
        );


    saveEmployees();

    renderEmployees();

    closeEmployeeDetails();

    showToast(
        "Employee deleted successfully."
    );

}


/* =========================================================
   FORM SUBMIT
========================================================= */

employeeForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const name =
            document.getElementById("empName")
                .value.trim();


        const email =
            document.getElementById("empEmail")
                .value.trim();


        if (!name || !email) {

            showToast(
                "Employee name and email are required."
            );

            return;

        }


        const employeeData = {

            id:
                editingEmployeeId ||
                generateEmployeeId(),

            name,

            email,

            phone:
                document.getElementById("empPhone")
                    .value.trim(),

            department:
                document.getElementById("empDepartment")
                    .value.trim(),

            designation:
                document.getElementById("empDesignation")
                    .value.trim(),

            joiningDate:
                document.getElementById("empJoiningDate")
                    .value,

            location:
                document.getElementById("empLocation")
                    .value.trim(),

            status:
                document.getElementById("empStatus")
                    .value,

            projects:
                Number(
                    document.getElementById("empProjects")
                        .value
                ) || 0,

            completed:
                Number(
                    document.getElementById("empCompleted")
                        .value
                ) || 0,

            pending:
                Number(
                    document.getElementById("empPending")
                        .value
                ) || 0,

            leaves:
                Number(
                    document.getElementById("empLeaves")
                        .value
                ) || 0,

            image:
                selectedImage || ""

        };


        if (editingEmployeeId) {

            const index =
                employees.findIndex(
                    emp =>
                        emp.id ===
                        editingEmployeeId
                );


            if (index !== -1) {

                employees[index] =
                    employeeData;

            }


            showToast(
                "Employee updated successfully."
            );

        }
        else {

            employees.push(
                employeeData
            );


            showToast(
                "Employee added successfully."
            );

        }


        saveEmployees();

        renderEmployees();

        closeEmployeeModalFunction();

    }
);


/* =========================================================
   IMAGE UPLOAD
========================================================= */

empImage.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) return;


        if (
            ![
                "image/jpeg",
                "image/png",
                "image/webp"
            ].includes(file.type)
        ) {

            showToast(
                "Please select JPG, PNG or WEBP image."
            );

            this.value = "";

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function (event) {

                selectedImage =
                    event.target.result;


                imagePreview.src =
                    selectedImage;


                imagePreview.style.display =
                    "block";


                defaultImageIcon.style.display =
                    "none";

            };


        reader.readAsDataURL(file);

    }
);


/* =========================================================
   RESET FORM
========================================================= */

function resetForm() {

    employeeForm.reset();


    document.getElementById("empStatus").value =
        "Active";


    document.getElementById("empProjects").value =
        0;


    document.getElementById("empCompleted").value =
        0;


    document.getElementById("empPending").value =
        0;


    document.getElementById("empLeaves").value =
        0;


    imagePreview.src = "";

    imagePreview.style.display =
        "none";


    defaultImageIcon.style.display =
        "block";


    empImage.value = "";


    selectedImage = "";

}


/* =========================================================
   SEARCH
========================================================= */

searchEmployee.addEventListener(
    "input",
    renderEmployees
);


/* =========================================================
   FILTERS
========================================================= */

departmentFilter.addEventListener(
    "change",
    renderEmployees
);


designationFilter.addEventListener(
    "change",
    renderEmployees
);


statusFilter.addEventListener(
    "change",
    renderEmployees
);


sortEmployees.addEventListener(
    "change",
    renderEmployees
);


/* =========================================================
   CLEAR FILTERS
========================================================= */

clearFilters.addEventListener(
    "click",
    function () {

        searchEmployee.value = "";

        departmentFilter.value = "";

        designationFilter.value = "";

        statusFilter.value = "";

        sortEmployees.value = "default";

        renderEmployees();

    }
);


/* =========================================================
   DETAILS EDIT
========================================================= */

document.getElementById(
    "detailsEditBtn"
).addEventListener(
    "click",
    function () {

        if (!selectedEmployeeId) return;

        const id =
            selectedEmployeeId;

        closeEmployeeDetails();

        editEmployee(id);

    }
);


/* =========================================================
   DETAILS DELETE
========================================================= */

document.getElementById(
    "detailsDeleteBtn"
).addEventListener(
    "click",
    function () {

        if (!selectedEmployeeId) return;

        deleteEmployee(
            selectedEmployeeId
        );

    }
);


/* =========================================================
   DETAILS CONTACT BUTTONS
========================================================= */

document.getElementById(
    "detailsPhoneBtn"
).addEventListener(
    "click",
    function () {

        const employee =
            getSelectedEmployee();

        if (
            employee &&
            employee.phone
        ) {

            window.location.href =
                "tel:" + employee.phone;

        }

    }
);


document.getElementById(
    "detailsEmailBtn"
).addEventListener(
    "click",
    function () {

        const employee =
            getSelectedEmployee();

        if (
            employee &&
            employee.email
        ) {

            window.location.href =
                "mailto:" + employee.email;

        }

    }
);


document.getElementById(
    "detailsMessageBtn"
).addEventListener(
    "click",
    function () {

        const employee =
            getSelectedEmployee();

        if (
            employee &&
            employee.phone
        ) {

            window.open(
                "https://wa.me/" +
                employee.phone.replace(
                    /\D/g,
                    ""
                ),
                "_blank"
            );

        }

    }
);


document.getElementById(
    "detailsCalendarBtn"
).addEventListener(
    "click",
    function () {

        window.location.href =
            "calendar.html";

    }
);


/* =========================================================
   SELECTED EMPLOYEE
========================================================= */

function getSelectedEmployee() {

    return employees.find(
        emp =>
            emp.id ===
            selectedEmployeeId
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

    if (!date) return "-";


    const parsed =
        new Date(date);


    if (isNaN(parsed.getTime())) {

        return date;

    }


    return parsed.toLocaleDateString(
        "en-IN",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}


/* =========================================================
   CARD MENU
========================================================= */

function showEmployeeMenu(
    event,
    id
) {

    event.stopPropagation();

    viewEmployee(id);

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "employeeToast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ADMIN NAME
========================================================= */

const loggedUser =
    JSON.parse(
        localStorage.getItem(
            "loggedUser"
        )
    );


if (
    loggedUser &&
    loggedUser.name
) {

    document.getElementById(
        "adminName"
    ).textContent =
        loggedUser.name;

}


/* =========================================================
   INITIAL LOAD
========================================================= */

renderEmployees();