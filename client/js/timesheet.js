/* =====================================
   THE D CUTS TIMESHEET SYSTEM
===================================== */


let timesheets = JSON.parse(
localStorage.getItem("timesheets")
) || [];





// AUTO DATE

window.onload=function(){

let date=document.getElementById("date");

if(date){

date.value=new Date()
.toISOString()
.split("T")[0];

}


loadTimesheets();

};








// ADD TASK FUNCTION

function addTask(){


let container =
document.getElementById("taskContainer");



let row=document.createElement("div");


row.className="task-row";



row.innerHTML=`

<input 
class="taskInput"
type="text"
placeholder="Enter Task">



<input 
class="hourInput"
type="number"
placeholder="Hours">



<button 
type="button"
onclick="removeTask(this)">

❌

</button>

`;



container.appendChild(row);



}







function removeTask(btn){


btn.parentElement.remove();


}









// SAVE TIMESHEET


function saveTimesheet(){



let employee =
document.getElementById("employeeName").value;



let date =
document.getElementById("date").value;



let project =
document.getElementById("project").value;



let comments =
document.getElementById("comments").value;






let tasks=[];




document
.querySelectorAll(".task-row")
.forEach(row=>{



let task =
row.querySelector(".taskInput").value;



let hours =
row.querySelector(".hourInput").value;




if(task.trim()!==""){



tasks.push({

task:task,

hours:hours

});



}



});







if(employee=="" || project=="" || tasks.length==0){


alert(
"Please select Employee, Project and Add Task"
);


return;


}





let newTimesheet = {

    id: Date.now(),

    employee: employee,

    date: date,

    project: project,

    task: tasks.map(t => t.task).join(", "),

    hours: tasks.reduce((total, t) => total + Number(t.hours || 0), 0),

    tasks: tasks,

    comments: comments,

    createdAt: new Date()

};





timesheets.push(newTimesheet);






localStorage.setItem(

"timesheets",

JSON.stringify(timesheets)

);







alert(
"Timesheet Saved Successfully ✅"
);






clearForm();



loadTimesheets();





}









// LOAD DATA



function loadTimesheets(){



let table=
document.getElementById("timesheetTable");



if(!table)
return;




table.innerHTML="";






let role=
localStorage.getItem("role");




let user=
JSON.parse(
localStorage.getItem("loggedUser")
);






let showData=timesheets;






// EMPLOYEE ONLY OWN DATA


if(role!="admin" && user){



showData =
timesheets.filter(item=>

item.employee==user.name

);


}







if(showData.length==0){


table.innerHTML=`

<tr>

<td colspan="5">

No Timesheet Found

</td>

</tr>

`;

return;


}







showData.forEach(item=>{



item.tasks.forEach(task=>{



table.innerHTML +=`

<tr>


<td>

${item.employee}

</td>



<td>

${item.date}

</td>



<td>

${item.project}

</td>



<td>

${task.task}

</td>



<td>

${task.hours}

</td>



</tr>


`;



});


});



}









// CLEAR FORM


function clearForm(){



document.getElementById(
"employeeName"
).value="";



document.getElementById(
"project"
).value="";



document.getElementById(
"comments"
).value="";





document.getElementById(
"taskContainer"
).innerHTML=`

<div class="task-row">


<input

class="taskInput"

placeholder="Enter Task">


<input

class="hourInput"

type="number"

placeholder="Hours">


</div>

`;




document.getElementById("date").value=

new Date()
.toISOString()
.split("T")[0];


}