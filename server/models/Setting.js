const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({

    adminName: {
        type: String,
        default: ""
    },

    adminEmail: {
        type: String,
        default: ""
    },

    adminPhone: {
        type: String,
        default: ""
    },

    companyName: {
        type: String,
        default: "THE D CUTS"
    },

    companyAddress: {
        type: String,
        default: ""
    },

    gst: {
        type: String,
        default: ""
    },

    logo: {
        type: String,
        default: ""
    },

    theme: {
        type: String,
        enum: ["dark", "light"],
        default: "dark"
    }

},
{
    timestamps: true
});

module.exports = mongoose.model("Setting", settingSchema);