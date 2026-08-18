const Timesheet = require("../models/Timesheet");
const Employee = require("../models/Employee");


// ======================================================
// TIME PARSER
// Supports:
// 9
// 9.30
// 9:30
// 9 AM
// 9:30 AM
// 9.30 PM
// 6 PM
// 18:30
// 1830
// ======================================================

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


    // ------------------------------------------
    // AM
    // ------------------------------------------

    if (
        /\b(am|a\.m\.)\b/i.test(time)
    ) {

        period = "AM";

        time =
            time.replace(
                /\s*(a\.m\.|am)\s*/i,
                ""
            );
    }


    // ------------------------------------------
    // PM
    // ------------------------------------------

    else if (
        /\b(pm|p\.m\.)\b/i.test(time)
    ) {

        period = "PM";

        time =
            time.replace(
                /\s*(p\.m\.|pm)\s*/i,
                ""
            );
    }


    time =
        time.trim();


    // ------------------------------------------
    // 1830
    // ------------------------------------------

    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);
    }


    // ------------------------------------------
    // 930
    // ------------------------------------------

    else if (
        /^\d{3}$/.test(time)
    ) {

        time =
            "0" + time;

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);
    }


    // ------------------------------------------
    // 9.30 / 9 30
    // ------------------------------------------

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    // ------------------------------------------
    // ONLY HOUR
    // 9 -> 9:00
    // ------------------------------------------

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


    // ------------------------------------------
    // AM / PM
    // ------------------------------------------

    if (period) {

        if (
            hours < 1 ||
            hours > 12
        ) {
            return null;
        }


        if (period === "AM") {

            if (hours === 12) {
                hours = 0;
            }

        } else {

            if (hours !== 12) {
                hours += 12;
            }
        }

    }


    // ------------------------------------------
    // 24 HOUR
    // ------------------------------------------

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



// ======================================================
// FORMAT HOURS
// ======================================================

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



// ======================================================
// CALCULATE ATTENDANCE
//
// IMPORTANT:
//
// NO FIXED TIME
// NO LUNCH TIME RESTRICTION
// NO TIME ORDER RESTRICTION
//
// User can enter any valid time.
//
// Example:
//
// 09:30 -> 19:00
// Lunch 13:00 -> 14:00
//
// Office = 9h 30m
// Lunch  = 1h
// Working = 8h 30m
//
// If times are reversed:
// negative values are converted to 0.
// ======================================================

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


    // ------------------------------------------
    // DEFAULT OFFICE HOURS
    // ------------------------------------------

    const DEFAULT_OFFICE_MINUTES =
        9 * 60 + 30;


    let officeMinutes =
        DEFAULT_OFFICE_MINUTES;


    let lunchMinutes =
        0;


    let workingMinutes =
        DEFAULT_OFFICE_MINUTES;


    // ------------------------------------------
    // CHECK-IN + CHECK-OUT
    // ------------------------------------------

    if (
        inTime !== null &&
        outTime !== null
    ) {

        officeMinutes =
            outTime - inTime;


        if (
            officeMinutes < 0
        ) {
            officeMinutes = 0;
        }
    }


    // ------------------------------------------
    // LUNCH
    // ------------------------------------------

    if (
        lunchStartTime !== null &&
        lunchEndTime !== null
    ) {

        lunchMinutes =
            lunchEndTime -
            lunchStartTime;


        if (
            lunchMinutes < 0
        ) {
            lunchMinutes = 0;
        }
    }


    // ------------------------------------------
    // WORKING
    // ------------------------------------------

    workingMinutes =
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



// ======================================================
// CLEAN TASKS
// ======================================================

function cleanTaskList(tasks) {

    if (
        !Array.isArray(tasks)
    ) {
        return [];
    }


    return tasks

        .map(
            task => {

                if (
                    typeof task === "string"
                ) {

                    return {
                        taskName:
                            task.trim()
                    };
                }


                return {

                    taskName:
                        String(
                            task?.taskName ||
                            task?.name ||
                            task?.title ||
                            ""
                        ).trim()

                };

            }
        )

        .filter(
            task =>
                task.taskName
        );
}



// ======================================================
// GET ALL TIMESHEETS
//
// ADMIN:
// sees ALL employees' records.
//
// EMPLOYEE:
// sees only own records.
// ======================================================

async function getTimesheets(
    req,
    res
) {

    try {

        const user =
            req.user;


        let query = {};


        // ------------------------------------------
        // EMPLOYEE
        // ------------------------------------------

        if (
            user &&
            user.role !== "admin"
        ) {

            const employeeId =
                user.employeeId ||
                user._id;


            if (
                employeeId
            ) {

                query.employee =
                    employeeId;

            }

        }


        // ------------------------------------------
        // ADMIN
        // query remains {}
        // therefore ALL records
        // ------------------------------------------

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


        return res.json({

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


        return res.status(500).json({

            success: false,

            message:
                "Failed to load timesheets.",

            error:
                error.message

        });

    }

}



// ======================================================
// GET ONE TIMESHEET
// ======================================================

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


        return res.json({

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


        return res.status(500).json({

            success: false,

            message:
                "Failed to load timesheet.",

            error:
                error.message

        });

    }

}



// ======================================================
// CREATE TIMESHEET
// ======================================================

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


        // ------------------------------------------
        // EMPLOYEE REQUIRED
        // ------------------------------------------

        if (!employee) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee is required."

            });

        }


        // ------------------------------------------
        // DATE REQUIRED
        // ------------------------------------------

        if (!date) {

            return res.status(400).json({

                success: false,

                message:
                    "Date is required."

            });

        }


        // ------------------------------------------
        // VERIFY EMPLOYEE
        // ------------------------------------------

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


        // ------------------------------------------
        // TIME FORMAT VALIDATION
        //
        // Time fields are optional.
        //
        // But if entered, they must be valid.
        // ------------------------------------------

        const timeFields = [
            ["checkIn", checkIn],
            ["lunchStart", lunchStart],
            ["lunchEnd", lunchEnd],
            ["checkOut", checkOut]
        ];


        for (
            const [field, value]
            of timeFields
        ) {

            if (
                value &&
                parseTime(value) === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `${field} time is invalid.`

                });

            }

        }


        // ------------------------------------------
        // CALCULATE
        // ------------------------------------------

        const attendance =
            calculateAttendance(
                checkIn,
                lunchStart,
                lunchEnd,
                checkOut
            );


        // ------------------------------------------
        // TASKS
        // ------------------------------------------

        const cleanTasks =
            cleanTaskList(tasks);


        // ------------------------------------------
        // CREATE RECORD
        // ------------------------------------------

        const record =
            new Timesheet({

                employee,

                date,

                checkIn:
                    checkIn || "",

                lunchStart:
                    lunchStart || "",

                lunchEnd:
                    lunchEnd || "",

                checkOut:
                    checkOut || "",


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


        await record.save();


        // ------------------------------------------
        // POPULATE
        // ------------------------------------------

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


        return res.status(201).json({

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


        return res.status(500).json({

            success: false,

            message:
                "Failed to save timesheet.",

            error:
                error.message

        });

    }

}



// ======================================================
// UPDATE TIMESHEET
// ======================================================

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


        // ------------------------------------------
        // VERIFY TIMES
        // ------------------------------------------

        const timeFields = [
            ["checkIn", checkIn],
            ["lunchStart", lunchStart],
            ["lunchEnd", lunchEnd],
            ["checkOut", checkOut]
        ];


        for (
            const [field, value]
            of timeFields
        ) {

            if (
                value &&
                parseTime(value) === null
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `${field} time is invalid.`

                });

            }

        }


        // ------------------------------------------
        // CALCULATE
        // ------------------------------------------

        const attendance =
            calculateAttendance(
                checkIn,
                lunchStart,
                lunchEnd,
                checkOut
            );


        // ------------------------------------------
        // TASKS
        // ------------------------------------------

        const cleanTasks =
            cleanTaskList(tasks);


        // ------------------------------------------
        // UPDATE
        // ------------------------------------------

        if (employee) {

            record.employee =
                employee;

        }


        if (date) {

            record.date =
                date;

        }


        record.checkIn =
            checkIn || "";


        record.lunchStart =
            lunchStart || "";


        record.lunchEnd =
            lunchEnd || "";


        record.checkOut =
            checkOut || "";


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


        record.tasks =
            cleanTasks;


        record.comments =
            comments || "";


        record.project =
            project || null;


        record.projectName =
            projectName || "";


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


        record.status =
            status ||
            record.status ||
            "Pending";


        await record.save();


        // ------------------------------------------
        // POPULATE
        // ------------------------------------------

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


        return res.json({

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


        return res.status(500).json({

            success: false,

            message:
                "Failed to update timesheet.",

            error:
                error.message

        });

    }

}



// ======================================================
// DELETE TIMESHEET
// ======================================================

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


        return res.json({

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


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete timesheet.",

            error:
                error.message

        });

    }

}



// ======================================================
// EXPORTS
//
// IMPORTANT:
// Do NOT use:
// module.exports = { createTimesheet }
// when createTimesheet was only exports.createTimesheet.
//
// Here all functions are declared properly.
// ======================================================

module.exports = {

    createTimesheet,

    getTimesheets,

    getTimesheet,

    getTimesheetById:
        getTimesheet,

    updateTimesheet,

    deleteTimesheet

};