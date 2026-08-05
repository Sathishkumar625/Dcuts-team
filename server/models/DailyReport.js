const mongoose = require("mongoose");


const dailyReportSchema = new mongoose.Schema({

    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Employee",
        required:true
    },


    date:{
        type:String,
        required:true
    },


    projectName:{
        type:String,
        required:true
    },


    workDetails:{
        type:String,
        required:true
    },


    completedTask:{
        type:String
    },


    pendingTask:{
        type:String
    },


    hoursWorked:{
        type:Number,
        default:0
    },


    remarks:{
        type:String
    }


},{
    timestamps:true
});


module.exports =
mongoose.model(
"DailyReport",
dailyReportSchema
);