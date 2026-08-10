/* ==========================================
   THE D CUTS
   FIREBASE GOOGLE LOGIN
========================================== */


import {
    initializeApp
}
from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";



const firebaseConfig = {

    apiKey:
    "AIzaSyDP6-N1ttRIaGuouYm6luo5eFnukTGjTL8",

    authDomain:
    "the-dcuts.firebaseapp.com",

    projectId:
    "the-dcuts",

    storageBucket:
    "the-dcuts.firebasestorage.app",

    messagingSenderId:
    "549784640907",

    appId:
    "1:549784640907:web:677d6c6670d16e9001638e",

    measurementId:
    "G-Q91HC5F105"

};



const app =
initializeApp(firebaseConfig);



const auth =
getAuth(app);



const provider =
new GoogleAuthProvider();



console.log(
    "🔥 GOOGLE LOGIN JS LOADED"
);



window.googleLogin = async function(){


console.log(
    "GOOGLE BUTTON CLICKED"
);



const message =
document.getElementById("message");



try{


if(message){

message.innerText =
"Opening Google Login...";

}



const result =
await signInWithPopup(
    auth,
    provider
);



const user =
result.user;



console.log(
    "GOOGLE USER",
    user
);



const email =
user.email
.toLowerCase()
.trim();



let role="employee";



if(
email ===
"dcutsdigitalsolutions@gmail.com"
){

role="admin";

}




const userData={

name:
user.displayName,

email:
email,

role:
role

};

/* ==========================================
   SEND GOOGLE USER TO BACKEND
========================================== */

const backendResponse =
await fetch(
"http://localhost:5000/api/auth/google",
{

method:"POST",

headers:{

"Content-Type":
"application/json"

},

body:JSON.stringify({

name:
user.displayName,

email:
email

})

}
);



const backendData =
await backendResponse.json();



console.log(
"BACKEND RESPONSE",
backendData
);



if(
!backendData.success
){

throw new Error(
backendData.message ||
"Backend login failed"
);

}



/* ==========================================
   SAVE BACKEND JWT TOKEN
========================================== */


localStorage.setItem(

"token",

backendData.token

);



localStorage.setItem(

"user",

JSON.stringify(
backendData.user
)

);



localStorage.setItem(

"loggedUser",

JSON.stringify(
backendData.user
)

);



localStorage.setItem(

"role",

backendData.user.role

);



localStorage.setItem(

"userName",

backendData.user.name

);



localStorage.setItem(

"userEmail",

backendData.user.email

);


localStorage.setItem(

"user",

JSON.stringify(userData)

);



localStorage.setItem(

"loggedUser",

JSON.stringify(userData)

);



localStorage.setItem(

"role",

role

);




localStorage.setItem(

"userName",

user.displayName

);



localStorage.setItem(

"userEmail",

email

);




console.log(
"LOGIN SUCCESS",
userData
);




if(role==="admin"){


window.location.href =
"./index.html";


}

else{


window.location.href =
"./pages/timesheet.html";


}



}

catch(error){


console.error(
"GOOGLE ERROR",
error
);



alert(
error.message
);



}


}