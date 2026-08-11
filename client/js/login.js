/* ==========================================
   THE D CUTS
   LOGIN
   RENDER BACKEND
========================================== */


/* ==========================================
   BACKEND API
========================================== */

const API =
    "https://dcuts-team.onrender.com/api";


/* ==========================================
   PAGE LOAD
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            document.getElementById(
                "loginButton"
            );


        const password =
            document.getElementById(
                "password"
            );


        /* LOGIN BUTTON */

        if (button) {

            button.addEventListener(
                "click",
                login
            );

        }


        /* ENTER KEY */

        if (password) {

            password.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        login();

                    }

                }
            );

        }

    }
);


/* ==========================================
   LOGIN FUNCTION
========================================== */

async function login() {

    const emailInput =
        document.getElementById(
            "email"
        );


    const passwordInput =
        document.getElementById(
            "password"
        );


    const message =
        document.getElementById(
            "message"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {

        console.error(
            "Login input fields not found"
        );

        return;

    }


    const email =
        emailInput.value
        .trim()
        .toLowerCase();


    const password =
        passwordInput.value
        .trim();


    /* ==========================================
       VALIDATION
    ========================================== */

    if (
        !email ||
        !password
    ) {

        if (message) {

            message.innerText =
                "Please enter email and password.";

        }

        return;

    }


    if (message) {

        message.innerText =
            "Logging in...";

    }


    /* ==========================================
       BACKEND LOGIN
    ========================================== */

    try {

        const response =
            await fetch(
                `${API}/auth/login`,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                }
            );


        const data =
            await response.json();


        console.log(
            "LOGIN RESPONSE:",
            data
        );


        /* ==========================================
           LOGIN ERROR
        ========================================== */

        if (
            !response.ok ||
            !data.success
        ) {

            if (message) {

                message.innerText =
                    data.message ||
                    "Login failed.";

            }

            return;

        }


        /* ==========================================
           CHECK USER
        ========================================== */

        if (!data.user) {

            if (message) {

                message.innerText =
                    "User information missing.";

            }

            return;

        }


        const role =
            String(
                data.user.role || "employee"
            )
            .toLowerCase();


        /* ==========================================
           CLEAR OLD LOGIN
        ========================================== */

        localStorage.clear();


        /* ==========================================
           SAVE JWT TOKEN
        ========================================== */

        localStorage.setItem(
            "token",
            data.token
        );


        /* ==========================================
           SAVE USER
        ========================================== */

        localStorage.setItem(
            "user",
            JSON.stringify(
                data.user
            )
        );


        localStorage.setItem(
            "loggedUser",
            JSON.stringify(
                data.user
            )
        );


        /* ==========================================
           SAVE ROLE
        ========================================== */

        localStorage.setItem(
            "role",
            role
        );


        /* ==========================================
           SAVE USER DETAILS
        ========================================== */

        localStorage.setItem(
            "userName",
            data.user.name || ""
        );


        localStorage.setItem(
            "userEmail",
            data.user.email || email
        );


        console.log(
            "LOGIN SUCCESS:",
            data.user
        );


        if (message) {

            message.innerText =
                "Login successful...";

        }


        /* ==========================================
           REDIRECT
        ========================================== */

        setTimeout(
            function () {

                if (
                    role === "admin"
                ) {

                    window.location.href =
                        "./index.html";

                }

                else {

                    window.location.href =
                        "./pages/timesheet.html";

                }

            },
            500
        );

    }


    /* ==========================================
       SERVER / NETWORK ERROR
    ========================================== */

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        if (message) {

            message.innerText =
                "Cannot connect to server.";

        }


        alert(
            "Cannot connect to THE D CUTS server.\n\nPlease try again."
        );

    }

}