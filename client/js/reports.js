/* =====================================
   THE D CUTS REPORT SYSTEM
===================================== */

// Clients
const clients = JSON.parse(localStorage.getItem("clients")) || [];

// Timesheets
const timesheets = JSON.parse(localStorage.getItem("timesheets")) || [];

// Report Container
const container = document.getElementById("reportContainer");

function loadReports() {

    container.innerHTML = "";

    clients.forEach(client => {

        // Timesheets for this client/project
        let projectTimes = timesheets.filter(item =>
            item.project === client.code
        );

        // Total Videos (Today's Entries)
        let todayVideos = projectTimes.length;

        // Balance Videos
        let balanceVideos = 0;

        container.innerHTML += `

            <div class="report-card">

                <div class="report-icon">
                    <i class="fa-solid fa-video"></i>
                </div>

                <h2>${client.code}</h2>

                <h3>${client.name}</h3>

                <p class="location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${client.location}
                </p>

                <div class="report-box">

                    <div>
                        <span>Today Videos</span>
                        <strong>${todayVideos}</strong>
                    </div>

                    <div>
                        <span>Balance Videos</span>
                        <strong>${balanceVideos}</strong>
                    </div>

                </div>

                <div class="details">

                    <h4>Timesheet Details</h4>

                    ${
                        projectTimes.length === 0
                        ? "<p>No Data</p>"
                        : projectTimes.map(item => `
                            <p>
                                ${item.employee} -
                                ${item.task} -
                                ${item.hours} Hours
                            </p>
                        `).join("")
                    }

                </div>

            </div>

        `;

    });

}

// Load Reports
loadReports();