const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");


mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

    console.log("MongoDB Connected");


    const newPassword = "Admin@12345";


    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );


    const user = await User.findOneAndUpdate(

        {
            email:"admin@dcuts.com"
        },

        {
            password: hashedPassword,
            role:"admin"
        },

        {
            new:true
        }

    );


    if(user){

        console.log("✅ Password Reset Success");
        console.log("Email : admin@dcuts.com");
        console.log("Password : Admin@12345");

    }
    else{

        console.log("❌ Admin user not found");

    }


    mongoose.connection.close();


})
.catch((error)=>{

    console.log(error);

});