/* =====================================
   THE D CUTS TIMESHEET
===================================== */



let timesheets =

JSON.parse(

localStorage.getItem("timesheets")

) || [];








/* ===============================
 LOAD CLIENT PROJECTS
================================ */


function loadProjects(){



let clients =

JSON.parse(

localStorage.getItem("clients")

) || [];




let projectSelect =

document.getElementById("project");



if(!projectSelect)

return;





projectSelect.innerHTML = `


<option value="">


Select Project


</option>


`;






clients.forEach(client=>{


projectSelect.innerHTML +=`


<option value="${client.code}">


${client.code} - ${client.name}


</option>


`;



});



}




loadProjects();










/* ===============================
 DATE
================================ */



let dateInput =

document.getElementById("date");



if(dateInput){


dateInput.value =

new Date()

.toISOString()

.split("T")[0];


}









/* ===============================
 SAVE TIMESHEET
================================ */



function saveTimesheet(){



let employee =

document.getElementById("employeeName").value;



let project =

document.getElementById("project").value;



let task =

document.getElementById("task").value;



let hours =

document.getElementById("hours").value;



let comments =

document.getElementById("comments").value;



let date =

document.getElementById("date").value;







if(
employee==="" ||
project==="" ||
task==="" ||
hours===""
){


alert("Please fill required fields");


return;


}






let data={


id:Date.now(),

employee,

date,

project,

task,

hours,

comments


};







timesheets.push(data);




localStorage.setItem(

"timesheets",

JSON.stringify(timesheets)

);





alert(

"Timesheet Saved Successfully ✅"

);





clearForm();



}










/* ===============================
 CLEAR
================================ */



function clearForm(){


document.getElementById("task").value="";


document.getElementById("hours").value="";


document.getElementById("comments").value="";



}