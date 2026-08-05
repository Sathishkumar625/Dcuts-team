import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

getAuth,

GoogleAuthProvider,

signInWithPopup

}

from 

"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";




// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDP6-N1ttRIaGuouYm6luo5eFnukTGjTL8",
  authDomain: "the-dcuts.firebaseapp.com",
  projectId: "the-dcuts",
  storageBucket: "the-dcuts.firebasestorage.app",
  messagingSenderId: "549784640907",
  appId: "1:549784640907:web:677d6c6670d16e9001638e",
  measurementId: "G-Q91HC5F105"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const provider = new GoogleAuthProvider();





window.googleLogin=function(){



signInWithPopup(auth,provider)

.then((result)=>{



const user=result.user;



let email=user.email;



/*
ADMIN EMAIL
*/


const adminEmail="dcutsdigitalsolutions@gmail.com";





let role;



if(email===adminEmail){


role="admin";


}

else{


role="employee";


}





localStorage.setItem(

"loggedUser",

JSON.stringify({

name:user.displayName,

email:user.email,

role:role

})

);



localStorage.setItem(

"role",

role

);



localStorage.setItem(

"userName",

user.displayName

);





if(role==="admin"){



window.location.href="dashboard.html";



}

else{


window.location.href="timesheet.html";


}




})


.catch((error)=>{


alert(error.message);


});


}