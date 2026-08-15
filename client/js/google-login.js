/* ==========================================
   THE D CUTS
   FIREBASE GOOGLE LOGIN
   RENDER BACKEND

   FIX:
   - auth/cancelled-popup-request
   - Prevent multiple popup requests
   - Prevent double click
   - Keep Admin / Employee role process unchanged
========================================== */


/* ==========================================
   FIREBASE APP
========================================== */

import {
    initializeApp
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


/* ==========================================
   FIREBASE AUTH
========================================== */

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
   INITIALIZE FIREBASE
========================================== */

const app =
    initializeApp(
        firebaseConfig
    );


/* ==========================================
   FIREBASE AUTH
========================================== */

const auth =
    getAuth(
        app
    );


/* ==========================================
   GOOGLE PROVIDER
========================================== */

const provider =
    new GoogleAuthProvider();


/*
   Force Google account selection.
   This also helps avoid confusion when
   multiple Google accounts are logged in.
*/

provider.setCustomParameters({

    prompt: "select_account"

});


/* ==========================================
   LOGIN LOCK
========================================== */

/*
   VERY IMPORTANT

   Prevents two signInWithPopup()
   requests from running at the same time.

   This fixes:

   auth/cancelled-popup-request
*/

let googleLoginInProgress = false;


/* ==========================================
   LOG
========================================== */

console.log(
    "🔥 GOOGLE LOGIN JS LOADED"
);


/* ==========================================
   FIND LOGIN BUTTON
========================================== */

function getGoogleLoginButton() {

    return (

        document.getElementById(
            "googleLoginBtn"
        )

        ||

        document.getElementById(
            "googleLogin"
        )

        ||

        document.querySelector(
            ".google-login-btn"
        )

        ||

        document.querySelector(
            'button[onclick*="googleLogin"]'
        )

        ||

        null

    );

}


/* ==========================================
   BUTTON STATE
========================================== */

function setLoginButtonState(
    disabled
) {

    const button =
        getGoogleLoginButton();


    if (!button) {
        return;
    }


    button.disabled =
        disabled;


    if (disabled) {

        button.dataset.originalText =
            button.innerHTML;


        button.innerHTML =
            "Opening Google...";


        button.style.pointerEvents =
            "none";

        button.style.opacity =
            "0.7";

    }

    else {

        if (
            button.dataset.originalText
        ) {

            button.innerHTML =
                button.dataset.originalText;

        }


        button.style.pointerEvents =
            "";


        button.style.opacity =
            "";


        button.disabled =
            false;

    }

}


/* ==========================================
   MESSAGE
========================================== */

function setMessage(
    text
) {

    const message =
        document.getElementById(
            "message"
        );


    if (message) {

        message.innerText =
            text;

    }

}


/* ==========================================
   GOOGLE LOGIN
========================================== */

window.googleLogin =
    async function (
        event
    ) {

        /*
           Stop form submit if this button
           is inside a form.
        */

        if (event) {

            event.preventDefault();

            event.stopPropagation();

        }


        /* ======================================
           PREVENT DOUBLE CLICK
        ====================================== */

        if (
            googleLoginInProgress
        ) {

            console.log(
                "Google login already running..."
            );

            return;

        }


        /* ======================================
           LOCK LOGIN
        ====================================== */

        googleLoginInProgress =
            true;


        setLoginButtonState(
            true
        );


        console.log(
            "GOOGLE BUTTON CLICKED"
        );


        try {

            /* ==================================
               MESSAGE
            ================================== */

            setMessage(
                "Opening Google Login..."
            );


            /* ==================================
               FIREBASE GOOGLE LOGIN
            ================================== */

            const result =
                await signInWithPopup(
                    auth,
                    provider
                );


            /* ==================================
               GOOGLE USER
            ================================== */

            const user =
                result.user;


            console.log(
                "GOOGLE USER:",
                user
            );


            /* ==================================
               EMAIL
            ================================== */

            if (
                !user ||
                !user.email
            ) {

                throw new Error(
                    "Google account email not available."
                );

            }


            const email =
                user.email
                    .toLowerCase()
                    .trim();


            /* ==================================
               BACKEND URL
            ================================== */

            const backendURL =
                "https://dcuts-team.onrender.com";


            /* ==================================
               SEND GOOGLE USER TO BACKEND
            ================================== */

            setMessage(
                "Checking your account..."
            );


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
                                    user.displayName ||
                                    "",

                                email:
                                    email

                            })

                    }

                );


            /* ==================================
               BACKEND JSON
            ================================== */

            let backendData;


            try {

                backendData =
                    await backendResponse.json();

            }

            catch (
                jsonError
            ) {

                console.error(
                    "BACKEND JSON ERROR:",
                    jsonError
                );


                throw new Error(
                    "Server did not return a valid response."
                );

            }


            console.log(
                "BACKEND RESPONSE:",
                backendData
            );


            /* ==================================
               BACKEND ERROR
            ================================== */

            if (

                !backendResponse.ok

                ||

                !backendData.success

            ) {

                throw new Error(

                    backendData.message

                    ||

                    "Backend Google login failed."

                );

            }


            /* ==================================
               BACKEND USER
            ================================== */

            const backendUser =
                backendData.user;


            if (!backendUser) {

                throw new Error(
                    "User information not received from server."
                );

            }


            /* ==================================
               ROLE

               ADMIN PROCESS IS NOT CHANGED
            ================================== */

            const role =
                String(

                    backendUser.role

                    ||

                    "employee"

                )
                .toLowerCase();


            /* ==================================
               CLEAR OLD LOGIN
            ================================== */

            localStorage.clear();


            /* ==================================
               SAVE JWT
            ================================== */

            localStorage.setItem(

                "token",

                backendData.token

            );


            /* ==================================
               SAVE USER
            ================================== */

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


            /* ==================================
               SAVE ROLE
            ================================== */

            localStorage.setItem(

                "role",

                role

            );


            /* ==================================
               SAVE NAME
            ================================== */

            localStorage.setItem(

                "userName",

                backendUser.name

                ||

                user.displayName

                ||

                ""

            );


            /* ==================================
               SAVE EMAIL
            ================================== */

            localStorage.setItem(

                "userEmail",

                backendUser.email

                ||

                email

            );


            /* ==================================
               LOGIN SUCCESS
            ================================== */

            console.log(
                "✅ GOOGLE LOGIN SUCCESS:",
                backendUser
            );


            setMessage(
                "Login successful..."
            );


            /* ==================================
               REDIRECT
               
               ADMIN:
               ./index.html

               EMPLOYEE:
               ./pages/timesheet.html

               DO NOT CHANGE
            ================================== */

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


        /* ======================================
           GOOGLE LOGIN ERROR
        ====================================== */

        catch (
            error
        ) {

            console.error(
                "GOOGLE LOGIN ERROR:",
                error
            );


            /* ==================================
               CANCELLED POPUP REQUEST
            ================================== */

            if (

                error.code ===
                "auth/cancelled-popup-request"

            ) {

                console.warn(
                    "Google popup request was cancelled because another popup request was started."
                );


                setMessage(
                    "Google login is already opening. Please wait..."
                );


                return;

            }


            /* ==================================
               POPUP CLOSED
            ================================== */

            if (

                error.code ===
                "auth/popup-closed-by-user"

            ) {

                console.log(
                    "Google login popup closed by user."
                );


                setMessage(
                    "Google login cancelled."
                );


                return;

            }


            /* ==================================
               POPUP BLOCKED
            ================================== */

            if (

                error.code ===
                "auth/popup-blocked"

            ) {

                setMessage(
                    "Google popup was blocked. Please allow popups for this website."
                );


                alert(
                    "Google Login popup was blocked by your browser. Please allow popups and try again."
                );


                return;

            }


            /* ==================================
               UNAUTHORIZED DOMAIN
            ================================== */

            if (

                error.code ===
                "auth/unauthorized-domain"

            ) {

                setMessage(
                    "This website is not authorized in Firebase."
                );


                alert(
                    "Firebase Unauthorized Domain. Add this website domain in Firebase Authentication → Settings → Authorized domains."
                );


                return;

            }


            /* ==================================
               GENERAL ERROR
            ================================== */

            setMessage(
                "Google login failed."
            );


            alert(

                error.message

                ||

                "Google login failed."

            );

        }


        /* ======================================
           UNLOCK LOGIN
           
           IMPORTANT:
           Don't unlock during successful
           redirect too early.
        ====================================== */

        finally {

            /*
               If page is still here,
               unlock the button.
            */

            setTimeout(

                function () {

                    googleLoginInProgress =
                        false;


                    setLoginButtonState(
                        false
                    );

                },

                800

            );

        }

    };


/* ==========================================
   EXTRA PROTECTION
========================================== */

/*
   If the Google button is a normal HTML
   button inside a form, this prevents
   accidental form submission.
*/

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const button =
            getGoogleLoginButton();


        if (!button) {
            return;
        }


        /*
           Make sure button doesn't submit
           the login form accidentally.
        */

        if (
            button.tagName ===
            "BUTTON"
        ) {

            button.type =
                "button";

        }


        /*
           Prevent rapid double clicks.
        */

        button.addEventListener(

            "click",

            function (event) {

                if (
                    googleLoginInProgress
                ) {

                    event.preventDefault();

                    event.stopPropagation();

                    return false;

                }

            },

            true

        );

    }

);



