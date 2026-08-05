/* ==========================================
   LOAD COMMON NAVBAR
========================================== */

document.addEventListener("DOMContentLoaded", loadNavbar);

async function loadNavbar() {

    const container = document.getElementById("navbar-container");

    if (!container) return;

    try {

        const response = await fetch("../components/navbar.html");

        if (!response.ok) {
            throw new Error("Navbar not found");
        }

        const html = await response.text();

        container.innerHTML = html;

        // Load User
        loadUser();

        // Active Menu
        activeMenu();

        // Hide / Show Admin Menu
        if (typeof adminAccess === "function") {
            adminAccess();
        }

    } catch (err) {

        console.error(err);

        container.innerHTML = `
            <div style="
                padding:20px;
                background:#dc2626;
                color:#fff;
                text-align:center;
                font-size:18px;">
                Navbar Load Failed
            </div>
        `;
    }

}


/* ==========================================
   ACTIVE MENU
========================================== */

function activeMenu() {

    const currentPage =
        window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-link").forEach(link => {

        const href = link.getAttribute("href");

        if (href === currentPage) {

            link.classList.add("active");

        } else {

            link.classList.remove("active");

        }

    });

}


/* ==========================================
   LOAD USER
========================================== */

function loadUser() {

    const user =
        JSON.parse(localStorage.getItem("loggedUser"));

    if (!user) return;

    const username =
        document.getElementById("username");

    const role =
        document.getElementById("role");

    if (username)
        username.textContent = user.name;

    if (role)
        role.textContent = user.role.toUpperCase();

}