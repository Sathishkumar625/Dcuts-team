/* =====================================
   APP.JS
   THE D CUTS Timesheet Management System
===================================== */


/* ==============================
   LOADING ANIMATION
============================== */

window.addEventListener("load", () => {

    document.body.style.opacity = "0";

    setTimeout(() => {

        document.body.style.transition = "opacity .6s";

        document.body.style.opacity = "1";

    }, 100);

});


/* ==============================
   ACTIVE MENU
============================== */

const currentPage = window.location.pathname.split("/").pop();

const menuLinks = document.querySelectorAll(".menu a");

menuLinks.forEach(link => {

    const file = link.getAttribute("href").split("/").pop();

    if (file === currentPage) {

        link.parentElement.classList.add("active");

    }

});


/* ==============================
   CARD HOVER EFFECT
============================== */

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("mouseenter", () => {

        card.style.transform = "translateY(-8px) scale(1.02)";

    });

    card.addEventListener("mouseleave", () => {

        card.style.transform = "translateY(0) scale(1)";

    });

});


/* ==============================
   RIPPLE EFFECT
============================== */

cards.forEach(card => {

    card.addEventListener("click", function(e){

        const ripple = document.createElement("span");

        ripple.classList.add("ripple");

        const x = e.clientX - this.offsetLeft;
        const y = e.clientY - this.offsetTop;

        ripple.style.left = x + "px";
        ripple.style.top = y + "px";

        this.appendChild(ripple);

        setTimeout(() => {

            ripple.remove();

        },600);

    });

});


/* ==============================
   NOTIFICATION COUNT
============================== */

let notificationCount = localStorage.getItem("notificationCount");

if(notificationCount === null){

    notificationCount = 3;

}

const notificationMenu = document.querySelector(".fa-bell");

if(notificationMenu){

    notificationMenu.title = notificationCount + " Notifications";

}


/* ==============================
   LOGOUT
============================== */

function logout(){

    if(confirm("Are you sure you want to logout?")){

        localStorage.clear();

        window.location.href="../login.html";

    }

}


/* ==============================
   PAGE TITLE
============================== */

document.title = "THE D CUTS | Timesheet Management";


/* ==============================
   SMOOTH SCROLL
============================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

    anchor.addEventListener("click",function(e){

        e.preventDefault();

        document.querySelector(this.getAttribute("href"))
        ?.scrollIntoView({

            behavior:"smooth"

        });

    });

});


/* ==============================
   CONSOLE MESSAGE
============================== */

console.log("%cTHE D CUTS", "color:#3b82f6;font-size:24px;font-weight:bold;");
console.log("%cTimesheet Management System", "color:white;font-size:14px;");