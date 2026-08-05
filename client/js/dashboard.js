/* =====================================
   THE D CUTS LIVE DASHBOARD
===================================== */

function loadDashboard() {

    // Employees
    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    // Clients / Projects
    let clients = JSON.parse(localStorage.getItem("clients")) || [];

    // Timesheet Reports
    let reports = JSON.parse(localStorage.getItem("timesheets")) || [];

    // Dashboard Counts
    document.getElementById("employeeCount").innerHTML = employees.length;
    document.getElementById("projectCount").innerHTML = clients.length;
    document.getElementById("reportCount").innerHTML = reports.length;

    // Recent Reports Container
    let recent = document.getElementById("recentReports");

    recent.innerHTML = "";

    if (reports.length === 0) {

        recent.innerHTML = `
            <p>No Reports Available</p>
        `;

        return;
    }

    // Show Latest 5 Reports
    reports
        .slice(-5)
        .reverse()
        .forEach(item => {

            recent.innerHTML += `
                <div class="recent-card">

                    <h3>${item.project}</h3>

                    <p>${item.employee}</p>

                    <span>${item.date}</span>

                </div>
            `;

        });

}

// Load Dashboard
loadDashboard();