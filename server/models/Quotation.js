const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema({

    quotationNo: {
        type: String,
        required: true,
        unique: true
    },

    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },

    quotationDate: {
        type: Date,
        default: Date.now
    },

    validTill: {
        type: Date,
        required: true
    },

    services: [
        {
            serviceName: String,
            quantity: Number,
            price: Number,
            amount: Number
        }
    ],

    subtotal: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    tax: {
        type: Number,
        default: 0
    },

    grandTotal: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "Draft",
            "Sent",
            "Approved",
            "Rejected",
            "Expired"
        ],
        default: "Draft"
    },

    remarks: {
        type: String,
        default: ""
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Quotation", quotationSchema);