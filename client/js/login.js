const API =
    "http://localhost:5000/api";


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


        if (button) {

            button.addEventListener(
                "click",
                login
            );

        }


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


async function login() {

    const email =
        document.getElementById(
            "email"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value.trim();


    const message =
        document.getElementById(
            "message"
        );


    if (
        !email ||
        !password
    ) {

        message.innerText =
            "Please enter email and password.";

        return;

    }


    message.innerText =
        "Logging in...";


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


        if (
            !response.ok ||
            !data.success
        ) {

            message.innerText =
                data.message ||
                "Login failed.";

            return;

        }


        /* ==========================================
           SAVE LOGIN
        ========================================== */

        localStorage.clear();


        localStorage.setItem(
            "token",
            data.token
        );


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


        localStorage.setItem(
            "role",
            String(
                data.user.role
            ).toLowerCase()
        );


        localStorage.setItem(
            "userName",
            data.user.name
        );


        localStorage.setItem(
            "userEmail",
            data.user.email
        );


        message.innerText =
            "Login successful...";


        const role =
            String(
                data.user.role
            )
            .toLowerCase();


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

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        message.innerText =
            "Cannot connect to server. Make sure server is running.";

    }

}