import { initializeApp }

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


apiKey:"YOUR_API_KEY",

authDomain:"YOUR_AUTH_DOMAIN",

projectId:"dcuts-timesheet",

storageBucket:"YOUR_STORAGE_BUCKET",

messagingSenderId:"YOUR_SENDER_ID",

appId:"YOUR_APP_ID"


};





const app =
initializeApp(firebaseConfig);



const auth =
getAuth(app);



const provider =
new GoogleAuthProvider();





window.googleLogin = async()=>{


try{


const result =

await signInWithPopup(
auth,
provider
);



const user =
result.user;



console.log(user);



localStorage.setItem(

"user",

JSON.stringify({

name:user.displayName,

email:user.email,

photo:user.photoURL,

loginType:"Google"

})

);



alert(
"Google Login Success"
);



window.location.href=
"dashboard.html";



}


catch(error){


console.log(error);


alert(error.message);


}


}