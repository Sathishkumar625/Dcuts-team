const Timesheet = require("../models/Timesheet");
const Employee = require("../models/Employee");


// ======================================================
// TIME PARSER
// Supports:
//
// 9
// 9.30
// 9:30
// 9:30 AM
// 9.30 PM
// 18:30
// 1830
// 930
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


    // AM

    if (
        /\b(am|a\.m\.)\b/i.test(time)
    ) {

        period = "AM";

        time =
            time.replace(
                /\s*(am|a\.m\.)/gi,
                ""
            );

    }


    // PM

    else if (
        /\b(pm|p\.m\.)\b/i.test(time)
    ) {

        period = "PM";

        time =
            time.replace(
                /\s*(pm|p\.m\.)/gi,
                ""
            );

    }


    time =
        time.trim();


    // 1830

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


    // 930

    else if (
        /^\d{3}$/.test(time)
    ) {

        time =
            "0" + time;

        time =
            time.substring(0, 2)
            +
            ":"
            +
            time.substring(2);

    }


    // 9.30 / 9 30

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    // Only hour

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


    // ==============================================
    // AM / PM
    // ==============================================

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


    // ==============================================
    // 24 HOUR
    // ==============================================

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
// NO FIXED TIME RESTRICTION.
//
// User can enter any valid time.
//
// Example:
//
// 9:30 AM
// 1:30 PM
// 2:30 PM
// 7:30 PM
//
// Office = 10h
// Lunch = 1h
// Working = 9h
// ======================================================

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


    // ==============================================
    // OFFICE HOURS
    // ==============================================

    let officeMinutes =
        outTime -
        inTime;


    // Never negative

    if (
        officeMinutes < 0
    ) {

        officeMinutes = 0;

    }


    // ==============================================
    // LUNCH HOURS
    // ==============================================

    let lunchMinutes =
        lunchEndTime -
        lunchStartTime;


    // Never negative

    if (
        lunchMinutes < 0
    ) {

        lunchMinutes = 0;

    }


    // ==============================================
    // WORKING HOURS
    // ==============================================

    let workingMinutes =
        officeMinutes -
        lunchMinutes;


    // Never negative

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
// GET EMPLOYEE BY ID / EMPLOYEE ID / EMAIL
// ======================================================

async function findEmployeeForUser(user) {

    if (!user) {
        return null;
    }


    // ==============================================
    // Try MongoDB _id
    // ==============================================

    if (
        user.employeeId
    ) {

        try {

            const employee =
                await Employee.findById(
                    user.employeeId
                );

            if (employee) {

                return employee;

            }

        }

        catch (error) {

            // employeeId may be "01"
            // so ignore invalid ObjectId

        }

    }


    // ==============================================
    // Try employeeId
    // Example: 01 / 02
    // ==============================================

    if (
        user.employeeId
    ) {

        const employee =
            await Employee.findOne({

                employeeId:
                    String(
                        user.employeeId
                    )

            });


        if (employee) {

            return employee;

        }

    }


    // ==============================================
    // Try email
    // ==============================================

    if (
        user.email
    ) {

        const employee =
            await Employee.findOne({

                email:
                    String(
                        user.email
                    ).toLowerCase()

            });


        if (employee) {

            return employee;

        }

    }


    // ==============================================
    // Try name
    // ==============================================

    if (
        user.name
    ) {

        const employee =
            await Employee.findOne({

                name:
                    String(
                        user.name
                    )

            });


        if (employee) {

            return employee;

        }

    }


    return null;
}



// ======================================================
// GET ALL TIMESHEETS
//
// ADMIN
// -> all records
//
// EMPLOYEE
// -> own records only
// ======================================================

exports.getTimesheets =
async function (
    req,
    res
) {

    try {

        const user =
            req.user;


        let query = {};


        // ==============================================
        // EMPLOYEE LOGIN
        // ==============================================

        if (
            user &&
            user.role !== "admin"
        ) {

            const employee =
                await findEmployeeForUser(
                    user
                );


            if (
                !employee
            ) {

                return res.json({

                    success: true,

                    timesheets: []

                });

            }


            query.employee =
                employee._id;

        }


        // ==============================================
        // LOAD RECORDS
        //
        // IMPORTANT:
        // NO Project populate.
        // This prevents:
        // Schema hasn't been registered for "Project"
        // ==============================================

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
                "Failed to load timesheets."

        });

    }

};



// ======================================================
// GET ONE TIMESHEET
// ======================================================

exports.getTimesheet =
async function (
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


        if (
            !record
        ) {

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

};



// ======================================================
// CREATE TIMESHEET
// ======================================================

exports.createTimesheet =
async function (
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


        // ==============================================
        // REQUIRED EMPLOYEE
        // ==============================================

        if (
            !employee
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Employee is required."

            });

        }


        // ==============================================
        // REQUIRED DATE
        // ==============================================

        if (
            !date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Date is required."

            });

        }


        // ==============================================
        // REQUIRED TIMES
        // ==============================================

        if (
            !checkIn
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Check-in time is required."

            });

        }


        if (
            !lunchStart
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch start time is required."

            });

        }


        if (
            !lunchEnd
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Lunch end time is required."

            });

        }


        if (
            !checkOut
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Check-out time is required."

            });

        }


        // ==============================================
        // VERIFY EMPLOYEE
        // ==============================================

        const employeeExists =
            await Employee.findById(
                employee
            );


        if (
            !employeeExists
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Employee not found."

            });

        }


        // ==============================================
        // CALCULATE ATTENDANCE
        // ==============================================

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


        // ==============================================
        // CLEAN TASKS
        // ==============================================

        const cleanTasks =
            Array.isArray(tasks)

                ? tasks
                    .map(
                        task => ({

                            taskName:
                                String(

                                    task.taskName ||
                                    task.name ||
                                    task.title ||
                                    ""

                                ).trim()

                        })
                    )
                    .filter(
                        task =>
                            task.taskName
                    )

                : [];


        // ==============================================
        // CREATE RECORD
        // ==============================================

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


                // Keep project information
                // but DO NOT populate it

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


        // ==============================================
        // LOAD SAVED RECORD
        // ==============================================

        const populated =
            await Timesheet
                .findById(
                    record._id
                )
                .populate(
                    "employee",
                    "name employeeId email"
                );


        // ==============================================
        // RESPONSE
        // ==============================================

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

};



// ======================================================
// UPDATE TIMESHEET
// ======================================================

exports.updateTimesheet =
async function (
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


        // ==============================================
        // FIND RECORD
        // ==============================================

        const record =
            await Timesheet.findById(
                req.params.id
            );


        if (
            !record
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Timesheet not found."

            });

        }


        // ==============================================
        // CALCULATE
        // ==============================================

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


        // ==============================================
        // CLEAN TASKS
        // ==============================================

        const cleanTasks =
            Array.isArray(tasks)

                ? tasks
                    .map(
                        task => ({

                            taskName:
                                String(

                                    task.taskName ||
                                    task.name ||
                                    task.title ||
                                    ""

                                ).trim()

                        })
                    )
                    .filter(
                        task =>
                            task.taskName
                    )

                : [];


        // ==============================================
        // UPDATE
        // ==============================================

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


        // ==============================================
        // RETURN UPDATED RECORD
        // ==============================================

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

};



// ======================================================
// DELETE TIMESHEET
// ======================================================

exports.deleteTimesheet =
async function (
    req,
    res
) {

    try {

        const record =
            await Timesheet.findById(
                req.params.id
            );


        if (
            !record
        ) {

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
                "Failed to delete timesheet."

        });

    }

};



// ======================================================
// ROUTE COMPATIBILITY
// ======================================================

exports.getTimesheetById =
    exports.getTimesheet;