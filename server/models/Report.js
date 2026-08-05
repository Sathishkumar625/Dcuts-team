const mongoose = require("mongoose");

const dailyReportSchema = new mongoose.Schema(

{

    employee:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Employee",

        required:true

    },



    client:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Client",

        required:true

    },



    project:{

        type:String,

        required:true

    },



    date:{

        type:String,

        required:true

    },



    work:{

        type:String,

        required:true

    },



    hours:{

        type:Number,

        required:true

    },



    remarks:{

        type:String,

        default:""

    },



    images:[

        {

            type:String

        }

    ],



    video:{

        type:String,

        default:""

    },



    status:{

        type:String,

        enum:["Pending","Completed"],

        default:"Completed"

    }

},
{
    timestamps:true
});

module.exports =
mongoose.model(
"DailyReport",
dailyReportSchema
);