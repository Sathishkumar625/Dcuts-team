const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({

    clientName:{

        type:String,

        required:true,

        trim:true

    },



    companyName:{

        type:String,

        required:true,

        trim:true

    },



    phone:{

        type:String,

        required:true

    },



    email:{

        type:String,

        required:true,

        unique:true,

        lowercase:true

    },



    address:{

        type:String,

        default:""

    },



    gst:{

        type:String,

        default:""

    },



    status:{

        type:String,

        enum:["Active","Inactive"],

        default:"Active"

    }

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "Client",
    clientSchema
);