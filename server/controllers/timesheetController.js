const Timesheet = require("../models/Timesheet");
const Employee = require("../models/Employee");


// ==================================================
// TIME PARSER
// Accepts:
//
// 9
// 9.30
// 9:30
// 9:30 AM
// 9.30 PM
// 18:30
// 1830
// ==================================================

function parseTime(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    let time =
        String(value)
            .trim()
            .toLowerCase();

    if (!time) {
        return null;
    }

    let period = null;


    // ==========================================
    // AM
    // ==========================================

    if (
        /\b(am|a\.m\.)\b/.test(time)
    ) {

        period = "AM";

        time =
            time.replace(
                /\s*(am|a\.m\.)/g,
                ""
            );
    }


    // ==========================================
    // PM
    // ==========================================

    else if (
        /\b(pm|p\.m\.)\b/.test(time)
    ) {

        period = "PM";

        time =
            time.replace(
                /\s*(pm|p\.m\.)/g,
                ""
            );
    }


    time = time.trim();


    // ==========================================
    // 1830
    // ==========================================

    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2)
            +
            ":"
            +
            time.substring(2);
    }


    // ==========================================
    // 930
    // ==========================================

    else if (
        /^\d{3}$/.test(time)
    ) {

        time = "0" + time;

        time =
            time.substring(0, 2)
            +
            ":"
            +
            time.substring(2);
    }


    // ==========================================
    // 9.30 / 9 30
    // ==========================================

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    // ==========================================
    // 9
    // ==========================================

    if (
        /^\d{1,2}$/.test(time)
    ) {

        time =
            `${time}:00`;
    }


    const parts =
        time.split(":");


    if (
        parts.length !== 2
    ) {

        return null;
    }


    let hours =
        Number(parts[0]);

    let minutes =
        Number(parts[1]);


    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes)
    ) {

        return null;
    }


    if (
        minutes < 0 ||
        minutes > 59
    ) {

        return null;
    }


    // ==========================================
    // AM / PM
    // ==========================================

    if (period) {

        if (
            hours < 1 ||
            hours > 12
        ) {

            return null;
        }


        // 12 AM = 00
        if (
            period === "AM"
        ) {

            if (
                hours === 12
            ) {

                hours = 0;
            }
        }


        // 12 PM = 12
        else {

            if (
                hours !== 12
            ) {

                hours += 12;
            }
        }
    }


    // ==========================================
    // 24 HOUR FORMAT
    // ==========================================

    else {

        if (
            hours < 0 ||
            hours > 23
        ) {

            return null;
        }
    }


    return (
        hours * 60 +
        minutes
    );
}



// ==================================================
// FORMAT HOURS
// ==================================================

function formatHours(minutes) {

    if (
        !Number.isFinite(minutes)
    ) {

        return "0h 0m";
    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;
}



// ==================================================
// CALCULATE ATTENDANCE
// ==================================================

function calculateAttendance(
    checkIn,
    lunchStart,
    lunchEnd,
    checkOut
) {

    const inTime =
        parseTime(checkIn);

    const lunchStartTime =
        parseTime(lunchStart);

    const lunchEndTime =
        parseTime(lunchEnd);

    const outTime =
        parseTime(checkOut);


    if (
        inTime === null ||
        lunchStartTime === null ||
        lunchEndTime === null ||
        outTime === null
    ) {

        return {
            valid: false,
            message:
                "Invalid attendance time."
        };
    }


    // ==========================================
    // TIME ORDER
    // ==========================================

    if (
        lunchStartTime <= inTime
    ) {

        return {
            valid: false,
            message:
                "Lunch start must be after check-in."
        };
    }


    if (
        lunchEndTime <= lunchStartTime
    ) {

        return {
            valid: false,
            message:
                "Lunch end must be after lunch start."
        };
    }


    if (
        outTime <= lunchEndTime
    ) {

        return {
            valid: false,
            message:
                "Check-out must be after lunch end."
        };
    }


    // ==========================================
    // TOTAL OFFICE TIME
    // ==========================================

    const officeMinutes =
        outTime - inTime;


    // ==========================================
    // LUNCH TIME
    // ==========================================

    const lunchMinutes =
        lunchEndTime -
        lunchStartTime;


    // ==========================================
    // WORKING TIME
    // ==========================================

    const workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {

        return {
            valid: false,
            message:
                "Working hours cannot be negative."
        };
    }


    return {

        valid: true,

        officeMinutes,

        lunchMinutes,

        workingMinutes,

        officeHours:
            formatHours(
                officeMinutes
            ),

        lunchHours:
            formatHours(
                lunchMinutes
            ),

        workingHours:
            formatHours(
                workingMinutes
            )
    };
}



// ==================================================
// GET ALL TIMESHEETS
// ==================================================

async function getTimesheets(
    req,
    res
) {

    try {

        const user =
            req.user;


        let query = {};


        // ==========================================
        // EMPLOYEE
        // Employee can see own records
        // Admin can see all records
        // ==========================================

        if (
            user &&
            user.role !== "admin"
        ) {

            query.employee =
                user.employeeId ||
                user._id;
        }


        // ==========================================
        // LOAD TIMESHEETS
        // IMPORTANT:
        // Project populate removed
        // ==========================================

        const records =
            await Timesheet
                .find(query)
                .populate(
                    "employee",
                    "name employeeId email"
                )
                .sort({
                    date: -1,
                    createdAt: -1
                });


        res.json({

            success: true,

            timesheets:
                records

        });

    }


    catch (error) {

        console.error(
            "GET TIMESHEETS ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load timesheets.",

            error:
                error.message

        });
    }
}



// ==================================================
// GET ONE TIMESHEET
// ==================================================

async function getTimesheet(
    req,
    res
) {

    try {

        const record =
            await Timesheet
                .findById(
                    req.params.id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                );


        if (!record) {

            return res.status(404).json({

                success: false,

                message:
                    "Timesheet not found."

            });
        }


        res.json({

            success: true,

            timesheet:
                record

        });

    }


    catch (error) {

        console.error(
            "GET TIMESHEET ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to load timesheet.",

            error:
                error.message

        });
    }
}



// ==================================================
// CREATE TIMESHEET
// ==================================================

async function createTimesheet(
    req,
    res
) {

    try {

        const {

            employee,

            date,

            checkIn,

            lunchStart,

            lunchEnd,

            checkOut,

            tasks,

            comments,

            project,

            projectName,

            totalVideos,

            completedVideos,

            balanceVideos,

            status

        } = req.body;


        // ==========================================
        // REQUIRED EMPLOYEE
        // ==========================================

        if (!employee) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee is required."

            });
        }


        // ==========================================
        // REQUIRED DATE
        // ==========================================

        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "Date is required."

            });
        }


        // ==========================================
        // REQUIRED CHECK-IN
        // ==========================================

        if (!checkIn) {

            return res.status(400).json({

                success: false,

                message:
                    "Check-in time is required."

            });
        }


        // ==========================================
        // REQUIRED LUNCH START
        // ==========================================

        if (!lunchStart) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch start time is required."

            });
        }


        // ==========================================
        // REQUIRED LUNCH END
        // ==========================================

        if (!lunchEnd) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch end time is required."

            });
        }


        // ==========================================
        // REQUIRED CHECK-OUT
        // ==========================================

        if (!checkOut) {

            return res.status(400).json({

                success: false,

                message:
                    "Check-out time is required."

            });
        }


        // ==========================================
        // VERIFY EMPLOYEE
        // ==========================================

        const employeeExists =
            await Employee.findById(
                employee
            );


        if (!employeeExists) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found."

            });
        }


        // ==========================================
        // CALCULATE TIME
        // ==========================================

        const attendance =
            calculateAttendance(
                checkIn,
                lunchStart,
                lunchEnd,
                checkOut
            );


        if (
            !attendance.valid
        ) {

            return res.status(400).json({

                success: false,

                message:
                    attendance.message

            });
        }


        // ==========================================
        // CLEAN TASKS
        // ==========================================

        const cleanTasks =
            Array.isArray(tasks)
                ? tasks
                    .map(
                        task => ({

                            taskName:
                                String(
                                    task.taskName ||
                                    ""
                                ).trim()

                        })
                    )
                    .filter(
                        task =>
                            task.taskName
                    )
                : [];


        // ==========================================
        // CREATE RECORD
        // ==========================================

        const record =
            new Timesheet({

                employee,

                date,

                checkIn,

                lunchStart,

                lunchEnd,

                checkOut,


                officeMinutes:
                    attendance.officeMinutes,

                lunchMinutes:
                    attendance.lunchMinutes,

                workingMinutes:
                    attendance.workingMinutes,


                officeHours:
                    attendance.officeHours,

                lunchHours:
                    attendance.lunchHours,

                workingHours:
                    attendance.workingHours,


                tasks:
                    cleanTasks,


                comments:
                    comments || "",


                // ==================================
                // PROJECT
                // Save project ID if provided
                // But DO NOT populate Project
                // ==================================

                project:
                    project || null,


                projectName:
                    projectName || "",


                totalVideos:
                    Number(
                        totalVideos || 0
                    ),


                completedVideos:
                    Number(
                        completedVideos || 0
                    ),


                balanceVideos:
                    Number(
                        balanceVideos || 0
                    ),


                status:
                    status ||
                    "Pending"

            });


        // ==========================================
        // SAVE
        // ==========================================

        await record.save();


        // ==========================================
        // LOAD SAVED RECORD
        // Employee populate ONLY
        // ==========================================

        const populated =
            await Timesheet
                .findById(
                    record._id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                );


        // ==========================================
        // RESPONSE
        // ==========================================

        res.status(201).json({

            success: true,

            message:
                "Timesheet saved successfully.",

            timesheet:
                populated

        });

    }


    catch (error) {

        console.error(
            "CREATE TIMESHEET ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to save timesheet.",

            error:
                error.message

        });
    }
}



// ==================================================
// UPDATE TIMESHEET
// ==================================================

async function updateTimesheet(
    req,
    res
) {

    try {

        const {

            employee,

            date,

            checkIn,

            lunchStart,

            lunchEnd,

            checkOut,

            tasks,

            comments,

            project,

            projectName,

            totalVideos,

            completedVideos,

            balanceVideos,

            status

        } = req.body;


        // ==========================================
        // FIND RECORD
        // ==========================================

        const record =
            await Timesheet.findById(
                req.params.id
            );


        if (!record) {

            return res.status(404).json({

                success: false,

                message:
                    "Timesheet not found."

            });
        }


        // ==========================================
        // CALCULATE TIME
        // ==========================================

        const attendance =
            calculateAttendance(
                checkIn,
                lunchStart,
                lunchEnd,
                checkOut
            );


        if (
            !attendance.valid
        ) {

            return res.status(400).json({

                success: false,

                message:
                    attendance.message

            });
        }


        // ==========================================
        // CLEAN TASKS
        // ==========================================

        const cleanTasks =
            Array.isArray(tasks)
                ? tasks
                    .map(
                        task => ({

                            taskName:
                                String(
                                    task.taskName ||
                                    ""
                                ).trim()

                        })
                    )
                    .filter(
                        task =>
                            task.taskName
                    )
                : [];


        // ==========================================
        // UPDATE BASIC DATA
        // ==========================================

        record.employee =
            employee ||
            record.employee;


        record.date =
            date ||
            record.date;


        record.checkIn =
            checkIn;


        record.lunchStart =
            lunchStart;


        record.lunchEnd =
            lunchEnd;


        record.checkOut =
            checkOut;


        // ==========================================
        // UPDATE CALCULATED TIME
        // ==========================================

        record.officeMinutes =
            attendance.officeMinutes;


        record.lunchMinutes =
            attendance.lunchMinutes;


        record.workingMinutes =
            attendance.workingMinutes;


        record.officeHours =
            attendance.officeHours;


        record.lunchHours =
            attendance.lunchHours;


        record.workingHours =
            attendance.workingHours;


        // ==========================================
        // TASKS
        // ==========================================

        record.tasks =
            cleanTasks;


        // ==========================================
        // COMMENTS
        // ==========================================

        record.comments =
            comments || "";


        // ==========================================
        // PROJECT
        // No Project populate
        // ==========================================

        record.project =
            project || null;


        record.projectName =
            projectName || "";


        // ==========================================
        // VIDEO COUNTS
        // ==========================================

        record.totalVideos =
            Number(
                totalVideos || 0
            );


        record.completedVideos =
            Number(
                completedVideos || 0
            );


        record.balanceVideos =
            Number(
                balanceVideos || 0
            );


        // ==========================================
        // STATUS
        // ==========================================

        record.status =
            status ||
            record.status;


        // ==========================================
        // SAVE
        // ==========================================

        await record.save();


        // ==========================================
        // RETURN UPDATED RECORD
        // Employee populate ONLY
        // ==========================================

        const populated =
            await Timesheet
                .findById(
                    record._id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                );


        res.json({

            success: true,

            message:
                "Timesheet updated successfully.",

            timesheet:
                populated

        });

    }


    catch (error) {

        console.error(
            "UPDATE TIMESHEET ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to update timesheet.",

            error:
                error.message

        });
    }
}



// ==================================================
// DELETE TIMESHEET
// ==================================================

async function deleteTimesheet(
    req,
    res
) {

    try {

        const record =
            await Timesheet.findById(
                req.params.id
            );


        if (!record) {

            return res.status(404).json({

                success: false,

                message:
                    "Timesheet not found."

            });
        }


        await Timesheet.findByIdAndDelete(
            req.params.id
        );


        res.json({

            success: true,

            message:
                "Timesheet deleted successfully."

        });

    }


    catch (error) {

        console.error(
            "DELETE TIMESHEET ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Failed to delete timesheet.",

            error:
                error.message

        });
    }
}



// ==================================================
// EXPORT CONTROLLER FUNCTIONS
// ==================================================

module.exports = {

    createTimesheet,

    getTimesheets,

    // Route compatibility
    getTimesheetById:
        getTimesheet,

    getTimesheet,

    updateTimesheet,

    deleteTimesheet

};