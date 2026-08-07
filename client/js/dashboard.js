/* =====================================
   THE D CUTS DASHBOARD V2
===================================== */



function loadDashboard(){



// Employees

let employees =
JSON.parse(
localStorage.getItem("employees")
) || [];




// Projects / Clients

let clients =
JSON.parse(
localStorage.getItem("clients")
) || [];




// Timesheets

let timesheets =
JSON.parse(
localStorage.getItem("timesheets")
) || [];





/*
TOTAL COUNTS
*/


let totalProjects =
new Set(
timesheets.flatMap(item=>

item.projects.map(
p=>p.project
)

)

).size;





let totalVideos = 0;

let completedVideos = 0;

let balanceVideos = 0;





timesheets.forEach(item=>{


item.projects.forEach(project=>{


totalVideos += Number(project.totalVideos) || 0;


completedVideos += Number(project.completedVideos) || 0;


balanceVideos += Number(project.balanceVideos) || 0;



});


});







// Dashboard Cards


let employeeCount =
document.getElementById("employeeCount");


let projectCount =
document.getElementById("projectCount");


let reportCount =
document.getElementById("reportCount");





if(employeeCount){

employeeCount.innerHTML =
employees.length || 
new Set(
timesheets.map(
item=>item.employee
)
).size;


}



if(projectCount){

projectCount.innerHTML =
totalProjects;


}



if(reportCount){

reportCount.innerHTML =
timesheets.length;


}








/*
RECENT REPORTS
*/


let recent =
document.getElementById("recentReports");



if(!recent)return;



recent.innerHTML="";




if(timesheets.length===0){


recent.innerHTML=`

<p>
No Reports Available
</p>

`;


return;


}






timesheets
.slice()
.reverse()
.slice(0,5)
.forEach(item=>{


item.projects.forEach(project=>{


recent.innerHTML +=`



<div class="recent-card">


<h3>

${project.project}

</h3>



<p>

👤 ${item.employee}

</p>



<p>

🎬 Total:
${project.totalVideos}

</p>


<p>

✅ Completed:
${project.completedVideos}

</p>



<p>

⏳ Balance:
${project.balanceVideos}

</p>



<span>

${item.date}

</span>



</div>


`;








});



});



}




loadDashboard();