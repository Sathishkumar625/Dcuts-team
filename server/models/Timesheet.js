const mongoose = require("mongoose");


/* =====================================================
   TIMESHEET SCHEMA
===================================================== */

const timesheetSchema = new mongoose.Schema(

    {

        /* ==========================================
           EMPLOYEE
        ========================================== */

        employee: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Employee",

            required: true

        },


        /* ==========================================
           EMPLOYEE DISPLAY INFO
           01 - Naveen
           02 - Sathish
        ========================================== */

        employeeCode: {

            type: String,

            trim: true,

            default: ""

        },


        employeeName: {

            type: String,

            trim: true,

            default: ""

        },


        /* ==========================================
           DATE
        ========================================== */

        date: {

            type: Date,

            required: true

        },


        /* ==========================================
           CHECK IN
        ========================================== */

        checkIn: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================================
           LUNCH BREAK START
        ========================================== */

        lunchStart: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================================
           LUNCH BREAK END
        ========================================== */

        lunchEnd: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================================
           CHECK OUT
        ========================================== */

        checkOut: {

            type: String,

            required: true,

            trim: true

        },


        /* ==========================================
           WORKING HOURS
        ========================================== */

        workingHours: {

            minutes: {

                type: Number,

                default: 0,

                min: 0

            },

            formatted: {

                type: String,

                default: "0h 0m",

                trim: true

            }

        },


        /* ==========================================
           TOTAL TASK
        ========================================== */

        totalTask: {

            type: Number,

            default: 0,

            min: 0

        },


        /* ==========================================
           TASKS
           
           Example:
           [
             "Wedding Video Editing",
             "Instagram Reel Editing"
           ]
        ========================================== */

        tasks: {

            type: [

                {

                    type: String,

                    trim: true

                }

            ],

            default: []

        },


        /* ==========================================
           COMMENTS
        ========================================== */

        comments: {

            type: String,

            default: "",

            trim: true

        },


        /* ==========================================
           OLD PROJECT FIELDS
           Kept temporarily for compatibility
           with existing records/API.
        ========================================== */

        project: {

            type: String,

            default: "",

            trim: true

        },


        projectName: {

            type: String,

            default: "",

            trim: true

        },


        /* ==========================================
           OLD VIDEO FIELDS
           Kept for existing data compatibility.
        ========================================== */

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


        /* ==========================================
           STATUS
        ========================================== */

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


/* =====================================================
   AUTO CALCULATE TOTAL TASK
===================================================== */

timesheetSchema.pre(
    "save",
    function (next) {

        if (
            Array.isArray(
                this.tasks
            )
        ) {

            this.tasks =
                this.tasks
                    .map(
                        task =>
                            String(
                                task
                            ).trim()
                    )
                    .filter(
                        task =>
                            task.length > 0
                    );


            this.totalTask =
                this.tasks.length;

        }


        /* ==========================================
           OLD VIDEO BALANCE
        ========================================== */

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


        next();

    }
);


/* =====================================================
   MODEL
===================================================== */

module.exports =
    mongoose.model(
        "Timesheet",
        timesheetSchema
    );