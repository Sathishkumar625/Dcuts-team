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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

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

        completedVideos: 0,
        pendingVideos: 0,

        mondayVideos: 0,
        tuesdayVideos: 0,
        wednesdayVideos: 0,
        thursdayVideos: 0,
        fridayVideos: 0,
        saturdayVideos: 0,
        sundayVideos: 0,

        weeklyTarget: 0,
        monthlyTarget: 0,

        notes: "",

        createdAt: new Date().toISOString()
    }

];


/* =========================================================
   GLOBAL STATE
========================================================= */

let clients = [];

let selectedClientIndex = -1;

let drawerMode = "view";


/* =========================================================
   LOAD CLIENT DATA
========================================================= */

try {

    clients =
        JSON.parse(
            localStorage.getItem("clients")
        );

} catch (error) {

    clients = [];

}


if (
    !Array.isArray(clients) ||
    clients.length === 0
) {

    clients =
        defaultClients.map(
            client => ({
                ...client
            })
        );

}


/* =========================================================
   NORMALIZE EXISTING CLIENT DATA
========================================================= */

clients =
    clients.map(
        client =>
            normalizeClient(client)
    );


/* =========================================================
   SAVE
========================================================= */

saveClients();


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

    syncClientStatistics();

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
            projects -
            completed,
            0
        );


    const videos =
        toNumber(
            safeClient.videos
        );


    const completedVideos =
        Math.min(
            toNumber(
                safeClient.completedVideos
            ),
            videos
        );


    const pendingVideos =
        Math.max(
            videos -
            completedVideos,
            0
        );


    return {

        code:
            String(
                safeClient.code ||
                ""
            ).trim(),

        name:
            String(
                safeClient.name ||
                ""
            ).trim(),

        location:
            String(
                safeClient.location ||
                ""
            ).trim(),

        contact:
            String(
                safeClient.contact ||
                ""
            ).trim(),

        phone:
            String(
                safeClient.phone ||
                ""
            ).trim(),

        email:
            String(
                safeClient.email ||
                ""
            ).trim(),

        status:
            safeClient.status === "Inactive"
                ? "Inactive"
                : "Active",

        projects,

        completed,

        pending,

        videos,

        completedVideos,

        pendingVideos,

        weeklyVideos:
            toNumber(
                safeClient.weeklyVideos
            ),

        monthlyVideos:
            toNumber(
                safeClient.monthlyVideos
            ),

        mondayVideos:
            toNumber(
                safeClient.mondayVideos
            ),

        tuesdayVideos:
            toNumber(
                safeClient.tuesdayVideos
            ),

        wednesdayVideos:
            toNumber(
                safeClient.wednesdayVideos
            ),

        thursdayVideos:
            toNumber(
                safeClient.thursdayVideos
            ),

        fridayVideos:
            toNumber(
                safeClient.fridayVideos
            ),

        saturdayVideos:
            toNumber(
                safeClient.saturdayVideos
            ),

        sundayVideos:
            toNumber(
                safeClient.sundayVideos
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
            String(
                safeClient.notes ||
                ""
            ).trim(),

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


    /* CLOSE */

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
            () => {

                if (
                    drawerMode === "edit" ||
                    drawerMode === "add"
                ) {

                    closeDrawer();

                } else {

                    closeDrawer();

                }

            }
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


    /* ESC */

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
   SYNC CLIENT STATISTICS
========================================================= */

function syncClientStatistics() {

    let timesheets = [];

    try {

        timesheets =
            JSON.parse(
                localStorage.getItem(
                    "timesheets"
                )
            ) || [];

    } catch (error) {

        timesheets = [];

    }


    if (
        !Array.isArray(timesheets) ||
        timesheets.length === 0
    ) {

        return;

    }


    clients =
        clients.map(
            client => {

                const clientName =
                    String(
                        client.name || ""
                    )
                    .trim()
                    .toLowerCase();


                const matchingEntries =
                    timesheets.filter(
                        item => {

                            const project =
                                String(
                                    item.project ||
                                    ""
                                )
                                .trim()
                                .toLowerCase();


                            return (
                                project &&
                                (
                                    project.includes(
                                        clientName
                                    ) ||
                                    clientName.includes(
                                        project
                                    )
                                )
                            );

                        }
                    );


                if (
                    matchingEntries.length === 0
                ) {

                    return client;

                }


                let totalHours = 0;

                matchingEntries.forEach(
                    entry => {

                        totalHours +=
                            toNumber(
                                entry.hours
                            );

                    }
                );


                return {

                    ...client,

                    timesheetHours:
                        totalHours

                };

            }
        );


    clients =
        clients.map(
            client =>
                normalizeClient(
                    client
                )
        );


    saveClients();

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


    const pending =
        Math.max(
            projects -
            completed,
            0
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
   OPEN VIEW
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
        normalizeClient(
            clients[index]
        );


    clients[index] =
        client;


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
   OPEN ADD
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

        completedVideos: 0,

        pendingVideos: 0,

        weeklyVideos: 0,

        monthlyVideos: 0,

        mondayVideos: 0,

        tuesdayVideos: 0,

        wednesdayVideos: 0,

        thursdayVideos: 0,

        fridayVideos: 0,

        saturdayVideos: 0,

        sundayVideos: 0,

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
   FILL DRAWER
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


    /* BASIC */

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


    /* VIDEO PERFORMANCE */

    setText(
        "weeklyVideos",
        client.weeklyVideos
    );


    setText(
        "monthlyVideos",
        client.monthlyVideos
    );


    setText(
        "completedVideos",
        client.completedVideos
    );


    setText(
        "pendingVideos",
        client.pendingVideos
    );


    /* WEEKLY DAYS */

    setText(
        "mondayVideos",
        `${client.mondayVideos} Videos`
    );


    setText(
        "tuesdayVideos",
        `${client.tuesdayVideos} Videos`
    );


    setText(
        "wednesdayVideos",
        `${client.wednesdayVideos} Videos`
    );


    setText(
        "thursdayVideos",
        `${client.thursdayVideos} Videos`
    );


    setText(
        "fridayVideos",
        `${client.fridayVideos} Videos`
    );


    setText(
        "saturdayVideos",
        `${client.saturdayVideos} Videos`
    );


    setText(
        "sundayVideos",
        `${client.sundayVideos} Videos`
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
        "editMonthlyVideos",
        client.monthlyVideos
    );


    setInput(
        "editWeeklyTarget",
        client.weeklyTarget
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
   EDIT BUTTON
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


    const monthlyVideos =
        toNumber(
            getInputValue(
                "editMonthlyVideos"
            )
        );


    const weeklyTarget =
        toNumber(
            getInputValue(
                "editWeeklyTarget"
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


    /* DUPLICATE */

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


    /* KEEP EXISTING DATA */

    const oldClient =
        selectedClientIndex >= 0
            ? clients[
                selectedClientIndex
            ]
            : {};


    const clientData =
        normalizeClient({

            ...oldClient,

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
                oldClient.createdAt ||
                new Date().toISOString()

        });


    const isAdding =
        selectedClientIndex === -1;


    if (isAdding) {

        clients.push(
            clientData
        );

        selectedClientIndex =
            clients.length - 1;

    } else {

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


    drawerMode =
        "view";


    setEditMode(
        false
    );


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
   NUMBER
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