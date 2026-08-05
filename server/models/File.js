const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(

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

    fileName:{

        type:String,

        required:true

    },

    fileType:{

        type:String,

        enum:["image","video"],

        required:true

    },

    filePath:{

        type:String,

        required:true

    },

    fileSize:{

        type:Number,

        default:0

    }

},
{
    timestamps:true
});

module.exports = mongoose.model(
    "File",
    fileSchema
);