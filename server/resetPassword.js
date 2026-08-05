const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
.then(async()=>{

    const newPassword = "dcutsteam";

    const hashedPassword = await bcrypt.hash(newPassword,10);


    await User.findOneAndUpdate(
        {
            email:"admin@dcuts.com"
        },
        {
            password: hashedPassword
        }
    );


    console.log("Password Reset Success");
    console.log("New Password:",newPassword);

    process.exit();

})
.catch(err=>{
    console.log(err);
});