const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        taskName: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        _id: false
    }
);


const timesheetSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        date: {
            type: Date,
            required: true
        },


        // ==========================================
        // ATTENDANCE TIME
        // ==========================================

        checkIn: {
            type: String,
            required: true,
            trim: true
        },

        lunchStart: {
            type: String,
            required: true,
            trim: true
        },

        lunchEnd: {
            type: String,
            required: true,
            trim: true
        },

        checkOut: {
            type: String,
            required: true,
            trim: true
        },


        // ==========================================
        // CALCULATED TIME
        // ==========================================

        officeMinutes: {
            type: Number,
            default: 0,
            min: 0
        },

        lunchMinutes: {
            type: Number,
            default: 0,
            min: 0
        },

        workingMinutes: {
            type: Number,
            default: 0,
            min: 0
        },

        officeHours: {
            type: String,
            default: "0h 0m"
        },

        lunchHours: {
            type: String,
            default: "0h 0m"
        },

        workingHours: {
            type: String,
            default: "0h 0m"
        },


        // ==========================================
        // TASKS
        // ==========================================

        tasks: {
            type: [taskSchema],
            default: []
        },


        // ==========================================
        // OLD PROJECT FIELDS
        // Keep existing functionality
        // ==========================================

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null
        },

        projectName: {
            type: String,
            trim: true,
            default: ""
        },

        totalVideos: {
            type: Number,
            default: 0
        },

        completedVideos: {
            type: Number,
            default: 0
        },

        balanceVideos: {
            type: Number,
            default: 0
        },


        // ==========================================
        // COMMENTS
        // ==========================================

        comments: {
            type: String,
            trim: true,
            default: ""
        },


        // ==========================================
        // STATUS
        // ==========================================
status: {
    type: String,
    enum: [
        "Pending",
        "Approved",
        "In Progress",
        "Completed",
        "Rejected"
    ],
    default: "Pending"
}
    },


    {
        timestamps: true
    }
);


// ==========================================
// INDEX
// ==========================================

timesheetSchema.index(
    {
        employee: 1,
        date: 1
    }
);


module.exports =
    mongoose.model(
        "Timesheet",
        timesheetSchema
    );