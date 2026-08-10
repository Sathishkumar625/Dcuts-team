const mongoose = require("mongoose");


const timesheetSchema = new mongoose.Schema(

    {

        /* =====================================
           EMPLOYEE
        ===================================== */

        employee: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Employee",

            required: true

        },


        /* =====================================
           PROJECT
        ===================================== */

        project: {

            type: String,

            required: true,

            trim: true

        },


        projectName: {

            type: String,

            required: true,

            trim: true

        },


        /* =====================================
           DATE
        ===================================== */

        date: {

            type: Date,

            required: true

        },


        /* =====================================
           VIDEO DETAILS
        ===================================== */

        totalVideos: {

            type: Number,

            default: 0,

            min: 0

        },


        completedVideos: {

            type: Number,

            default: 0,

            min: 0

        },


        balanceVideos: {

            type: Number,

            default: 0,

            min: 0

        },


        /* =====================================
           COMMENTS
        ===================================== */

        comments: {

            type: String,

            default: "",

            trim: true

        },


        /* =====================================
           STATUS
        ===================================== */

        status: {

            type: String,

            enum: [

                "Pending",

                "Approved",

                "Rejected",

                "Completed"

            ],

            default: "Pending"

        }

    },

    {

        timestamps: true

    }

);


/* ==========================================
   AUTO CALCULATE BALANCE
========================================== */

timesheetSchema.pre(
    "save",
    function () {

        const total =
            Number(
                this.totalVideos
            ) || 0;


        const completed =
            Number(
                this.completedVideos
            ) || 0;


        this.balanceVideos =
            Math.max(
                total - completed,
                0
            );

    }
);


/* ==========================================
   MODEL
========================================== */

module.exports =
    mongoose.model(
        "Timesheet",
        timesheetSchema
    );