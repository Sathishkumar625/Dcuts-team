/* =========================================================
   THE D CUTS — PREMIUM CLIENT MANAGEMENT
   clients.js
========================================================= */


/* =========================================================
   DEFAULT CLIENT DATA
========================================================= */

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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
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
        pending: 0,

        videos: 0,
        weeklyVideos: 0,
        monthlyVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
    }

];


/* =========================================================
   LOAD CLIENTS
========================================================= */

let clients = [];

try {

    clients =
        JSON.parse(
            localStorage.getItem("clients")
        );

} catch (error) {

    clients = [];

}


if (!Array.isArray(clients) || clients.length === 0) {

    clients =
        defaultClients.map(client => ({
            ...client
        }));

    saveClients();

}


/* =========================================================
   NORMALIZE OLD CLIENT DATA
========================================================= */

clients =
    clients.map(
        client => normalizeClient(client)
    );


saveClients();


/* =========================================================
   GLOBAL STATE
========================================================= */

let selectedClientIndex = -1;

let drawerMode = "view";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeClients();

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeClients() {

    setupEvents();

    loadClients();

    updateSummary();

}


/* =========================================================
   NORMALIZE CLIENT
========================================================= */

function normalizeClient(client) {

    const safeClient =
        client || {};


    const projects =
        toNumber(
            safeClient.projects
        );


    const completed =
        Math.min(
            toNumber(
                safeClient.completed
            ),
            projects
        );


    const pending =
        Math.max(
            projects - completed,
            0
        );


    return {

        code:
            safeClient.code ||
            "",

        name:
            safeClient.name ||
            "",

        location:
            safeClient.location ||
            "",

        contact:
            safeClient.contact ||
            "",

        phone:
            safeClient.phone ||
            "",

        email:
            safeClient.email ||
            "",

        status:
            safeClient.status ||
            "Active",

        projects,

        completed,

        pending,

        videos:
            toNumber(
                safeClient.videos
            ),

        weeklyVideos:
            toNumber(
                safeClient.weeklyVideos
            ),

        monthlyVideos:
            toNumber(
                safeClient.monthlyVideos
            ),

        weeklyTarget:
            toNumber(
                safeClient.weeklyTarget
            ),

        monthlyTarget:
            toNumber(
                safeClient.monthlyTarget
            ),

        notes:
            safeClient.notes ||
            "",

        createdAt:
            safeClient.createdAt ||
            new Date().toISOString()

    };

}


/* =========================================================
   SAVE CLIENTS
========================================================= */

function saveClients() {

    localStorage.setItem(
        "clients",
        JSON.stringify(
            clients
        )
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* SEARCH */

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


    /* ADD CLIENT */

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


    /* CLOSE DRAWER */

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


    /* CANCEL */

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


    /* OVERLAY */

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


    /* SAVE */

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


    /* DELETE */

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


    /* ESCAPE */

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


/* =========================================================
   LOAD CLIENTS
========================================================= */

function loadClients(
    keyword = ""
) {

    const clientBox =
        document.getElementById(
            "clientList"
        );


    if (!clientBox) {

        return;

    }


    const search =
        String(
            keyword
        )
        .trim()
        .toLowerCase();


    const filtered =
        clients.filter(
            client => {

                const text = [

                    client.code,

                    client.name,

                    client.location,

                    client.contact,

                    client.phone,

                    client.email,

                    client.status

                ]
                .join(" ")
                .toLowerCase();


                return text.includes(
                    search
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


        updateResultCount(
            0
        );


        return;

    }


    filtered.forEach(
        client => {

            const realIndex =
                clients.indexOf(
                    client
                );


            clientBox.insertAdjacentHTML(
                "beforeend",
                createClientCard(
                    client,
                    realIndex
                )
            );

        }
    );


    updateResultCount(
        filtered.length
    );

}


/* =========================================================
   CREATE CLIENT CARD
========================================================= */

function createClientCard(
    client,
    index
) {

    const status =
        client.status ||
        "Active";


    const projects =
        toNumber(
            client.projects
        );


    const completed =
        toNumber(
            client.completed
        );


    const videos =
        toNumber(
            client.videos
        );


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
                        ${
                            status === "Active"
                                ? "status-active"
                                : "status-inactive"
                        }
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
                    View Complete Details
                </span>

                <i class="fa-solid fa-arrow-right"></i>

            </div>

        </article>

    `;

}


/* =========================================================
   SUMMARY
========================================================= */

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
                sum,
                client
            ) => {

                return (
                    sum +
                    toNumber(
                        client.projects
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


/* =========================================================
   RESULT COUNT
========================================================= */

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


/* =========================================================
   OPEN VIEW DRAWER
========================================================= */

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


    setText(
        "drawerMode",
        "Client Details"
    );


    setText(
        "drawerTitle",
        client.name ||
        "Client Details"
    );


    openDrawer();

}


/* =========================================================
   OPEN ADD DRAWER
========================================================= */

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

        pending: 0,

        videos: 0,

        weeklyVideos: 0,

        monthlyVideos: 0,

        weeklyTarget: 0,

        monthlyTarget: 0,

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


/* =========================================================
   FILL DRAWER DETAILS
========================================================= */

function fillDrawerDetails(
    client
) {

    client =
        normalizeClient(
            client
        );


    /* PROFILE */

    setText(
        "drawerClientCode",
        client.code ||
        "--"
    );


    setText(
        "drawerClientName",
        client.name ||
        "New Client"
    );


    setText(
        "drawerStatus",
        client.status ||
        "Active"
    );


    /* BASIC DETAILS */

    setText(
        "detailCode",
        client.code ||
        "--"
    );


    setText(
        "detailName",
        client.name ||
        "--"
    );


    setText(
        "detailLocation",
        client.location ||
        "--"
    );


    setText(
        "detailPhone",
        client.phone ||
        "--"
    );


    setText(
        "detailEmail",
        client.email ||
        "--"
    );


    setText(
        "detailContact",
        client.contact ||
        "--"
    );


    /* PROJECT */

    setText(
        "detailProjects",
        client.projects
    );


    setText(
        "detailCompleted",
        client.completed
    );


    setText(
        "detailPending",
        client.pending
    );


    setText(
        "detailVideos",
        client.videos
    );


    /* WEEKLY */

    setText(
        "detailWeeklyVideos",
        client.weeklyVideos
    );


    setText(
        "detailWeeklyTarget",
        client.weeklyTarget
    );


    setText(
        "detailWeeklyBalance",
        Math.max(
            client.weeklyTarget -
            client.weeklyVideos,
            0
        )
    );


    /* MONTHLY */

    setText(
        "detailMonthlyVideos",
        client.monthlyVideos
    );


    setText(
        "detailMonthlyTarget",
        client.monthlyTarget
    );


    setText(
        "detailMonthlyBalance",
        Math.max(
            client.monthlyTarget -
            client.monthlyVideos,
            0
        )
    );


    /* NOTES */

    setText(
        "detailNotes",
        client.notes ||
        "No notes available."
    );


    /* STATUS */

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


/* =========================================================
   FILL EDIT FIELDS
========================================================= */

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
        client.projects
    );


    setInput(
        "editCompleted",
        client.completed
    );


    setInput(
        "editVideos",
        client.videos
    );


    setInput(
        "editWeeklyVideos",
        client.weeklyVideos
    );


    setInput(
        "editWeeklyTarget",
        client.weeklyTarget
    );


    setInput(
        "editMonthlyVideos",
        client.monthlyVideos
    );


    setInput(
        "editMonthlyTarget",
        client.monthlyTarget
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


/* =========================================================
   EDIT MODE
========================================================= */

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


    createEditButtonIfNeeded();

}


/* =========================================================
   CREATE EDIT BUTTON
========================================================= */

function createEditButtonIfNeeded() {

    const actions =
        document.querySelector(
            ".drawer-actions"
        );


    if (!actions) {

        return;

    }


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


        editButton.innerHTML = `

            <i class="fa-solid fa-pen"></i>

            Edit

        `;


        editButton.addEventListener(
            "click",
            () => {

                if (
                    selectedClientIndex < 0
                ) {

                    return;

                }


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


        const saveButton =
            document.getElementById(
                "saveClientBtn"
            );


        if (
            saveButton
        ) {

            actions.insertBefore(
                editButton,
                saveButton
            );

        } else {

            actions.appendChild(
                editButton
            );

        }

    }


    editButton.style.display =
        selectedClientIndex >= 0
            ? "inline-flex"
            : "none";

}


/* =========================================================
   SAVE CLIENT
========================================================= */

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
        toNumber(
            getInputValue(
                "editProjects"
            )
        );


    const completed =
        Math.min(
            toNumber(
                getInputValue(
                    "editCompleted"
                )
            ),
            projects
        );


    const videos =
        toNumber(
            getInputValue(
                "editVideos"
            )
        );


    const weeklyVideos =
        toNumber(
            getInputValue(
                "editWeeklyVideos"
            )
        );


    const weeklyTarget =
        toNumber(
            getInputValue(
                "editWeeklyTarget"
            )
        );


    const monthlyVideos =
        toNumber(
            getInputValue(
                "editMonthlyVideos"
            )
        );


    const monthlyTarget =
        toNumber(
            getInputValue(
                "editMonthlyTarget"
            )
        );


    const notes =
        getInputValue(
            "editNotes"
        );


    /* VALIDATION */

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


    /* DUPLICATE CODE */

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


    /* CLIENT OBJECT */

    const clientData = {

        code,

        name,

        location,

        contact,

        phone,

        email,

        status,

        projects,

        completed,

        pending:
            Math.max(
                projects -
                completed,
                0
            ),

        videos,

        weeklyVideos,

        monthlyVideos,

        weeklyTarget,

        monthlyTarget,

        notes,

        createdAt:
            selectedClientIndex >= 0
                ? (
                    clients[
                        selectedClientIndex
                    ]?.createdAt ||
                    new Date().toISOString()
                )
                : new Date().toISOString()

    };


    /* ADD */

    const isAdding =
        selectedClientIndex === -1;


    if (isAdding) {

        clients.push(
            clientData
        );

        selectedClientIndex =
            clients.length - 1;

    }

    /* UPDATE */

    else {

        clients[
            selectedClientIndex
        ] =
            clientData;

    }


    /* SAVE */

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
        isAdding
            ? "Client added successfully."
            : "Client updated successfully."
    );

}


/* =========================================================
   DELETE CLIENT
========================================================= */

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


    if (!client) {

        return;

    }


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


/* =========================================================
   OPEN DRAWER
========================================================= */

function openDrawer() {

    const drawer =
        document.getElementById(
            "clientDrawer"
        );


    const overlay =
        document.getElementById(
            "clientOverlay"
        );


    if (!drawer) {

        return;

    }


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


/* =========================================================
   CLOSE DRAWER
========================================================= */

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


    drawerMode =
        "view";

}


/* =========================================================
   NUMBER HELPER
========================================================= */

function toNumber(
    value
) {

    const number =
        Number(
            value
        );


    if (
        Number.isFinite(
            number
        )
    ) {

        return Math.max(
            number,
            0
        );

    }


    return 0;

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
            value ?? "";

    }

}


/* =========================================================
   SET INPUT
========================================================= */

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


/* =========================================================
   GET INPUT
========================================================= */

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


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

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

window.loadClients =
    loadClients;