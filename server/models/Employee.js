const mongoose = require("mongoose");


const employeeSchema = new mongoose.Schema({

    employeeId:{
        type:String,
        unique:true
    },


    name:{
        type:String,
        required:true
    },


    email:{
        type:String,
        required:true
    },


    phone:{
        type:String
    },


    department:{
        type:String
    },


    designation:{
        type:String
    },


    role:{
        type:String,
        default:"Employee"
    },


    status:{
        type:String,
        default:"Active"
    }


},
{
    timestamps:true
});


module.exports =
mongoose.model(
"Employee",
employeeSchema
);