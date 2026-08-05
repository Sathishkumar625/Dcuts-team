const CLIENT_API = "http://localhost:5000/api/clients";
const PROJECT_API = "http://localhost:5000/api/projects";
const TIMESHEET_API = "http://localhost:5000/api/timesheets";

const token = localStorage.getItem("token");

// URL:
// client-details.html?id=xxxxxxxx

const params = new URLSearchParams(window.location.search);
const clientId = params.get("id");

// ===============================
// LOAD PAGE
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    if (!clientId) {

        alert("Client ID Missing");

        window.location.href = "clients.html";

        return;

    }

    loadClient();

    loadProjects();

    loadTimesheets();

});

// ===============================
// LOAD CLIENT
// ===============================

async function loadClient() {

    try {

        const response = await fetch(

            `${CLIENT_API}/${clientId}`,

            {

                headers: {

                    "Authorization": "Bearer " + token

                }

            }

        );

        const data = await response.json();

        if (!data.success) {

            alert(data.message);

            return;

        }

        const client = data.client;

        document.getElementById("clientName").innerText =
            client.clientName;

        document.getElementById("companyName").innerText =
            client.companyName;

        document.getElementById("phone").innerText =
            client.phone;

        document.getElementById("email").innerText =
            client.email;

        document.getElementById("gst").innerText =
            client.gst;

        document.getElementById("status").innerText =
            client.status;

        document.getElementById("address").innerText =
            client.address;

    }

    catch (err) {

        console.log(err);

    }

}

// ===============================
// LOAD PROJECTS
// ===============================

async function loadProjects() {

    try {

        const response = await fetch(

            PROJECT_API,

            {

                headers: {

                    "Authorization": "Bearer " + token

                }

            }

        );

        const data = await response.json();

        const table =
            document.getElementById("projectTable");

        table.innerHTML = "";

        if (!data.success) return;

        data.projects.forEach(project => {

            table.innerHTML += `

            <tr>

                <td>${project.projectName}</td>

                <td>${project.status}</td>

                <td>${project.startDate}</td>

                <td>${project.endDate}</td>

            </tr>

            `;

        });

    }

    catch (err) {

        console.log(err);

    }

}

// ===============================
// LOAD TIMESHEETS
// ===============================

async function loadTimesheets() {

    try {

        const response = await fetch(

            TIMESHEET_API,

            {

                headers: {

                    "Authorization": "Bearer " + token

                }

            }

        );

        const data = await response.json();

        const table =
            document.getElementById("timesheetTable");

        table.innerHTML = "";

        if (!data.success) return;

        data.timesheets.forEach(item => {

            table.innerHTML += `

            <tr>

                <td>${item.date}</td>

                <td>${item.projectName}</td>

                <td>${item.taskDetails}</td>

                <td>${item.hoursWorked}</td>

            </tr>

            `;

        });

    }

    catch (err) {

        console.log(err);

    }

}

// ===============================
// EDIT CLIENT
// ===============================

function editClient() {

    window.location.href =
        `clients.html?edit=${clientId}`;

}

// ===============================
// DELETE CLIENT
// ===============================

async function deleteClient() {

    if (!confirm("Delete this Client?"))
        return;

    try {

        const response = await fetch(

            `${CLIENT_API}/${clientId}`,

            {

                method: "DELETE",

                headers: {

                    "Authorization":
                        "Bearer " + token

                }

            }

        );

        const data = await response.json();

        alert(data.message);

        if (data.success) {

            window.location.href =
                "clients.html";

        }

    }

    catch (err) {

        console.log(err);

    }

}