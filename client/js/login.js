/* ==========================================
   LOGIN SYSTEM
   THE D CUTS TIMESHEET
========================================== */


// Demo Users
// Later MongoDB Backend-க்கு மாற்றுவோம்


const users = [

{

email:"admin@dcuts.com",

password:"admin123",

role:"admin",

name:"Admin"


},


{

email:"employee@dcuts.com",

password:"123456",

role:"employee",

name:"Employee"


}

];




function login(){



const email =

document.getElementById("email").value;



const password =

document.getElementById("password").value;



const message =

document.getElementById("message");




if(email=="" || password==""){


message.innerHTML =
"Please Enter Email & Password";


return;


}




const user = users.find(u =>


u.email === email &&

u.password === password


);




if(!user){


message.innerHTML =
"Invalid Login Details";


return;


}




// Save Login Session


localStorage.setItem(

"loggedUser",

JSON.stringify(user)

);




localStorage.setItem(

"role",

user.role

);




localStorage.setItem(

"userName",

user.name

);





// Redirect


if(user.role==="admin"){



window.location.href="dashboard.html";



}

else if(user.role==="employee"){



window.location.href="timesheet.html";


}




}