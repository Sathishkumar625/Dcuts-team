document.addEventListener("DOMContentLoaded", function(){


const navbar = document.getElementById("navbar-container");


if(!navbar)
return;



let user = JSON.parse(localStorage.getItem("loggedUser"));

let role = localStorage.getItem("role");



let adminMenu = `


<nav class="navbar">


<div class="logo">

<div class="logo-icon">

<i class="fa-regular fa-clock"></i>

</div>

<h2>DCUTS.TS</h2>

</div>



<ul class="menu">


<li>

<a href="../index.html">

<i class="fa-solid fa-house"></i>

Home

</a>

</li>



<li>

<a href="dashboard.html">

<i class="fa-solid fa-table-columns"></i>

Dashboard

</a>

</li>


<li>

<a href="timesheet.html">

<i class="fa-regular fa-clock"></i>

Timesheet

</a>

</li>



<li>

<a href="reports.html">

<i class="fa-solid fa-file-lines"></i>

Reports

</a>

</li>



<li>

<a href="calendar.html">

<i class="fa-solid fa-calendar"></i>

Calendar

</a>

</li>



<li>

<a href="employees.html">

<i class="fa-solid fa-users"></i>

Employees

</a>

</li>



<li>

<a href="clients.html">

<i class="fa-solid fa-user-tie"></i>

Clients

</a>

</li>



<li>

<a href="settings.html">

<i class="fa-solid fa-gear"></i>

Settings

</a>

</li>


</ul>



<div class="profile">

<p>

${user ? user.name : "Admin"}

</p>


<span>

<i class="fa-solid fa-shield"></i>

Admin

</span>


</div>


</nav>


`;





let employeeMenu = `


<nav class="navbar">


<div class="logo">

<div class="logo-icon">

<i class="fa-regular fa-clock"></i>

</div>


<h2>DCUTS.TS</h2>


</div>




<ul class="menu">


<li>

<a href="timesheet.html">

<i class="fa-regular fa-clock"></i>

Timesheet

</a>

</li>


<li>

<a href="#" onclick="logout()">

<i class="fa-solid fa-right-from-bracket"></i>

Logout

</a>

</li>


</ul>



<div class="profile">


<p>

${user ? user.name : "Employee"}

</p>


<span>

Employee

</span>


</div>


</nav>



`;





if(role==="admin"){

navbar.innerHTML = adminMenu;


}

else{


navbar.innerHTML = employeeMenu;


}



});





function logout(){


localStorage.removeItem("loggedUser");

localStorage.removeItem("role");


window.location.href="login.html";


}