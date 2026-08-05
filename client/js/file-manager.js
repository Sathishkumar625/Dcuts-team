const API_URL = "http://localhost:5000/api/files";

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {

    loadEmployees();

    loadClients();

    loadFiles();

});

// =============================
// LOAD EMPLOYEES
// =============================

async function loadEmployees(){

    try{

        const res = await fetch(
            "http://localhost:5000/api/employees",
            {
                headers:{
                    Authorization:"Bearer "+token
                }
            }
        );

        const data = await res.json();

        const select =
        document.getElementById("employee");

        select.innerHTML =
        `<option value="">Select Employee</option>`;

        if(data.success){

            data.employees.forEach(emp=>{

                select.innerHTML +=
                `
                <option value="${emp._id}">
                    ${emp.name}
                </option>
                `;

            });

        }

    }
    catch(error){

        console.log(error);

    }

}

// =============================
// LOAD CLIENTS
// =============================

async function loadClients(){

    try{

        const res = await fetch(
            "http://localhost:5000/api/clients",
            {
                headers:{
                    Authorization:"Bearer "+token
                }
            }
        );

        const data = await res.json();

        const select =
        document.getElementById("client");

        select.innerHTML =
        `<option value="">Select Client</option>`;

        if(data.success){

            data.clients.forEach(client=>{

                select.innerHTML +=
                `
                <option value="${client._id}">
                    ${client.clientName}
                </option>
                `;

            });

        }

    }
    catch(error){

        console.log(error);

    }

}

// =============================
// UPLOAD FILE
// =============================

async function uploadFiles(){

    const employee =
    document.getElementById("employee").value;

    const client =
    document.getElementById("client").value;

    const project =
    document.getElementById("project").value;

    const images =
    document.getElementById("images").files;

    const video =
    document.getElementById("video").files[0];

    if(!employee || !client || !project){

        alert("Fill all fields");

        return;

    }

    const formData =
    new FormData();

    formData.append("employee",employee);

    formData.append("client",client);

    formData.append("project",project);

    for(let i=0;i<images.length;i++){

        formData.append("images",images[i]);

    }

    if(video){

        formData.append("video",video);

    }

    try{

        const res =
        await fetch(API_URL,{

            method:"POST",

            headers:{

                Authorization:"Bearer "+token

            },

            body:formData

        });

        const data =
        await res.json();

        alert(data.message);

        loadFiles();

        clearForm();

    }

    catch(error){

        console.log(error);

    }

}

// =============================
// LOAD FILES
// =============================

async function loadFiles(){

    try{

        const res =
        await fetch(API_URL,{

            headers:{
                Authorization:"Bearer "+token
            }

        });

        const data =
        await res.json();

        const table =
        document.getElementById("fileTable");

        table.innerHTML="";

        if(data.success){

            data.files.forEach(file=>{

                let preview="";

                if(file.fileType==="image"){

                    preview=
                    `
                    <img
                    src="http://localhost:5000/${file.filePath}"
                    class="preview-img">
                    `;

                }
                else{

                    preview=
                    `
                    <i class="fa-solid fa-video video-icon"></i>
                    `;

                }

                table.innerHTML +=

                `
                <tr>

                <td>${preview}</td>

                <td>${file.project}</td>

                <td>${file.employee?.name}</td>

                <td>${file.fileName}</td>

                <td>${file.fileType}</td>

                <td>

                <button
                class="action-btn download-btn"
                onclick="downloadFile('${file.filePath}')">

                Download

                </button>

                <button
                class="action-btn delete-btn"
                onclick="deleteFile('${file._id}')">

                Delete

                </button>

                </td>

                </tr>

                `;

            });

        }

    }

    catch(error){

        console.log(error);

    }

}

// =============================
// DELETE
// =============================

async function deleteFile(id){

    if(!confirm("Delete File?"))

    return;

    await fetch(API_URL+"/"+id,{

        method:"DELETE",

        headers:{
            Authorization:"Bearer "+token
        }

    });

    loadFiles();

}

// =============================
// DOWNLOAD
// =============================

function downloadFile(path){

    window.open(

    "http://localhost:5000/"+path,

    "_blank"

    );

}

// =============================
// SEARCH
// =============================

function searchFiles(){

    const input =
    document.getElementById("search")
    .value.toLowerCase();

    const rows =
    document.querySelectorAll("#fileTable tr");

    rows.forEach(row=>{

        if(row.innerText.toLowerCase().includes(input)){

            row.style.display="";

        }
        else{

            row.style.display="none";

        }

    });

}

// =============================
// CLEAR FORM
// =============================

function clearForm(){

    document.getElementById("employee").value="";

    document.getElementById("client").value="";

    document.getElementById("project").value="";

    document.getElementById("images").value="";

    document.getElementById("video").value="";

}