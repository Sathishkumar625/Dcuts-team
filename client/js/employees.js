/* ==========================================
   EMPLOYEES MODULE
========================================== */

// Employee Data
let employees = JSON.parse(localStorage.getItem("employees")) || [];

// Edit Index
let editIndex = -1;

// Table
const table = document.getElementById("employeeTable");

/* ==========================
   LOAD TABLE
========================== */

function loadEmployees(data = employees) {

    table.innerHTML = "";

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="8">No Employees Found</td>
            </tr>
        `;

        return;
    }

    data.forEach((emp, index) => {

        table.innerHTML += `

            <tr>

                <td>${emp.id}</td>

                <td>${emp.name}</td>

                <td>${emp.email}</td>

                <td>${emp.phone}</td>

                <td>${emp.department}</td>

                <td>${emp.designation}</td>

                <td>
                    <span class="${emp.status === "Active" ? "active-status" : "inactive-status"}">
                        ${emp.status}
                    </span>
                </td>

                <td>

                    <button
                        class="edit-btn"
                        onclick="editEmployee(${index})">

                        Edit

                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteEmployee(${index})">

                        Delete

                    </button>

                </td>

            </tr>

        `;

    });

}

/* ==========================
   SAVE EMPLOYEE
========================== */

document.getElementById("saveEmployee").onclick = saveEmployee;

function saveEmployee() {

    const employee = {

        id: editIndex === -1
            ? "EMP" + String(employees.length + 1).padStart(3, "0")
            : employees[editIndex].id,

        name: document.getElementById("empName").value,

        email: document.getElementById("empEmail").value,

        phone: document.getElementById("empPhone").value,

        department: document.getElementById("empDepartment").value,

        designation: document.getElementById("empDesignation").value,

        status: document.getElementById("empStatus").value

    };

    if (employee.name === "" || employee.email === "") {

        alert("Please Fill Required Fields");
        return;

    }

    if (editIndex === -1) {

        employees.push(employee);

    } else {

        employees[editIndex] = employee;

        editIndex = -1;

        document.getElementById("saveEmployee").innerHTML =
            '<i class="fa-solid fa-user-plus"></i> Save Employee';

    }

    localStorage.setItem(
        "employees",
        JSON.stringify(employees)
    );

    clearForm();
    loadEmployees();

}

/* ==========================
   EDIT
========================== */

function editEmployee(index) {

    const emp = employees[index];

    document.getElementById("empName").value = emp.name;
    document.getElementById("empEmail").value = emp.email;
    document.getElementById("empPhone").value = emp.phone;
    document.getElementById("empDepartment").value = emp.department;
    document.getElementById("empDesignation").value = emp.designation;
    document.getElementById("empStatus").value = emp.status;

    editIndex = index;

    document.getElementById("saveEmployee").innerHTML =
        '<i class="fa-solid fa-pen"></i> Update Employee';

}

/* ==========================
   DELETE
========================== */

function deleteEmployee(index) {

    if (confirm("Delete Employee?")) {

        employees.splice(index, 1);

        localStorage.setItem(
            "employees",
            JSON.stringify(employees)
        );

        loadEmployees();

    }

}

/* ==========================
   SEARCH
========================== */

document.getElementById("searchEmployee")
.addEventListener("keyup", function () {

    const keyword = this.value.toLowerCase();

    const filtered = employees.filter(emp =>

        emp.name.toLowerCase().includes(keyword) ||

        emp.id.toLowerCase().includes(keyword) ||

        emp.department.toLowerCase().includes(keyword)

    );

    loadEmployees(filtered);

});

/* ==========================
   CLEAR FORM
========================== */

function clearForm() {

    document.getElementById("empName").value = "";
    document.getElementById("empEmail").value = "";
    document.getElementById("empPhone").value = "";
    document.getElementById("empDepartment").value = "";
    document.getElementById("empDesignation").value = "";
    document.getElementById("empStatus").value = "Active";

}

/* ==========================
   INITIAL LOAD
========================== */

loadEmployees();