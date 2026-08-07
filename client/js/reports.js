/* =====================================
   THE D CUTS REPORT SYSTEM
===================================== */

const clients = JSON.parse(localStorage.getItem("clients")) || [];

const timesheets = JSON.parse(localStorage.getItem("timesheets")) || [];

const container = document.getElementById("reportContainer");

function loadReports() {

    container.innerHTML = "";

    if (clients.length === 0) {

        container.innerHTML = `

        <div class="report-card">

            <h2>No Clients Found</h2>

        </div>

        `;

        return;

    }

    clients.forEach(client => {

        const projectTimes = timesheets.filter(item =>

            item.project === client.code

        );

        let totalVideos = 0;

        let completedVideos = 0;

        let balanceVideos = 0;

        projectTimes.forEach(item => {

            totalVideos += Number(item.totalVideos || 0);

            completedVideos += Number(item.completedVideos || 0);

            balanceVideos += Number(item.balanceVideos || 0);

        });

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

                    <span>Total Videos</span>

                    <strong>${totalVideos}</strong>

                </div>

                <div>

                    <span>Completed</span>

                    <strong>${completedVideos}</strong>

                </div>

                <div>

                    <span>Balance</span>

                    <strong>${balanceVideos}</strong>

                </div>

            </div>

            <div class="details">

                <h4>Employee Work Details</h4>

                ${
                projectTimes.length === 0

                ?

                "<p>No Timesheet Submitted</p>"

                :

                projectTimes.map(item => `

                    <div style="margin-bottom:12px;
                                padding:10px;
                                border-bottom:1px solid #333;">

                        <strong>${item.employee}</strong><br>

                        📅 ${item.date}<br>

                        🎬 Total :
                        ${item.totalVideos}<br>

                        ✅ Completed :
                        ${item.completedVideos}<br>

                        ⏳ Balance :
                        ${item.balanceVideos}<br>

                        💬 ${item.comments || "-"}

                    </div>

                `).join("")

                }

            </div>

        </div>

        `;

    });

}

loadReports();