/* ==========================================
ADMIN MENU CONTROL
========================================== */

function adminAccess() {

    const user = JSON.parse(localStorage.getItem("loggedUser"));

    if (!user) return;

    document.querySelectorAll(".admin-menu").forEach(menu => {

        if (user.role === "admin") {

            menu.style.display = "block";

        } else {

            menu.style.display = "none";

        }

    });

}