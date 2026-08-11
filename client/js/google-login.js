/* ==========================================
   THE D CUTS
   FIREBASE GOOGLE LOGIN
   RENDER BACKEND
========================================== */


/* ==========================================
   FIREBASE
========================================== */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


/* ==========================================
   FIREBASE CONFIG
========================================== */

const firebaseConfig = {

    apiKey:
        "AIzaSyDP6-N1ttRIaGuouYm6luo5eFnukTGjTL8",

    authDomain:
        "the-dcuts.firebaseapp.com",

    projectId:
        "the-dcuts",

    storageBucket:
        "the-dcuts.firebasestorage.app",

    messagingSenderId:
        "549784640907",

    appId:
        "1:549784640907:web:677d6c6670d16e9001638e",

    measurementId:
        "G-Q91HC5F105"

};


/* ==========================================
   FIREBASE INITIALIZE
========================================== */

const app =
    initializeApp(
        firebaseConfig
    );


const auth =
    getAuth(
        app
    );


const provider =
    new GoogleAuthProvider();


console.log(
    "🔥 GOOGLE LOGIN JS LOADED"
);


/* ==========================================
   GOOGLE LOGIN
========================================== */

window.googleLogin =
    async function () {

        console.log(
            "GOOGLE BUTTON CLICKED"
        );


        const message =
            document.getElementById(
                "message"
            );


        try {

            /* ==========================================
               MESSAGE
            ========================================== */

            if (message) {

                message.innerText =
                    "Opening Google Login...";

            }


            /* ==========================================
               FIREBASE GOOGLE LOGIN
            ========================================== */

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            const user =
                result.user;


            console.log(
                "GOOGLE USER:",
                user
            );


            /* ==========================================
               EMAIL
            ========================================== */

            const email =
                user.email
                    .toLowerCase()
                    .trim();


            /* ==========================================
               BACKEND
            ========================================== */

            const backendURL =
                "https://dcuts-team.onrender.com";


            /* ==========================================
               SEND GOOGLE USER TO BACKEND
            ========================================== */

            const backendResponse =
                await fetch(
                    `${backendURL}/api/auth/google`,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                name:
                                    user.displayName,

                                email:
                                    email

                            })

                    }
                );


            /* ==========================================
               BACKEND RESPONSE
            ========================================== */

            const backendData =
                await backendResponse.json();


            console.log(
                "BACKEND RESPONSE:",
                backendData
            );


            /* ==========================================
               BACKEND LOGIN ERROR
            ========================================== */

            if (
                !backendResponse.ok ||
                !backendData.success
            ) {

                throw new Error(
                    backendData.message ||
                    "Backend Google login failed."
                );

            }


            /* ==========================================
               USER
            ========================================== */

            const backendUser =
                backendData.user;


            if (!backendUser) {

                throw new Error(
                    "User information not received from server."
                );

            }


            /* ==========================================
               ROLE
            ========================================== */

            const role =
                String(
                    backendUser.role ||
                    "employee"
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
                backendData.token
            );


            /* ==========================================
               SAVE BACKEND USER
            ========================================== */

            localStorage.setItem(
                "user",
                JSON.stringify(
                    backendUser
                )
            );


            localStorage.setItem(
                "loggedUser",
                JSON.stringify(
                    backendUser
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
               SAVE NAME
            ========================================== */

            localStorage.setItem(
                "userName",
                backendUser.name ||
                user.displayName ||
                ""
            );


            /* ==========================================
               SAVE EMAIL
            ========================================== */

            localStorage.setItem(
                "userEmail",
                backendUser.email ||
                email
            );


            console.log(
                "GOOGLE LOGIN SUCCESS:",
                backendUser
            );


            /* ==========================================
               SUCCESS MESSAGE
            ========================================== */

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
           GOOGLE LOGIN ERROR
        ========================================== */

        catch (error) {

            console.error(
                "GOOGLE LOGIN ERROR:",
                error
            );


            if (message) {

                message.innerText =
                    "Google login failed.";

            }


            alert(
                error.message
            );

        }

    };