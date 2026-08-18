const Timesheet =
    require("../models/Timesheet");

const Employee =
    require("../models/Employee");


// ==================================================
// TIME PARSER
// Accepts:
//
// 9
// 9.30
// 9:30
// 9 30
// 9:30 AM
// 9.30 PM
// 9 AM
// 6 PM
// 18:30
// 1830
// 930
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


    // ==================================================
    // AM
    // ==================================================

    if (
        /\b(am|a\.m\.)\b/i.test(time)
    ) {

        period = "AM";

        time =
            time.replace(
                /\s*(am|a\.m\.)\s*/gi,
                ""
            );

    }


    // ==================================================
    // PM
    // ==================================================

    else if (
        /\b(pm|p\.m\.)\b/i.test(time)
    ) {

        period = "PM";

        time =
            time.replace(
                /\s*(pm|p\.m\.)\s*/gi,
                ""
            );

    }


    time =
        time.trim();


    // ==================================================
    // 1830
    // ==================================================

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


    // ==================================================
    // 930
    // ==================================================

    else if (
        /^\d{3}$/.test(time)
    ) {

        time =
            "0" +
            time;

        time =
            time.substring(0, 2)
            +
            ":"
            +
            time.substring(2);

    }


    // ==================================================
    // 9.30 / 9 30
    // ==================================================

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    // ==================================================
    // ONLY HOUR
    // ==================================================

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


    // ==================================================
    // AM / PM
    // ==================================================

    if (period) {

        if (
            hours < 1 ||
            hours > 12
        ) {

            return null;
        }


        if (
            period === "AM"
        ) {

            if (
                hours === 12
            ) {

                hours = 0;
            }

        }

        else {

            if (
                hours !== 12
            ) {

                hours += 12;
            }

        }

    }


    // ==================================================
    // 24 HOUR
    // ==================================================

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
        !Number.isFinite(minutes) ||
        minutes < 0
    ) {

        return "0h 0m";
    }


    minutes =
        Math.floor(minutes);


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    return `${hours}h ${mins}m`;
}


// ==================================================
// SAFE POSITIVE DIFFERENCE
//
// No negative values.
//
// Example:
// 09:00 -> 18:30
// = 570 minutes
//
// If result is negative:
// = 0
// ==================================================

function safeDifference(
    start,
    end
) {

    if (
        start === null ||
        end === null
    ) {

        return 0;
    }


    const difference =
        end - start;


    if (
        difference < 0
    ) {

        return 0;
    }


    return difference;
}


// ==================================================
// CALCULATE ATTENDANCE
//
// IMPORTANT:
//
// NO FIXED TIME
// NO FIXED LUNCH
// NO TIME ORDER VALIDATION
//
// User can enter any valid time.
//
// Office Hours:
// Check-out - Check-in
//
// Lunch:
// Lunch End - Lunch Start
//
// Working:
// Office Hours - Lunch
//
// Missing time:
// automatically 0
// ==================================================

function calculateAttendance(
    checkIn,
    lunchStart,
    lunchEnd,
    checkOut
) {

    const inTime =
        checkIn
            ? parseTime(checkIn)
            : null;


    const lunchStartTime =
        lunchStart
            ? parseTime(lunchStart)
            : null;


    const lunchEndTime =
        lunchEnd
            ? parseTime(lunchEnd)
            : null;


    const outTime =
        checkOut
            ? parseTime(checkOut)
            : null;


    // ==================================================
    // INVALID TIME FORMAT
    // ==================================================

    if (
        checkIn &&
        inTime === null
    ) {

        return {

            valid: false,

            message:
                "Invalid Check-in time."

        };
    }


    if (
        lunchStart &&
        lunchStartTime === null
    ) {

        return {

            valid: false,

            message:
                "Invalid Lunch Start time."

        };
    }


    if (
        lunchEnd &&
        lunchEndTime === null
    ) {

        return {

            valid: false,

            message:
                "Invalid Lunch End time."

        };
    }


    if (
        checkOut &&
        outTime === null
    ) {

        return {

            valid: false,

            message:
                "Invalid Check-out time."

        };
    }


    // ==================================================
    // OFFICE HOURS
    //
    // Only calculate when both check-in
    // and check-out are available.
    // ==================================================

    let officeMinutes = 0;


    if (
        inTime !== null &&
        outTime !== null
    ) {

        officeMinutes =
            safeDifference(
                inTime,
                outTime
            );

    }


    // ==================================================
    // LUNCH HOURS
    //
    // Only calculate when both lunch
    // start and lunch end are available.
    // ==================================================

    let lunchMinutes = 0;


    if (
        lunchStartTime !== null &&
        lunchEndTime !== null
    ) {

        lunchMinutes =
            safeDifference(
                lunchStartTime,
                lunchEndTime
            );

    }


    // ==================================================
    // WORKING HOURS
    // ==================================================

    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    if (
        workingMinutes < 0
    ) {

        workingMinutes = 0;
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


        // ==================================================
        // EMPLOYEE
        // Employee can see own records.
        // ==================================================

        if (
            user &&
            user.role !== "admin"
        ) {

            query.employee =
                user.employeeId ||
                user._id;

        }


        const records =
            await Timesheet
                .find(query)
                .populate(
                    "employee",
                    "name employeeId email"
                )
                .populate(
                    "project",
                    "name projectName"
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
                "Failed to load timesheets."

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
                )
                .populate(
                    "project",
                    "name projectName"
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
                "Failed to load timesheet."

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


        // ==================================================
        // EMPLOYEE REQUIRED
        // ==================================================

        if (!employee) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee is required."

            });

        }


        // ==================================================
        // DATE REQUIRED
        // ==================================================

        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "Date is required."

            });

        }


        // ==================================================
        // TASK REQUIRED
        // ==================================================

        if (
            !Array.isArray(tasks) ||
            tasks.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter at least one task."

            });

        }


        // ==================================================
        // VERIFY EMPLOYEE
        // ==================================================

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


        // ==================================================
        // CALCULATE TIME
        //
        // No fixed time.
        // No fixed lunch.
        // ==================================================

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


        // ==================================================
        // CLEAN TASKS
        // ==================================================

        const cleanTasks =
            Array.isArray(tasks)

                ? tasks
                    .map(
                        task => {

                            if (
                                typeof task ===
                                "string"
                            ) {

                                return {

                                    taskName:
                                        String(
                                            task
                                        ).trim()

                                };

                            }


                            return {

                                taskName:
                                    String(
                                        task.taskName ||
                                        task.name ||
                                        task.title ||
                                        ""
                                    ).trim()

                            };

                        }
                    )
                    .filter(
                        task =>
                            task.taskName
                    )

                : [];


        if (
            cleanTasks.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter at least one task."

            });

        }


        // ==================================================
        // CREATE RECORD
        // ==================================================

        const record =
            new Timesheet({

                employee,

                date,


                // Time fields
                //
                // Empty values remain empty.
                // No fixed time is inserted.

                checkIn:
                    checkIn ||
                    "",

                lunchStart:
                    lunchStart ||
                    "",

                lunchEnd:
                    lunchEnd ||
                    "",

                checkOut:
                    checkOut ||
                    "",


                // Calculated values

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


                // Tasks

                tasks:
                    cleanTasks,


                // Comments

                comments:
                    comments ||
                    "",


                // Optional project

                project:
                    project ||
                    null,

                projectName:
                    projectName ||
                    "",


                // Optional video information

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


        await record.save();


        // ==================================================
        // POPULATE
        // ==================================================

        const populated =
            await Timesheet
                .findById(
                    record._id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                )
                .populate(
                    "project",
                    "name projectName"
                );


        // ==================================================
        // RESPONSE
        // ==================================================

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


        // ==================================================
        // FIND RECORD
        // ==================================================

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


        // ==================================================
        // EMPLOYEE VALIDATION
        // ==================================================

        if (
            employee
        ) {

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

        }


        // ==================================================
        // TASKS
        // ==================================================

        const cleanTasks =
            Array.isArray(tasks)

                ? tasks
                    .map(
                        task => {

                            if (
                                typeof task ===
                                "string"
                            ) {

                                return {

                                    taskName:
                                        String(
                                            task
                                        ).trim()

                                };

                            }


                            return {

                                taskName:
                                    String(
                                        task.taskName ||
                                        task.name ||
                                        task.title ||
                                        ""
                                    ).trim()

                            };

                        }
                    )
                    .filter(
                        task =>
                            task.taskName
                    )

                : [];


        if (
            cleanTasks.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Please enter at least one task."

            });

        }


        // ==================================================
        // CALCULATE TIME
        // ==================================================

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


        // ==================================================
        // UPDATE BASIC DATA
        // ==================================================

        if (
            employee
        ) {

            record.employee =
                employee;

        }


        if (
            date
        ) {

            record.date =
                date;

        }


        // ==================================================
        // TIME VALUES
        // ==================================================

        record.checkIn =
            checkIn ||
            "";

        record.lunchStart =
            lunchStart ||
            "";

        record.lunchEnd =
            lunchEnd ||
            "";

        record.checkOut =
            checkOut ||
            "";


        // ==================================================
        // CALCULATED HOURS
        // ==================================================

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


        // ==================================================
        // TASKS
        // ==================================================

        record.tasks =
            cleanTasks;


        // ==================================================
        // COMMENTS
        // ==================================================

        record.comments =
            comments ||
            "";


        // ==================================================
        // PROJECT
        // ==================================================

        record.project =
            project ||
            null;

        record.projectName =
            projectName ||
            "";


        // ==================================================
        // VIDEOS
        // ==================================================

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


        // ==================================================
        // STATUS
        // ==================================================

        record.status =
            status ||
            record.status ||
            "Pending";


        // ==================================================
        // SAVE
        // ==================================================

        await record.save();


        // ==================================================
        // POPULATE
        // ==================================================

        const populated =
            await Timesheet
                .findById(
                    record._id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                )
                .populate(
                    "project",
                    "name projectName"
                );


        // ==================================================
        // RESPONSE
        // ==================================================

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
//
// IMPORTANT:
// Functions are declared above using:
// async function functionName()
//
// Therefore they can safely be exported here.
// ==================================================

module.exports = {

    createTimesheet,

    getTimesheets,

    getTimesheetById:
        getTimesheet,

    getTimesheet,

    updateTimesheet,

    deleteTimesheet

};