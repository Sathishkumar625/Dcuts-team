/* =====================================================
   THE D CUTS
   AUTH CHECK
===================================================== */


/* =====================================================
   CURRENT PATH
===================================================== */

const currentPath =
    window.location.pathname;


/* =====================================================
   LOGIN PAGE CHECK
===================================================== */

const isLoginPage =
    currentPath.endsWith("/login.html") ||
    currentPath.endsWith("/login") ||
    currentPath === "/login.html";


/* =====================================================
   GET LOGIN DATA
===================================================== */

const token =
    localStorage.getItem("token");

const role =
    localStorage.getItem("role");


/* =====================================================
   LOGIN PAGE
   NEVER REDIRECT FROM LOGIN PAGE
===================================================== */

if (isLoginPage) {

    console.log(
        "Login page detected - Auth check skipped."
    );

}


/* =====================================================
   PROTECTED PAGES
===================================================== */

else {

    /* =================================================
       NO LOGIN
    ================================================= */

    if (!token || !role) {

        console.log(
            "No login session."
        );


        window.location.replace(
            "/client/login.html"
        );

    }


    /* =================================================
       EMPLOYEE
       ONLY TIMESHEET
    ================================================= */

    else if (
        role === "employee"
    ) {

        const isTimesheet =
            currentPath.includes(
                "/pages/timesheet.html"
            );


        if (!isTimesheet) {

            console.log(
                "Employee -> Timesheet"
            );


            window.location.replace(
                "/client/pages/timesheet.html"
            );

        }

    }


    /* =================================================
       ADMIN
       ADMIN CAN OPEN INDEX/DASHBOARD
    ================================================= */

    else if (
        role === "admin"
    ) {

        console.log(
            "Admin authenticated."
        );

    }


    /* =================================================
       UNKNOWN ROLE
    ================================================= */

    else {

        console.log(
            "Unknown role."
        );


        localStorage.clear();


        window.location.replace(
            "/client/login.html"
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

window.logout = function () {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );

    localStorage.removeItem(
        "loggedUser"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "userName"
    );

    localStorage.removeItem(
        "userEmail"
    );


    window.location.replace(
        "/client/login.html"
    );

};