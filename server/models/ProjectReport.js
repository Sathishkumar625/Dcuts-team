const mongoose = require("mongoose");


const projectReportSchema = new mongoose.Schema({

    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employee",
        required:true
    },


    projectName:{
        type:String,
        required:true
    },


    clientName:{
        type:String,
        default:""
    },


    reportDate:{
        type:String,
        required:true
    },


    workDescription:{
        type:String,
        required:true
    },


    completedPercentage:{
        type:Number,
        default:0
    },


    status:{
        type:String,
        default:"Pending"
    },


    comments:{
        type:String,
        default:""
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "ProjectReport",
    projectReportSchema
);