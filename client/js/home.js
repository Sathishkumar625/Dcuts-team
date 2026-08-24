/* ==============================
   LIVE DATE & TIME
============================== */

function updateDateTime() {

    const now = new Date();

    const dateOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    const date = document.getElementById("date");
    const time = document.getElementById("time");

    if (date) {
        date.innerHTML = now.toLocaleDateString("en-IN", dateOptions);
    }

    if (time) {
        time.innerHTML = now.toLocaleTimeString("en-IN", timeOptions);
    }

}

updateDateTime();

setInterval(updateDateTime,1000);


/* ==============================
   USERNAME
============================== */

const userName = localStorage.getItem("userName");

if(userName){

    document.getElementById("username").innerHTML = userName;

}


/* ==============================
   GREETING
============================== */

const hour = new Date().getHours();

let greeting = "Welcome Back 👋";

if(hour < 12){

    greeting = "Good Morning ☀️";

}
else if(hour < 17){

    greeting = "Good Afternoon 🌤";

}
else{

    greeting = "Good Evening 🌙";

}

const heroTitle = document.querySelector(".hero h1");

if(heroTitle){

    heroTitle.innerHTML = greeting;

}


/* ==============================
   QUICK ACCESS CARD CLICK
============================== */

const cards = document.querySelectorAll(".card");

cards.forEach(card => {

    card.addEventListener("click",function(){

        const title = this.querySelector("h3").innerText;

        switch(title){

            case "Dashboard":
                window.location.href="pages/dashboard.html";
                break;

            case "Timesheet":
                window.location.href="pages/timesheet.html";
                break;

            case "Reports":
                window.location.href="pages/reports.html";
                break;


            case "Calendar":
                window.location.href="pages/calendar.html";
                break;

            case "Employees":
                window.location.href="pages/employees.html";
                break;

            case "Settings":
                window.location.href="pages/settings.html";
                break;

        }

    });

});


/* ==============================
   CARD ANIMATION
============================== */

window.addEventListener("load",()=>{

    cards.forEach((card,index)=>{

        card.style.opacity="0";
        card.style.transform="translateY(40px)";

        setTimeout(()=>{

            card.style.transition=".5s";
            card.style.opacity="1";
            card.style.transform="translateY(0)";

        },index*100);

    });

});


/* ==============================
   LOGOUT (Future Use)
============================== */

function logout(){

    localStorage.removeItem("userName");

    window.location.href="login.html";

}
