/* ==========================================
   THE D CUTS
   FIREBASE GOOGLE LOGIN
   RENDER BACKEND
========================================== */

import {
    initializeApp
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
} from
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
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);


/* ==========================================
   GOOGLE PROVIDER
========================================== */

const provider =
    new GoogleAuthProvider();

provider.setCustomParameters({
    prompt: "select_account"
});


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
                (user.email || "")
                    .toLowerCase()
                    .trim();


            if (!email) {

                throw new Error(
                    "Google account email not available."
                );

            }


            /* ==========================================
               RENDER BACKEND
               DO NOT CHANGE
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
                                    user.displayName || "",

                                email:
                                    email

                            })

                    }
                );


            /* ==========================================
               BACKEND RESPONSE
            ========================================== */

            let backendData;

            try {

                backendData =
                    await backendResponse.json();

            }

            catch (jsonError) {

                throw new Error(
                    "Server returned an invalid response."
                );

            }


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
               BACKEND USER
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
               ADMIN PROCESS UNCHANGED
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
               ADMIN / EMPLOYEE PROCESS UNCHANGED
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


            /* ==========================================
               USER-FRIENDLY ERROR
            ========================================== */

            let errorMessage =
                error.message ||
                "Google login failed.";

            if (
                error.code ===
                "auth/unauthorized-domain"
            ) {

                errorMessage =
                    "This Vercel domain is not authorized in Firebase.";

            }

            else if (
                error.code ===
                "auth/popup-blocked"
            ) {

                errorMessage =
                    "Google login popup was blocked by the browser.";

            }

            else if (
                error.code ===
                "auth/popup-closed-by-user"
            ) {

                errorMessage =
                    "Google login window was closed.";

            }

            else if (
                error.code ===
                "auth/operation-not-allowed"
            ) {

                errorMessage =
                    "Google Sign-In is not enabled in Firebase.";

            }


            alert(
                errorMessage
            );

        }

    };