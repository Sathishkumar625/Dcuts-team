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
   GLOBAL VARIABLES
========================================================= */

let clients = [];

let selectedClientIndex = -1;

let drawerMode = "view";


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeClients
);


function initializeClients() {

    loadStoredClients();

    setupEvents();

    syncClientStatistics();

    loadClients();

    updateSummary();

}


/* =========================================================
   LOAD STORED CLIENTS
========================================================= */

function loadStoredClients() {

    let stored = [];

    try {

        stored =
            JSON.parse(
                localStorage.getItem(
                    "clients"
                )
            ) || [];

    } catch (error) {

        stored = [];

    }


    if (
        Array.isArray(stored) &&
        stored.length
    ) {

        clients =
            stored.map(
                normalizeClient
            );

    } else {

        clients =
            defaultClients.map(
                normalizeClient
            );

        saveClients();

    }

}


/* =========================================================
   NORMALIZE CLIENT
========================================================= */

function normalizeClient(
    client
) {

    const safeClient =
        client || {};


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
            safeClient.status ===
            "Inactive"
                ? "Inactive"
                : "Active",


        projects:
            toNumber(
                safeClient.projects
            ),

        completed:
            toNumber(
                safeClient.completed
            ),

        pending:
            toNumber(
                safeClient.pending
            ),


        videos:
            toNumber(
                safeClient.videos
            ),

        completedVideos:
            toNumber(
                safeClient.completedVideos
            ),

        pendingVideos:
            toNumber(
                safeClient.pendingVideos
            ),


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


        timesheetHours:
            toNumber(
                safeClient.timesheetHours
            ),


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
        !Array.isArray(timesheets)
    ) {

        timesheets = [];

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


                const clientCode =
                    String(
                        client.code || ""
                    )
                    .trim()
                    .toLowerCase();


                const matchingEntries =
                    timesheets.filter(
                        item => {

                            const values = [

                                item.clientCode,
                                item.client,
                                item.clientName,

                                item.project,
                                item.projectCode,
                                item.projectName,

                                item.Client?.code,
                                item.Client?.name,

                                item.project?.code,
                                item.project?.name

                            ]
                            .map(
                                value =>
                                    String(
                                        value ?? ""
                                    )
                                    .trim()
                                    .toLowerCase()
                            )
                            .filter(Boolean);


                            return values.some(
                                value => {

                                    if (
                                        clientCode &&
                                        value ===
                                        clientCode
                                    ) {

                                        return true;

                                    }


                                    if (
                                        clientName &&
                                        (
                                            value ===
                                            clientName ||
                                            value.includes(
                                                clientName
                                            ) ||
                                            clientName.includes(
                                                value
                                            )
                                        )
                                    ) {

                                        return true;

                                    }


                                    return false;

                                }
                            );

                        }
                    );


                let totalHours = 0;


                matchingEntries.forEach(
                    entry => {

                        totalHours +=
                            toNumber(
                                entry.hours ??
                                entry.workingHours ??
                                (
                                    toNumber(
                                        entry.workingMinutes
                                    ) / 60
                                )
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
            normalizeClient
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


    clientBox.innerHTML =
        filtered
            .map(
                client => {

                    const index =
                        clients.indexOf(
                            client
                        );

                    return createClientCard(
                        client,
                        index
                    );

                }
            )
            .join("");


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


    const workflow =
        getWorkflowSummary(
            client
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
                    class="client-status ${
                        status === "Active"
                            ? "status-active"
                            : "status-inactive"
                    }"
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
                        ${toNumber(
                            client.projects
                        )}
                    </strong>

                    <span>
                        Projects
                    </span>

                </div>


                <div>

                    <strong>
                        ${toNumber(
                            client.completedVideos
                        )}
                    </strong>

                    <span>
                        Completed
                    </span>

                </div>


                <div>

                    <strong>
                        ${toNumber(
                            client.videos
                        )}
                    </strong>

                    <span>
                        Current Videos
                    </span>

                </div>

            </div>


            <div
                class="client-workflow-mini"
                style="
                    display:grid;
                    grid-template-columns:repeat(3,1fr);
                    gap:6px;
                    margin-top:12px;
                "
            >

                <div
                    style="
                        padding:7px;
                        border-radius:9px;
                        background:rgba(255,255,255,.035);
                        text-align:center;
                    "
                >

                    <strong>
                        ${workflow.shoot}
                    </strong>

                    <small
                        style="
                            display:block;
                            opacity:.55;
                            font-size:9px;
                        "
                    >
                        SHOOT
                    </small>

                </div>


                <div
                    style="
                        padding:7px;
                        border-radius:9px;
                        background:rgba(255,255,255,.035);
                        text-align:center;
                    "
                >

                    <strong>
                        ${workflow.edit}
                    </strong>

                    <small
                        style="
                            display:block;
                            opacity:.55;
                            font-size:9px;
                        "
                    >
                        EDIT
                    </small>

                </div>


                <div
                    style="
                        padding:7px;
                        border-radius:9px;
                        background:rgba(255,255,255,.035);
                        text-align:center;
                    "
                >

                    <strong>
                        ${workflow.upload}
                    </strong>

                    <small
                        style="
                            display:block;
                            opacity:.55;
                            font-size:9px;
                        "
                    >
                        UPLOAD
                    </small>

                </div>

            </div>


            <div class="client-card-footer">

                <span>
                    View Current Details
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

    setText(
        "clientCount",
        clients.length
    );


    setText(
        "activeClientCount",
        clients.filter(
            client =>
                client.status ===
                "Active"
        ).length
    );


    setText(
        "inactiveClientCount",
        clients.filter(
            client =>
                client.status ===
                "Inactive"
        ).length
    );


    setText(
        "projectCount",
        clients.reduce(
            (
                total,
                client
            ) =>
                total +
                toNumber(
                    client.projects
                ),
            0
        )
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
   VIEW DRAWER
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


    clients[index] =
        normalizeClient(
            clients[index]
        );


    fillDrawerDetails(
        clients[index]
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
        clients[index].name ||
        "Client Details"
    );


    openDrawer();

}


/* =========================================================
   ADD DRAWER
========================================================= */

function openAddDrawer() {

    selectedClientIndex =
        -1;


    drawerMode =
        "add";


    const empty =
        normalizeClient({

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

        });


    fillDrawerDetails(
        empty
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


    renderClientWorkflow(
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
   EDIT BUTTON
========================================================= */

function setEditMode(
    editing
) {

    const form =
        document.getElementById(
            "drawerEditForm"
        );


    const save =
        document.getElementById(
            "saveClientBtn"
        );


    const del =
        document.getElementById(
            "deleteClientBtn"
        );


    const cancel =
        document.getElementById(
            "cancelDrawerBtn"
        );


    if (form) {

        form.style.display =
            editing
                ? "block"
                : "none";

    }


    if (save) {

        save.style.display =
            editing
                ? "inline-flex"
                : "none";

    }


    if (del) {

        del.style.display =
            editing &&
            selectedClientIndex >= 0
                ? "inline-flex"
                : "none";

    }


    if (cancel) {

        cancel.textContent =
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


    let edit =
        document.getElementById(
            "editClientBtn"
        );


    if (!edit) {

        edit =
            document.createElement(
                "button"
            );


        edit.type =
            "button";


        edit.id =
            "editClientBtn";


        edit.className =
            "drawer-edit-btn";


        edit.innerHTML = `

            <i class="fa-solid fa-pen"></i>
            Edit

        `;


        edit.addEventListener(
            "click",
            () => {

                if (
                    selectedClientIndex <
                    0
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


        const save =
            document.getElementById(
                "saveClientBtn"
            );


        if (save) {

            actions.insertBefore(
                edit,
                save
            );

        } else {

            actions.appendChild(
                edit
            );

        }

    }


    edit.style.display =
        selectedClientIndex >= 0 &&
        drawerMode !== "add"
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
                    .toLowerCase() ===
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


    const old =
        selectedClientIndex >= 0
            ? clients[
                selectedClientIndex
            ]
            : {};


    const clientData =
        normalizeClient({

            ...old,

            code,
            name,
            location,

            contact:
                getInputValue(
                    "editContact"
                ),

            phone:
                getInputValue(
                    "editPhone"
                ),

            email:
                getInputValue(
                    "editEmail"
                ),

            status:
                document.getElementById(
                    "editStatus"
                )?.value ||
                "Active",

            projects:
                toNumber(
                    getInputValue(
                        "editProjects"
                    )
                ),

            completed:
                toNumber(
                    getInputValue(
                        "editCompleted"
                    )
                ),

            videos:
                toNumber(
                    getInputValue(
                        "editVideos"
                    )
                ),

            weeklyVideos:
                toNumber(
                    getInputValue(
                        "editWeeklyVideos"
                    )
                ),

            monthlyVideos:
                toNumber(
                    getInputValue(
                        "editMonthlyVideos"
                    )
                ),

            weeklyTarget:
                toNumber(
                    getInputValue(
                        "editWeeklyTarget"
                    )
                ),

            monthlyTarget:
                toNumber(
                    getInputValue(
                        "editMonthlyTarget"
                    )
                ),

            notes:
                getInputValue(
                    "editNotes"
                ),

            createdAt:
                old.createdAt ||
                new Date().toISOString()

        });


    const adding =
        selectedClientIndex ===
        -1;


    if (adding) {

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

    syncClientStatistics();

    loadClients(
        document.getElementById(
            "searchClient"
        )?.value ||
        ""
    );

    updateSummary();


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


    fillDrawerDetails(
        clients[
            selectedClientIndex
        ]
    );


    createEditButtonIfNeeded();


    alert(
        adding
            ? "Client added successfully."
            : "Client updated successfully."
    );

}


/* =========================================================
   DELETE CLIENT
========================================================= */

function deleteSelectedClient() {

    if (
        selectedClientIndex <
        0
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


    if (
        !confirm(
            `Delete ${client.name}?`
        )
    ) {

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
   DRAWER
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


    const workflowPanel =
        document.getElementById(
            "clientVideoWorkflow"
        );


    if (workflowPanel) {

        workflowPanel.remove();

    }


    selectedClientIndex =
        -1;


    drawerMode =
        "view";

}


/* =========================================================
   CLIENT VIDEO WORKFLOW
   SHOOT → EDIT → UPLOAD

   This is Client-page only.
   Existing Timesheet is NOT modified.
========================================================= */

const CLIENT_VIDEO_WORKFLOW_KEY =
    "clientVideoWorkflow";


function readClientVideoWorkflow() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    CLIENT_VIDEO_WORKFLOW_KEY
                )
            ) || [];


        return Array.isArray(
            data
        )
            ? data
            : [];

    } catch (error) {

        return [];

    }

}


function saveClientVideoWorkflow(
    records
) {

    localStorage.setItem(
        CLIENT_VIDEO_WORKFLOW_KEY,
        JSON.stringify(
            Array.isArray(
                records
            )
                ? records
                : []
        )
    );

}


/* =========================================================
   CLIENT WORKFLOW RECORDS
========================================================= */

function getClientWorkflowRecords(
    client
) {

    if (!client) {

        return [];

    }


    const code =
        String(
            client.code ||
            ""
        )
        .trim()
        .toLowerCase();


    const name =
        String(
            client.name ||
            ""
        )
        .trim()
        .toLowerCase();


    return readClientVideoWorkflow()
        .filter(
            record => {

                const recordCode =
                    String(
                        record.clientCode ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                const recordName =
                    String(
                        record.clientName ||
                        ""
                    )
                    .trim()
                    .toLowerCase();


                return (

                    (
                        code &&
                        recordCode ===
                        code
                    ) ||

                    (
                        name &&
                        recordName ===
                        name
                    )

                );

            }
        );

}


/* =========================================================
   TODAY
========================================================= */

function getTodayKey() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   WORKFLOW COUNT
========================================================= */

function getWorkflowCount(
    records,
    stage,
    date = ""
) {

    return records
        .filter(
            record => {

                return (

                    String(
                        record.stage ||
                        ""
                    )
                    .toLowerCase() ===
                    String(
                        stage
                    )
                    .toLowerCase()

                    &&

                    (
                        !date ||
                        record.date ===
                        date
                    )

                );

            }
        )
        .reduce(
            (
                total,
                record
            ) => {

                return (

                    total +
                    toNumber(
                        record.count
                    )

                );

            },
            0
        );

}


/* =========================================================
   WORKFLOW SUMMARY
========================================================= */

function getWorkflowSummary(
    client
) {

    const records =
        getClientWorkflowRecords(
            client
        );


    const today =
        getTodayKey();


    return {

        records,

        shoot:
            getWorkflowCount(
                records,
                "Shoot"
            ),

        edit:
            getWorkflowCount(
                records,
                "Edit"
            ),

        upload:
            getWorkflowCount(
                records,
                "Upload"
            ),

        todayShoot:
            getWorkflowCount(
                records,
                "Shoot",
                today
            ),

        todayEdit:
            getWorkflowCount(
                records,
                "Edit",
                today
            ),

        todayUpload:
            getWorkflowCount(
                records,
                "Upload",
                today
            )

    };

}


/* =========================================================
   WORKFLOW STYLES
   Injected from JS so existing CSS/HTML need not be changed.
========================================================= */

function ensureClientWorkflowStyles() {

    if (
        document.getElementById(
            "clientWorkflowInjectedStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "clientWorkflowInjectedStyles";


    style.textContent = `

        .client-video-workflow {
            margin-top: 22px;
            padding: 18px;
            border: 1px solid rgba(255,255,255,.10);
            border-radius: 16px;
            background: rgba(255,255,255,.035);
        }

        .client-video-workflow-title {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:14px;
        }

        .client-video-workflow-title strong {
            font-size:15px;
            letter-spacing:.04em;
        }

        .client-video-workflow-title span {
            font-size:11px;
            opacity:.65;
        }

        .client-video-workflow-stages {
            display:grid;
            grid-template-columns:repeat(3,minmax(0,1fr));
            gap:10px;
        }

        .client-video-stage {
            border:1px solid rgba(255,255,255,.08);
            border-radius:13px;
            padding:12px;
            background:rgba(0,0,0,.16);
        }

        .client-video-stage b {
            display:block;
            font-size:11px;
            opacity:.68;
            text-transform:uppercase;
            letter-spacing:.08em;
        }

        .client-video-stage strong {
            display:block;
            margin-top:4px;
            font-size:22px;
        }

        .client-video-stage small {
            display:block;
            margin-top:2px;
            opacity:.55;
        }

        .client-video-stage-actions {
            display:grid;
            grid-template-columns:repeat(3,minmax(0,1fr));
            gap:8px;
            margin-top:12px;
        }

        .client-video-stage-actions button {
            border:1px solid rgba(255,255,255,.10);
            border-radius:10px;
            padding:10px 8px;
            background:rgba(255,255,255,.055);
            color:inherit;
            cursor:pointer;
            font:inherit;
            font-size:12px;
            transition:.2s ease;
        }

        .client-video-stage-actions button:hover {
            transform:translateY(-1px);
            background:rgba(255,255,255,.09);
        }

        .client-video-workflow-today {
            margin-top:13px;
            padding-top:13px;
            border-top:1px solid rgba(255,255,255,.08);
            font-size:12px;
            line-height:1.7;
            opacity:.78;
        }

        .client-video-workflow-recent {
            margin-top:10px;
            display:grid;
            gap:6px;
            max-height:150px;
            overflow:auto;
        }

        .client-video-workflow-entry {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
            padding:8px 10px;
            border-radius:9px;
            background:rgba(255,255,255,.035);
            font-size:11px;
        }

        .client-video-workflow-entry span:last-child {
            opacity:.62;
            white-space:nowrap;
        }

        .client-workflow-empty {
            opacity:.5;
            font-size:11px;
            padding:5px 0;
        }

        @media (max-width: 600px) {

            .client-video-workflow-stages,
            .client-video-stage-actions {
                grid-template-columns:1fr;
            }

        }

    `;


    document.head.appendChild(
        style
    );

}


/* =========================================================
   WORKFLOW PANEL HOST
========================================================= */

function getWorkflowPanelHost() {

    const actions =
        document.querySelector(
            ".drawer-actions"
        );


    if (actions) {

        return actions;

    }


    const notes =
        document.getElementById(
            "detailNotes"
        );


    if (
        notes &&
        notes.parentElement
    ) {

        return notes.parentElement;

    }


    return null;

}


/* =========================================================
   RENDER WORKFLOW
========================================================= */

function renderClientWorkflow(
    client
) {

    ensureClientWorkflowStyles();


    const host =
        getWorkflowPanelHost();


    if (!host) {

        return;

    }


    let panel =
        document.getElementById(
            "clientVideoWorkflow"
        );


    if (!panel) {

        panel =
            document.createElement(
                "section"
            );


        panel.id =
            "clientVideoWorkflow";


        panel.className =
            "client-video-workflow";


        host.parentNode.insertBefore(
            panel,
            host
        );

    }


    if (!client) {

        panel.innerHTML =
            "";

        return;

    }


    const summary =
        getWorkflowSummary(
            client
        );


    const recent =
        summary.records
            .slice()
            .sort(
                (
                    a,
                    b
                ) => {

                    return String(
                        b.createdAt ||
                        ""
                    )
                    .localeCompare(
                        String(
                            a.createdAt ||
                            ""
                        )
                    );

                }
            )
            .slice(
                0,
                8
            );


    panel.innerHTML = `

        <div
            class="client-video-workflow-title"
        >

            <div>

                <strong>

                    <i
                        class="fa-solid fa-clapperboard"
                    ></i>

                    VIDEO WORKFLOW

                </strong>

                <span>
                    SHOOT → EDIT → UPLOAD
                </span>

            </div>

        </div>


        <div
            class="client-video-workflow-stages"
        >

            <div
                class="client-video-stage"
            >

                <b>
                    Shoot
                </b>

                <strong>
                    ${summary.shoot}
                </strong>

                <small>
                    Today: ${summary.todayShoot}
                </small>

            </div>


            <div
                class="client-video-stage"
            >

                <b>
                    Edit
                </b>

                <strong>
                    ${summary.edit}
                </strong>

                <small>
                    Today: ${summary.todayEdit}
                </small>

            </div>


            <div
                class="client-video-stage"
            >

                <b>
                    Upload
                </b>

                <strong>
                    ${summary.upload}
                </strong>

                <small>
                    Today: ${summary.todayUpload}
                </small>

            </div>

        </div>


        <div
            class="client-video-stage-actions"
        >

            <button
                type="button"
                onclick="recordClientVideoStage('Shoot')"
            >

                <i
                    class="fa-solid fa-camera"
                ></i>

                Add Shoot

            </button>


            <button
                type="button"
                onclick="recordClientVideoStage('Edit')"
            >

                <i
                    class="fa-solid fa-scissors"
                ></i>

                Add Edit

            </button>


            <button
                type="button"
                onclick="recordClientVideoStage('Upload')"
            >

                <i
                    class="fa-solid fa-cloud-arrow-up"
                ></i>

                Add Upload

            </button>

        </div>


        <div
            class="client-video-workflow-today"
        >

            <strong>
                Today:
            </strong>

            Shoot ${summary.todayShoot}
            ·
            Edit ${summary.todayEdit}
            ·
            Upload ${summary.todayUpload}

        </div>


        <div
            class="client-video-workflow-recent"
        >

            ${
                recent.length

                ?

                recent.map(
                    record => {

                        return `

                            <div
                                class="client-video-workflow-entry"
                            >

                                <span>

                                    ${escapeHtml(
                                        record.stage
                                    )}

                                    ×

                                    ${toNumber(
                                        record.count
                                    )}

                                    ${
                                        record.note
                                            ? ` · ${escapeHtml(record.note)}`
                                            : ""
                                    }

                                </span>


                                <span>

                                    ${escapeHtml(
                                        record.date ||
                                        "--"
                                    )}

                                </span>

                            </div>

                        `;

                    }
                ).join("")

                :

                `

                    <div
                        class="client-workflow-empty"
                    >

                        No video workflow activity
                        recorded yet.

                    </div>

                `

            }

        </div>

    `;

}


/* =========================================================
   RECORD SHOOT / EDIT / UPLOAD
========================================================= */

function recordClientVideoStage(
    stage
) {

    if (
        selectedClientIndex <
        0 ||
        !clients[
            selectedClientIndex
        ]
    ) {

        alert(
            "Please open a client first."
        );

        return;

    }


    const validStages = [

        "Shoot",
        "Edit",
        "Upload"

    ];


    if (
        !validStages.includes(
            stage
        )
    ) {

        return;

    }


    const client =
        clients[
            selectedClientIndex
        ];


    const countInput =
        prompt(
            `How many videos were ${stage.toLowerCase()}ed?`,
            "1"
        );


    if (
        countInput ===
        null
    ) {

        return;

    }


    const count =
        Math.floor(
            Number(
                countInput
            )
        );


    if (
        !Number.isFinite(
            count
        ) ||
        count <= 0
    ) {

        alert(
            "Please enter a valid video count."
        );

        return;

    }


    const date =
        prompt(
            "Date (YYYY-MM-DD)",
            getTodayKey()
        );


    if (
        date ===
        null
    ) {

        return;

    }


    const cleanDate =
        String(
            date
        ).trim();


    if (
        !/^\\d{4}-\\d{2}-\\d{2}$/.test(
            cleanDate
        )
    ) {

        alert(
            "Please enter date in YYYY-MM-DD format."
        );

        return;

    }


    const note =
        prompt(
            "Optional note",
            ""
        );


    if (
        note ===
        null
    ) {

        return;

    }


    const records =
        readClientVideoWorkflow();


    records.push({

        id:
            `cvw_${Date.now()}_${Math.random()
                .toString(36)
                .slice(2, 8)}`,

        clientCode:
            client.code ||
            "",

        clientName:
            client.name ||
            "",

        stage,

        count,

        date:
            cleanDate,

        note:
            String(
                note
            ).trim(),

        createdAt:
            new Date().toISOString()

    });


    saveClientVideoWorkflow(
        records
    );


    renderClientWorkflow(
        client
    );


    loadClients(
        document.getElementById(
            "searchClient"
        )?.value ||
        ""
    );


    alert(
        `${stage} activity added successfully.`
    );

}


/* =========================================================
   HELPER TO REFRESH WORKFLOW
========================================================= */

function renderAllClientWorkflow() {

    if (
        selectedClientIndex >=
        0 &&
        clients[
            selectedClientIndex
        ]
    ) {

        renderClientWorkflow(
            clients[
                selectedClientIndex
            ]
        );

    }

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
            value ??
            "";

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
            value ??
            "";

    }

}


/* =========================================================
   GET INPUT VALUE
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
        value ??
        ""
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


window.recordClientVideoStage =
    recordClientVideoStage;


window.renderClientWorkflow =
    renderClientWorkflow;