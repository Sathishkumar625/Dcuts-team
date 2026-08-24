/* =====================================================
   THE D CUTS - CLIENT MANAGEMENT
   Premium Client Cards + Same Page Side Drawer
===================================================== */


/* =====================================================
   DEFAULT CLIENT DATA
===================================================== */

const defaultClients = [

    {
        code: "DRT",
        name: "Durgarani Shop",
        location: "Perumagoundampatti, Elampillai",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    },

    {
        code: "KC",
        name: "Kavya Creation",
        location: "Perumagoundampatti",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    },

    {
        code: "MS",
        name: "Manikandan Silk",
        location: "Perumagoundampatti",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    },

    {
        code: "SRG",
        name: "Sri Raja Ganapathi Silk",
        location: "Elampillai",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    },

    {
        code: "SST",
        name: "SST",
        location: "Elampillai",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    },

    {
        code: "VS",
        name: "Viswa Silk",
        location: "Elampillai",
        contact: "",
        phone: "",
        email: "",
        status: "Active",
        projects: 0,
        completed: 0,
        videos: 0,
        notes: ""
    }

];


/* =====================================================
   LOAD CLIENTS
===================================================== */

let clients =
    JSON.parse(
        localStorage.getItem("clients")
    );


if (
    !Array.isArray(clients) ||
    clients.length === 0
) {

    clients =
        defaultClients;

    saveClients();

}


/* =====================================================
   GLOBAL
===================================================== */

let selectedClientIndex = -1;

let drawerMode = "view";


/* =====================================================
   DOM READY
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeClients();

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

function initializeClients() {

    setupEvents();

    loadClients();

    updateSummary();

}


/* =====================================================
   SAVE LOCAL STORAGE
===================================================== */

function saveClients() {

    localStorage.setItem(
        "clients",
        JSON.stringify(
            clients
        )
    );

}


/* =====================================================
   EVENTS
===================================================== */

function setupEvents() {


    const search =
        document.getElementById(
            "searchClient"
        );


    if (search) {

        search.addEventListener(
            "input",
            () => {

                loadClients(
                    search.value
                );

            }
        );

    }


    const addButton =
        document.getElementById(
            "addClientBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            openAddDrawer
        );

    }


    const closeButton =
        document.getElementById(
            "closeDrawerBtn"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDrawer
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelDrawerBtn"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeDrawer
        );

    }


    const overlay =
        document.getElementById(
            "clientOverlay"
        );


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeDrawer
        );

    }


    const saveButton =
        document.getElementById(
            "saveClientBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveClientFromDrawer
        );

    }


    const deleteButton =
        document.getElementById(
            "deleteClientBtn"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            deleteSelectedClient
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeDrawer();

            }

        }
    );

}


/* =====================================================
   LOAD CLIENTS
===================================================== */

function loadClients(
    keyword = ""
) {

    const clientBox =
        document.getElementById(
            "clientList"
        );


    if (!clientBox) return;


    const search =
        String(keyword)
            .trim()
            .toLowerCase();


    const filtered =
        clients.filter(
            client => {

                return (

                    String(
                        client.code ||
                        ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        client.name ||
                        ""
                    )
                    .toLowerCase()
                    .includes(search)

                    ||

                    String(
                        client.location ||
                        ""
                    )
                    .toLowerCase()
                    .includes(search)

                );

            }
        );


    clientBox.innerHTML =
        "";


    if (
        filtered.length === 0
    ) {

        clientBox.innerHTML = `

            <div class="empty-client-state">

                <div class="empty-client-icon">

                    <i class="fa-solid fa-building-circle-xmark"></i>

                </div>

                <h3>
                    No Clients Found
                </h3>

                <p>
                    Try another search keyword.
                </p>

            </div>

        `;

        updateResultCount(0);

        return;

    }


    filtered.forEach(
        client => {

            const realIndex =
                clients.indexOf(
                    client
                );


            clientBox.innerHTML +=
                createClientCard(
                    client,
                    realIndex
                );

        }
    );


    updateResultCount(
        filtered.length
    );

}


/* =====================================================
   CREATE CLIENT CARD
===================================================== */

function createClientCard(
    client,
    index
) {

    const status =
        client.status ||
        "Active";


    const projects =
        Number(
            client.projects
        ) || 0;


    const completed =
        Number(
            client.completed
        ) || 0;


    const videos =
        Number(
            client.videos
        ) || 0;


    return `

        <article
            class="client-card"
            onclick="openViewDrawer(${index})"
        >


            <div class="client-card-glow"></div>


            <div class="client-card-top">


                <div class="client-icon">

                    <i class="fa-solid fa-store"></i>

                </div>


                <span
                    class="
                        client-status
                        ${status === "Active"
                            ? "status-active"
                            : "status-inactive"}
                    "
                >

                    <span class="status-dot"></span>

                    ${escapeHtml(status)}

                </span>


            </div>



            <div class="client-code">

                ${escapeHtml(
                    client.code ||
                    "--"
                )}

            </div>



            <h2 class="client-name">

                ${escapeHtml(
                    client.name ||
                    "Unnamed Client"
                )}

            </h2>



            <div class="client-location">

                <i class="fa-solid fa-location-dot"></i>

                <span>

                    ${escapeHtml(
                        client.location ||
                        "Location not added"
                    )}

                </span>

            </div>



            <div class="client-mini-stats">


                <div>

                    <strong>
                        ${projects}
                    </strong>

                    <span>
                        Projects
                    </span>

                </div>


                <div>

                    <strong>
                        ${completed}
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>


                <div>

                    <strong>
                        ${videos}
                    </strong>

                    <span>
                        Videos
                    </span>

                </div>


            </div>



            <div class="client-card-footer">

                <span>
                    View Details
                </span>

                <i class="fa-solid fa-arrow-right"></i>

            </div>


        </article>

    `;

}


/* =====================================================
   UPDATE SUMMARY
===================================================== */

function updateSummary() {


    const total =
        clients.length;


    const active =
        clients.filter(
            client =>
                client.status === "Active"
        ).length;


    const inactive =
        clients.filter(
            client =>
                client.status === "Inactive"
        ).length;


    const projects =
        clients.reduce(
            (
                total,
                client
            ) => {

                return (
                    total +
                    (
                        Number(
                            client.projects
                        ) || 0
                    )
                );

            },
            0
        );


    setText(
        "clientCount",
        total
    );


    setText(
        "activeClientCount",
        active
    );


    setText(
        "inactiveClientCount",
        inactive
    );


    setText(
        "projectCount",
        projects
    );


}


/* =====================================================
   RESULT COUNT
===================================================== */

function updateResultCount(
    count
) {

    setText(
        "resultCount",
        `${count} ${
            count === 1
                ? "Client"
                : "Clients"
        }`
    );

}


/* =====================================================
   VIEW DRAWER
===================================================== */

function openViewDrawer(
    index
) {

    if (
        !clients[index]
    ) {

        return;

    }


    selectedClientIndex =
        index;


    drawerMode =
        "view";


    const client =
        clients[index];


    fillDrawerDetails(
        client
    );


    setEditMode(
        false
    );


    openDrawer();

}


/* =====================================================
   ADD DRAWER
===================================================== */

function openAddDrawer() {


    selectedClientIndex =
        -1;


    drawerMode =
        "add";


    const emptyClient = {

        code: "",

        name: "",

        location: "",

        contact: "",

        phone: "",

        email: "",

        status: "Active",

        projects: 0,

        completed: 0,

        videos: 0,

        notes: ""

    };


    fillDrawerDetails(
        emptyClient
    );


    setEditMode(
        true
    );


    setText(
        "drawerMode",
        "Add New Client"
    );


    setText(
        "drawerTitle",
        "Create Client"
    );


    openDrawer();

}


/* =====================================================
   FILL DRAWER
===================================================== */

function fillDrawerDetails(
    client
) {


    setText(
        "drawerClientCode",
        client.code || "--"
    );


    setText(
        "drawerClientName",
        client.name || "New Client"
    );


    setText(
        "drawerStatus",
        client.status || "Active"
    );


    setText(
        "detailCode",
        client.code || "--"
    );


    setText(
        "detailName",
        client.name || "--"
    );


    setText(
        "detailLocation",
        client.location || "--"
    );


    setText(
        "detailPhone",
        client.phone || "--"
    );


    setText(
        "detailEmail",
        client.email || "--"
    );


    setText(
        "detailContact",
        client.contact || "--"
    );


    setText(
        "detailProjects",
        Number(
            client.projects
        ) || 0
    );


    setText(
        "detailCompleted",
        Number(
            client.completed
        ) || 0
    );


    const pending =
        Math.max(
            (
                Number(
                    client.projects
                ) || 0
            ) -
            (
                Number(
                    client.completed
                ) || 0
            ),
            0
        );


    setText(
        "detailPending",
        pending
    );


    setText(
        "detailVideos",
        Number(
            client.videos
        ) || 0
    );


    setText(
        "detailNotes",
        client.notes ||
        "No notes available."
    );


    const statusElement =
        document.getElementById(
            "drawerStatus"
        );


    if (statusElement) {

        statusElement.className =
            `drawer-status ${
                client.status === "Active"
                    ? "drawer-status-active"
                    : "drawer-status-inactive"
            }`;

    }


    fillEditFields(
        client
    );

}


/* =====================================================
   FILL EDIT FIELDS
===================================================== */

function fillEditFields(
    client
) {


    setInput(
        "editCode",
        client.code
    );


    setInput(
        "editName",
        client.name
    );


    setInput(
        "editLocation",
        client.location
    );


    setInput(
        "editContact",
        client.contact
    );


    setInput(
        "editPhone",
        client.phone
    );


    setInput(
        "editEmail",
        client.email
    );


    setInput(
        "editProjects",
        Number(
            client.projects
        ) || 0
    );


    setInput(
        "editCompleted",
        Number(
            client.completed
        ) || 0
    );


    setInput(
        "editVideos",
        Number(
            client.videos
        ) || 0
    );


    setInput(
        "editNotes",
        client.notes
    );


    const status =
        document.getElementById(
            "editStatus"
        );


    if (status) {

        status.value =
            client.status ||
            "Active";

    }

}


/* =====================================================
   EDIT MODE
===================================================== */

function setEditMode(
    editing
) {


    const form =
        document.getElementById(
            "drawerEditForm"
        );


    const saveButton =
        document.getElementById(
            "saveClientBtn"
        );


    const deleteButton =
        document.getElementById(
            "deleteClientBtn"
        );


    if (form) {

        form.style.display =
            editing
                ? "block"
                : "none";

    }


    if (saveButton) {

        saveButton.style.display =
            editing
                ? "inline-flex"
                : "none";

    }


    if (deleteButton) {

        deleteButton.style.display =
            (
                editing &&
                selectedClientIndex >= 0
            )
                ? "inline-flex"
                : "none";

    }


    const cancelButton =
        document.getElementById(
            "cancelDrawerBtn"
        );


    if (cancelButton) {

        cancelButton.textContent =
            editing
                ? "Cancel"
                : "Close";

    }


    if (!editing) {

        createEditButtonIfNeeded();

    }

}


/* =====================================================
   EDIT BUTTON
===================================================== */

function createEditButtonIfNeeded() {


    const actions =
        document.querySelector(
            ".drawer-actions"
        );


    if (!actions) return;


    let editButton =
        document.getElementById(
            "editClientBtn"
        );


    if (!editButton) {

        editButton =
            document.createElement(
                "button"
            );


        editButton.type =
            "button";


        editButton.id =
            "editClientBtn";


        editButton.className =
            "drawer-edit-btn";


        editButton.innerHTML =
            `
                <i class="fa-solid fa-pen"></i>
                Edit
            `;


        editButton.addEventListener(
            "click",
            () => {

                drawerMode =
                    "edit";


                setText(
                    "drawerMode",
                    "Edit Client"
                );


                setText(
                    "drawerTitle",
                    "Update Client"
                );


                setEditMode(
                    true
                );

            }
        );


        actions.insertBefore(
            editButton,
            actions.children[
                actions.children.length - 1
            ]
        );

    }


    editButton.style.display =
        selectedClientIndex >= 0
            ? "inline-flex"
            : "none";

}


/* =====================================================
   SAVE CLIENT
===================================================== */

function saveClientFromDrawer() {


    const code =
        getInputValue(
            "editCode"
        );


    const name =
        getInputValue(
            "editName"
        );


    const location =
        getInputValue(
            "editLocation"
        );


    const contact =
        getInputValue(
            "editContact"
        );


    const phone =
        getInputValue(
            "editPhone"
        );


    const email =
        getInputValue(
            "editEmail"
        );


    const status =
        document.getElementById(
            "editStatus"
        )?.value ||
        "Active";


    const projects =
        Number(
            getInputValue(
                "editProjects"
            )
        ) || 0;


    const completed =
        Number(
            getInputValue(
                "editCompleted"
            )
        ) || 0;


    const videos =
        Number(
            getInputValue(
                "editVideos"
            )
        ) || 0;


    const notes =
        getInputValue(
            "editNotes"
        );


    if (!code) {

        alert(
            "Please enter Client ID."
        );

        return;

    }


    if (!name) {

        alert(
            "Please enter Client Name."
        );

        return;

    }


    if (!location) {

        alert(
            "Please enter Location."
        );

        return;

    }


    const duplicate =
        clients.some(
            (
                client,
                index
            ) => {

                return (

                    index !==
                    selectedClientIndex &&

                    String(
                        client.code ||
                        ""
                    )
                    .trim()
                    .toLowerCase()
                    ===
                    code
                        .trim()
                        .toLowerCase()

                );

            }
        );


    if (duplicate) {

        alert(
            "This Client ID already exists."
        );

        return;

    }


    const clientData = {

        code,

        name,

        location,

        contact,

        phone,

        email,

        status,

        projects,

        completed:
            Math.min(
                completed,
                projects
            ),

        videos,

        notes

    };


    if (
        selectedClientIndex === -1
    ) {

        clients.push(
            clientData
        );

    }

    else {

        clients[
            selectedClientIndex
        ] =
            clientData;

    }


    saveClients();

    loadClients();

    updateSummary();

    fillDrawerDetails(
        clientData
    );


    setEditMode(
        false
    );


    drawerMode =
        "view";


    setText(
        "drawerMode",
        "Client Details"
    );


    setText(
        "drawerTitle",
        clientData.name
    );


    createEditButtonIfNeeded();


    alert(
        selectedClientIndex === -1
            ? "Client added successfully."
            : "Client updated successfully."
    );

}


/* =====================================================
   DELETE CLIENT
===================================================== */

function deleteSelectedClient() {


    if (
        selectedClientIndex < 0
    ) {

        return;

    }


    const client =
        clients[
            selectedClientIndex
        ];


    const confirmDelete =
        confirm(
            `Delete ${client.name}?`
        );


    if (!confirmDelete) {

        return;

    }


    clients.splice(
        selectedClientIndex,
        1
    );


    saveClients();

    loadClients();

    updateSummary();

    closeDrawer();


    alert(
        "Client deleted successfully."
    );

}


/* =====================================================
   OPEN DRAWER
===================================================== */

function openDrawer() {


    const drawer =
        document.getElementById(
            "clientDrawer"
        );


    const overlay =
        document.getElementById(
            "clientOverlay"
        );


    if (!drawer) return;


    drawer.classList.add(
        "drawer-open"
    );


    if (overlay) {

        overlay.classList.add(
            "overlay-open"
        );

    }


    document.body.classList.add(
        "drawer-body-lock"
    );


    createEditButtonIfNeeded();

}


/* =====================================================
   CLOSE DRAWER
===================================================== */

function closeDrawer() {


    const drawer =
        document.getElementById(
            "clientDrawer"
        );


    const overlay =
        document.getElementById(
            "clientOverlay"
        );


    if (drawer) {

        drawer.classList.remove(
            "drawer-open"
        );

    }


    if (overlay) {

        overlay.classList.remove(
            "overlay-open"
        );

    }


    document.body.classList.remove(
        "drawer-body-lock"
    );


    selectedClientIndex =
        -1;

}


/* =====================================================
   HELPERS
===================================================== */

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


function setInput(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value ?? "";

    }

}


function getInputValue(
    id
) {

    return (
        document.getElementById(
            id
        )?.value
        ?.trim() ||
        ""
    );

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


/* =====================================================
   GLOBAL
===================================================== */

window.openViewDrawer =
    openViewDrawer;

window.openAddDrawer =
    openAddDrawer;

window.closeDrawer =
    closeDrawer;

window.saveClientFromDrawer =
    saveClientFromDrawer;

window.deleteSelectedClient =
    deleteSelectedClient;