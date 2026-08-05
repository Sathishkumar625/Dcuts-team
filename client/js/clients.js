/* =====================================
   THE D CUTS CLIENT MANAGEMENT
===================================== */

// Client List
const clients = [

    {
        code: "DRT",
        name: "Durgarani Shop",
        location: "Perumagoundampatti, Elampillai"
    },

    {
        code: "KC",
        name: "Kavya Creation",
        location: "Perumagoundampatti"
    },

    {
        code: "MS",
        name: "Manikandan Silk",
        location: "Perumagoundampatti"
    },

    {
        code: "SRG",
        name: "Sri Raja Ganapathi Silk",
        location: "Elampillai"
    },

    {
        code: "SST",
        name: "SST",
        location: "Elampillai"
    },

    {
        code: "VS",
        name: "Viswa Silk",
        location: "Elampillai"
    }

];

// Save Clients to LocalStorage
localStorage.setItem(
    "clients",
    JSON.stringify(clients)
);

// Elements
const clientBox = document.getElementById("clientList");

// =======================
// Load Clients
// =======================

function loadClients() {

    if (!clientBox) return;

    clientBox.innerHTML = "";

    clients.forEach(client => {

        clientBox.innerHTML += `

            <div class="client-card">

                <div class="client-icon">
                    <i class="fa-solid fa-store"></i>
                </div>

                <h1 class="client-code">
                    ${client.code}
                </h1>

                <h2 class="client-name">
                    ${client.name}
                </h2>

                <div class="client-location">
                    <i class="fa-solid fa-location-dot"></i>
                    ${client.location}
                </div>

            </div>

        `;

    });

}

// Initialize
loadClients();