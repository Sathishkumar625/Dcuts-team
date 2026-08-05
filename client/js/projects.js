const API_URL =
"http://localhost:5000/api/projects";


let editId=null;





document.addEventListener(
"DOMContentLoaded",
()=>{


loadProjects();


});









// LOAD PROJECTS


async function loadProjects(){


const token =
localStorage.getItem("token");



const response =
await fetch(
API_URL,
{


headers:{


"Authorization":
"Bearer "+token


}


});



const data =
await response.json();



const projects =
data.projects || [];



const table =
document.getElementById(
"projectTable"
);



table.innerHTML="";



projects.forEach(project=>{


table.innerHTML +=
`

<tr>


<td>
${project.projectName}
</td>



<td>
${project.clientName}
</td>



<td>
${project.startDate}
</td>



<td>
${project.endDate}
</td>



<td>
${project.status}
</td>




<td>


<button onclick="editProject('${project._id}')">

Edit

</button>



<button onclick="deleteProject('${project._id}')">

Delete

</button>



</td>



</tr>


`;



});



}









// SAVE PROJECT



async function saveProject(){


const token =
localStorage.getItem("token");



const data={


projectName:
document.getElementById("projectName").value,


clientName:
document.getElementById("clientName").value,


description:
document.getElementById("description").value,


startDate:
document.getElementById("startDate").value,


endDate:
document.getElementById("endDate").value,


status:
document.getElementById("status").value,


budget:
Number(
document.getElementById("budget").value
)


};





let url=API_URL;

let method="POST";





if(editId){


url =
`${API_URL}/${editId}`;


method="PUT";


}





const response =
await fetch(
url,
{


method,


headers:{


"Content-Type":
"application/json",


"Authorization":
"Bearer "+token


},


body:
JSON.stringify(data)


});






const result =
await response.json();



if(result.success){


alert(
"Project Saved Successfully"
);


clearForm();


editId=null;


loadProjects();


}



}









// EDIT PROJECT



async function editProject(id){


const token =
localStorage.getItem("token");



const response =
await fetch(
`${API_URL}/${id}`,
{


headers:{


"Authorization":
"Bearer "+token


}


});



const data =
await response.json();



const project =
data.project;




editId=id;



document.getElementById("projectName").value =
project.projectName;



document.getElementById("clientName").value =
project.clientName;



document.getElementById("description").value =
project.description;



document.getElementById("startDate").value =
project.startDate;



document.getElementById("endDate").value =
project.endDate;



document.getElementById("status").value =
project.status;



document.getElementById("budget").value =
project.budget;



}









// DELETE PROJECT


async function deleteProject(id){


if(
!confirm("Delete Project?")
)

return;



const token =
localStorage.getItem("token");



await fetch(

`${API_URL}/${id}`,

{


method:"DELETE",


headers:{


"Authorization":
"Bearer "+token


}


}

);



loadProjects();


}









// CLEAR FORM


function clearForm(){



document.getElementById("projectName").value="";


document.getElementById("clientName").value="";


document.getElementById("description").value="";


document.getElementById("startDate").value="";


document.getElementById("endDate").value="";


document.getElementById("status").value="Pending";


document.getElementById("budget").value="";


}