/* ===========================================
   THE D CUTS TIMESHEET V2
   COMPLETE SYSTEM
=========================================== */


let timesheets =
JSON.parse(localStorage.getItem("timesheets")) || [];


let editId = null;



/* ==========================
AUTO LOAD
========================== */

window.onload = () => {


    const date =
    document.getElementById("date");


    if(date){

        date.value =
        new Date()
        .toISOString()
        .split("T")[0];

    }


    addProjectCard();


    document.getElementById("updateBtn").style.display="none";


    loadTimesheets();


};





/* ==========================
ADD PROJECT CARD
========================== */


function addProjectCard(data={}){


const container =
document.getElementById("projectContainer");


const card =
document.createElement("div");


card.className="project-card";



card.innerHTML=`


<div class="project-title">


<h3>Project</h3>


<button
type="button"
class="delete-project"
onclick="removeProject(this)">

Remove

</button>


</div>



<div class="project-grid">



<div>

<label>Project</label>


<select class="project">


<option value="">Select</option>

<option value="DRT">DRT</option>

<option value="KC">KC</option>

<option value="MS">MS</option>

<option value="SRG">SRG</option>

<option value="SST">SST</option>

<option value="VISWA SILK">VISWA SILK</option>

<option value="OTHERS">OTHERS</option>


</select>


</div>




<div>

<label>Total Videos</label>


<input
class="totalVideos"
type="number"
value="${data.totalVideos || ""}"
oninput="calculateBalance(this)">

</div>





<div>

<label>Completed Videos</label>


<input
class="completedVideos"
type="number"
value="${data.completedVideos || ""}"
oninput="calculateBalance(this)">

</div>





<div>

<label>Balance Videos</label>


<input
class="balanceVideos"
readonly
type="number"
value="${data.balanceVideos || 0}">


</div>





<div class="full-width">


<label>Comments</label>


<textarea
class="comments">

${data.comments || ""}

</textarea>


</div>



</div>


`;



container.appendChild(card);



if(data.project){

card.querySelector(".project").value =
data.project;

}


if(data.totalVideos){

calculateBalance(
card.querySelector(".totalVideos")
);

}


}







/* ==========================
REMOVE PROJECT
========================== */


function removeProject(btn){


let cards =
document.querySelectorAll(".project-card");


if(cards.length===1){


alert("Minimum one project required");


return;


}


btn.closest(".project-card").remove();


}






/* ==========================
BALANCE CALCULATION
========================== */


function calculateBalance(input){


const card =
input.closest(".project-card");


let total =
Number(
card.querySelector(".totalVideos").value
) || 0;



let completed =
Number(
card.querySelector(".completedVideos").value
) || 0;



let balance =
total-completed;



if(balance<0){

balance=0;

}



card.querySelector(".balanceVideos").value =
balance;


}









/* ==========================
SAVE TIMESHEET
========================== */


function saveTimesheet(){



let employee =
document.getElementById("employeeName").value;



let date =
document.getElementById("date").value;



if(employee===""){


alert("Select Employee");


return;


}



let projects=[];



document
.querySelectorAll(".project-card")
.forEach(card=>{


let project =
card.querySelector(".project").value;


if(project!==""){



projects.push({


project,


totalVideos:
Number(card.querySelector(".totalVideos").value)||0,


completedVideos:
Number(card.querySelector(".completedVideos").value)||0,


balanceVideos:
Number(card.querySelector(".balanceVideos").value)||0,


comments:
card.querySelector(".comments").value



});


}



});





if(projects.length===0){


alert("Add Project");


return;


}




let data={


id:Date.now(),


employee,


date,


projects,


createdAt:new Date()


};




timesheets.push(data);



localStorage.setItem(
"timesheets",
JSON.stringify(timesheets)
);



alert("Timesheet Saved Successfully");


clearForm();


loadTimesheets();


}









/* ==========================
LOAD TIMESHEET
========================== */


function loadTimesheets(){



const table =
document.getElementById("timesheetTable");


if(!table)return;



table.innerHTML="";



let role =
localStorage.getItem("role");



let user =
JSON.parse(
localStorage.getItem("loggedUser")
);



let data =
timesheets;



if(role!=="admin" && user){


data =
timesheets.filter(item=>

item.employee===user.name

);


}





if(data.length===0){


table.innerHTML=`

<tr>

<td colspan="7">

No Records Found

</td>

</tr>

`;


return;


}





data.forEach(item=>{



item.projects.forEach(project=>{



table.innerHTML += `


<tr>


<td>${item.employee}</td>


<td>${item.date}</td>


<td>${project.project}</td>


<td>${project.totalVideos}</td>


<td>${project.completedVideos}</td>


<td>${project.balanceVideos}</td>



<td>


<button onclick="editTimesheet(${item.id})">

✏️

</button>



<button onclick="deleteTimesheet(${item.id})">

🗑️

</button>


</td>



</tr>


`;



});


});



}









/* ==========================
EDIT
========================== */


function editTimesheet(id){



let data =
timesheets.find(item=>item.id===id);



if(!data)return;



editId=id;



document.getElementById("employeeName").value =
data.employee;



document.getElementById("date").value =
data.date;




let container =
document.getElementById("projectContainer");


container.innerHTML="";



data.projects.forEach(project=>{


addProjectCard(project);


});



document.querySelector(".save-btn").style.display="none";


document.getElementById("updateBtn").style.display="inline-block";


window.scrollTo({

top:0,

behavior:"smooth"

});


}









/* ==========================
UPDATE
========================== */


function updateTimesheet(){


let index =
timesheets.findIndex(item=>item.id===editId);



if(index===-1)return;



let projects=[];



document.querySelectorAll(".project-card")
.forEach(card=>{


projects.push({


project:
card.querySelector(".project").value,


totalVideos:
Number(card.querySelector(".totalVideos").value)||0,


completedVideos:
Number(card.querySelector(".completedVideos").value)||0,


balanceVideos:
Number(card.querySelector(".balanceVideos").value)||0,


comments:
card.querySelector(".comments").value



});


});





timesheets[index]={


...timesheets[index],


employee:
document.getElementById("employeeName").value,


date:
document.getElementById("date").value,


projects,


updatedAt:new Date()


};





localStorage.setItem(

"timesheets",

JSON.stringify(timesheets)

);





alert("Updated Successfully");



editId=null;



document.querySelector(".save-btn").style.display="inline-block";


document.getElementById("updateBtn").style.display="none";



clearForm();


loadTimesheets();


}









/* ==========================
DELETE
========================== */


function deleteTimesheet(id){



if(!confirm("Delete Timesheet?"))return;



timesheets =
timesheets.filter(item=>item.id!==id);



localStorage.setItem(

"timesheets",

JSON.stringify(timesheets)

);



loadTimesheets();


}









/* ==========================
CLEAR
========================== */


function clearForm(){



document.getElementById("employeeName").value="";


document.getElementById("projectContainer").innerHTML="";


addProjectCard();



document.getElementById("date").value =
new Date()
.toISOString()
.split("T")[0];


}