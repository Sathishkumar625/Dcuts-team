const User = require("../models/User");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");




// =====================
// REGISTER
// =====================

exports.register = async(req,res)=>{


try{


const {
name,
email,
password,
role
}=req.body;



const exist =
await User.findOne({email});


if(exist){

return res.status(400).json({

message:"User already exists"

});

}



const hashPassword =
await bcrypt.hash(password,10);



const user =
await User.create({

name,

email,

password:hashPassword,

role

});



res.json({

success:true,

user

});



}

catch(error){


res.status(500).json({

message:error.message

});


}

};







// =====================
// NORMAL LOGIN
// =====================


exports.login = async(req,res)=>{


try{


const {

email,

password

}=req.body;




const user =
await User.findOne({email});



if(!user){


return res.status(404).json({

message:"User not found"

});


}




const match =
await bcrypt.compare(

password,

user.password

);




if(!match){


return res.status(401).json({

message:"Wrong Password"

});


}





const token =
jwt.sign(

{

id:user._id,

role:user.role

},


process.env.JWT_SECRET,


{

expiresIn:"1d"

}


);






res.json({

success:true,

token,

user

});



}

catch(error){


res.status(500).json({

message:error.message

});


}


};









// =====================
// GOOGLE LOGIN
// =====================


exports.googleLogin = async(req,res)=>{


try{


const {

name,

email

}=req.body;





let user =
await User.findOne({

email

});





// New Google User Create

if(!user){


user =
await User.create({

name:name,

email:email,

password:"google-login",

role:"employee"


});


}






const token =
jwt.sign(

{

id:user._id,

role:user.role

},


process.env.JWT_SECRET,


{

expiresIn:"1d"

}


);






res.json({

success:true,

token,


user:{


name:user.name,

email:user.email,

role:user.role


}


});



}

catch(error){


res.status(500).json({

success:false,

message:error.message


});


}


};