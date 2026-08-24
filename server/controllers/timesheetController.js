/* =====================================================
   THE D CUTS - TIMESHEET CONTROLLER
   ADMIN / EMPLOYEE
   TASK + ATTENDANCE + STATUS SUPPORT
===================================================== */

const mongoose = require("mongoose");

const Timesheet =
    require("../models/Timesheet");

const Employee =
    require("../models/Employee");


/* =====================================================
   POPULATE
===================================================== */

const employeePopulate =
    "employeeId name email phone department designation role status";


/* =====================================================
   ADMIN CHECK
===================================================== */

function isAdmin(req) {

    return (
        req.user &&
        String(req.user.role || "")
            .toLowerCase()
            .trim() === "admin"
    );

}


/* =====================================================
   LOGGED-IN EMPLOYEE
===================================================== */

async function getLoggedInEmployee(req) {

    if (
        !req.user ||
        !req.user.email
    ) {
        return null;
    }

    const email =
        String(req.user.email)
            .toLowerCase()
            .trim();

    return await Employee.findOne({
        email
    });

}


/* =====================================================
   ACCESS CHECK
===================================================== */

async function userCanAccessTimesheet(
    req,
    timesheet
) {

    /* ADMIN */

    if (isAdmin(req)) {
        return true;
    }


    /* EMPLOYEE */

    const employee =
        await getLoggedInEmployee(req);

    if (!employee) {
        return false;
    }


    if (
        !timesheet.employee
    ) {
        return false;
    }


    return (
        timesheet.employee.toString() ===
        employee._id.toString()
    );

}


/* =====================================================
   TIME PARSER
===================================================== */

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


    time =
        time.trim();


    /* 1830 */

    if (
        /^\d{4}$/.test(time)
    ) {

        time =
            time.substring(0, 2) +
            ":" +
            time.substring(2);

    }


    /* 930 */

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


    /* 9.30 */

    time =
        time.replace(
            /[.\s]+/g,
            ":"
        );


    /* 9 */

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


    /* AM / PM */

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


/* =====================================================
   FORMAT HOURS
===================================================== */

function formatHours(
    minutes
) {

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


/* =====================================================
   ATTENDANCE CALCULATION
===================================================== */

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


    const officeMinutes =
        outTime - inTime;


    const lunchMinutes =
        lunchEndTime -
        lunchStartTime;


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


/* =====================================================
   CLEAN TASKS
===================================================== */

function cleanTasks(tasks) {

    if (
        !Array.isArray(tasks)
    ) {
        return [];
    }


    return tasks

        .map(task => ({

            taskName:
                String(
                    task?.taskName ||
                    task?.task ||
                    ""
                ).trim()

        }))

        .filter(
            task =>
                task.taskName
        );

}


/* =====================================================
   CREATE TIMESHEET
===================================================== */

const createTimesheet =
    async (req, res) => {

        try {

            const {

                employee,

                project,

                projectName,

                date,

                checkIn,

                lunchStart,

                lunchEnd,

                checkOut,

                tasks,

                comments,

                totalVideos,

                completedVideos,

                balanceVideos

            } = req.body;


            /* ==========================================
               VALIDATION
            ========================================== */

            if (!date) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Date is required."

                });

            }


            /* ==========================================
               EMPLOYEE
            ========================================== */

            let employeeId;


            if (
                isAdmin(req)
            ) {

                if (!employee) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Admin must select an employee."

                    });

                }


                if (
                    !mongoose.Types.ObjectId.isValid(
                        employee
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid Employee ID."

                    });

                }


                const employeeData =
                    await Employee.findById(
                        employee
                    );


                if (!employeeData) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Employee not found."

                    });

                }


                employeeId =
                    employeeData._id;

            }

            else {

                const employeeData =
                    await getLoggedInEmployee(
                        req
                    );


                if (!employeeData) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "Employee profile not found for this login."

                    });

                }


                employeeId =
                    employeeData._id;

            }


            /* ==========================================
               ATTENDANCE
            ========================================== */

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


            /* ==========================================
               TASKS
            ========================================== */

            const finalTasks =
                cleanTasks(tasks);


            if (
                finalTasks.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please enter at least one task."

                });

            }


            /* ==========================================
               VIDEO DATA
            ========================================== */

            const total =
                Math.max(
                    Number(
                        totalVideos
                    ) || 0,
                    0
                );


            const completed =
                Math.max(
                    Number(
                        completedVideos
                    ) || 0,
                    0
                );


            const balance =
                Math.max(
                    total -
                    completed,
                    0
                );


            /* ==========================================
               CREATE
            ========================================== */

            const timesheet =
                await Timesheet.create({

                    employee:
                        employeeId,

                    project:
                        project ||
                        "",

                    projectName:
                        String(
                            projectName ||
                            project ||
                            ""
                        ).trim(),

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
                        finalTasks,

                    comments:
                        String(
                            comments ||
                            ""
                        ).trim(),

                    totalVideos:
                        total,

                    completedVideos:
                        completed,

                    balanceVideos:
                        balance,

                    /* IMPORTANT */

                    status:
                        "Pending"

                });


            /* ==========================================
               POPULATE
            ========================================== */

            const saved =
                await Timesheet
                    .findById(
                        timesheet._id
                    )
                    .populate(
                        "employee",
                        employeePopulate
                    );


            return res.status(201).json({

                success: true,

                message:
                    "Timesheet Saved Successfully",

                timesheet:
                    saved

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
                    error.message ||
                    "Failed to create timesheet."

            });

        }

    };


/* =====================================================
   GET TIMESHEETS
   ADMIN -> ALL
   EMPLOYEE -> OWN
===================================================== */

const getTimesheets =
    async (req, res) => {

        try {

            let query = {};


            if (
                !isAdmin(req)
            ) {

                const employee =
                    await getLoggedInEmployee(
                        req
                    );


                if (!employee) {

                    return res.status(200).json({

                        success: true,

                        count: 0,

                        timesheets: []

                    });

                }


                query.employee =
                    employee._id;

            }


            const timesheets =
                await Timesheet

                    .find(query)

                    .populate(
                        "employee",
                        employeePopulate
                    )

                    .sort({

                        date: -1,

                        createdAt: -1

                    });


            return res.status(200).json({

                success: true,

                count:
                    timesheets.length,

                timesheets

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
                    "Failed to load timesheets."

            });

        }

    };


/* =====================================================
   GET SINGLE
===================================================== */

const getTimesheetById =
    async (req, res) => {

        try {

            const timesheet =
                await Timesheet

                    .findById(
                        req.params.id
                    )

                    .populate(
                        "employee",
                        employeePopulate
                    );


            if (!timesheet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            const allowed =
                await userCanAccessTimesheet(
                    req,
                    timesheet
                );


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            return res.status(200).json({

                success: true,

                timesheet

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
                    "Failed to load timesheet."

            });

        }

    };


/* =====================================================
   UPDATE TIMESHEET
===================================================== */

const updateTimesheet =
    async (req, res) => {

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


            const allowed =
                await userCanAccessTimesheet(
                    req,
                    record
                );


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            const {

                employee,

                project,

                projectName,

                date,

                checkIn,

                lunchStart,

                lunchEnd,

                checkOut,

                tasks,

                comments,

                totalVideos,

                completedVideos,

                status

            } = req.body;


            /* ==========================================
               EMPLOYEE
            ========================================== */

            if (
                employee !== undefined &&
                isAdmin(req)
            ) {

                if (
                    !mongoose.Types.ObjectId.isValid(
                        employee
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid Employee ID."

                    });

                }


                const employeeData =
                    await Employee.findById(
                        employee
                    );


                if (!employeeData) {

                    return res.status(404).json({

                        success: false,

                        message:
                            "Employee not found."

                    });

                }


                record.employee =
                    employeeData._id;

            }


            /* ==========================================
               BASIC DATA
            ========================================== */

            if (
                project !== undefined
            ) {

                record.project =
                    project;

            }


            if (
                projectName !== undefined
            ) {

                record.projectName =
                    String(
                        projectName
                    ).trim();

            }


            if (
                date !== undefined
            ) {

                record.date =
                    date;

            }


            /* ==========================================
               ATTENDANCE
            ========================================== */

            const newCheckIn =
                checkIn !== undefined
                    ? checkIn
                    : record.checkIn;


            const newLunchStart =
                lunchStart !== undefined
                    ? lunchStart
                    : record.lunchStart;


            const newLunchEnd =
                lunchEnd !== undefined
                    ? lunchEnd
                    : record.lunchEnd;


            const newCheckOut =
                checkOut !== undefined
                    ? checkOut
                    : record.checkOut;


            if (
                newCheckIn &&
                newLunchStart &&
                newLunchEnd &&
                newCheckOut
            ) {

                const attendance =
                    calculateAttendance(

                        newCheckIn,

                        newLunchStart,

                        newLunchEnd,

                        newCheckOut

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


                record.checkIn =
                    newCheckIn;

                record.lunchStart =
                    newLunchStart;

                record.lunchEnd =
                    newLunchEnd;

                record.checkOut =
                    newCheckOut;


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

            }


            /* ==========================================
               TASKS
            ========================================== */

            if (
                tasks !== undefined
            ) {

                const finalTasks =
                    cleanTasks(tasks);


                record.tasks =
                    finalTasks;

            }


            /* ==========================================
               COMMENTS
            ========================================== */

            if (
                comments !== undefined
            ) {

                record.comments =
                    String(
                        comments
                    ).trim();

            }


            /* ==========================================
               VIDEOS
            ========================================== */

            if (
                totalVideos !== undefined
            ) {

                record.totalVideos =
                    Math.max(
                        Number(
                            totalVideos
                        ) || 0,
                        0
                    );

            }


            if (
                completedVideos !== undefined
            ) {

                record.completedVideos =
                    Math.max(
                        Number(
                            completedVideos
                        ) || 0,
                        0
                    );

            }


            record.balanceVideos =
                Math.max(

                    Number(
                        record.totalVideos
                    ) || 0

                    -

                    Number(
                        record.completedVideos
                    ) || 0,

                    0

                );


            /* ==========================================
               STATUS
            ========================================== */

            if (
                status !== undefined
            ) {

                const allowedStatuses = [

                    "Pending",

                    "Approved",

                    "Rejected",

                    "Completed"

                ];


                if (
                    !allowedStatuses.includes(
                        status
                    )
                ) {

                    return res.status(400).json({

                        success: false,

                        message:
                            "Invalid status."

                    });

                }


                if (
                    !isAdmin(req)
                ) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "Only Admin can change status."

                    });

                }


                record.status =
                    status;

            }


            await record.save();


            const updated =
                await Timesheet

                    .findById(
                        record._id
                    )

                    .populate(
                        "employee",
                        employeePopulate
                    );


            return res.status(200).json({

                success: true,

                message:
                    "Timesheet Updated Successfully",

                timesheet:
                    updated

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
                    error.message ||
                    "Failed to update timesheet."

            });

        }

    };


/* =====================================================
   DELETE
===================================================== */

const deleteTimesheet =
    async (req, res) => {

        try {

            const timesheet =
                await Timesheet.findById(
                    req.params.id
                );


            if (!timesheet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            const allowed =
                await userCanAccessTimesheet(
                    req,
                    timesheet
                );


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            await Timesheet.findByIdAndDelete(
                req.params.id
            );


            return res.status(200).json({

                success: true,

                message:
                    "Timesheet Deleted Successfully"

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
                    error.message ||
                    "Failed to delete timesheet."

            });

        }

    };


/* =====================================================
   UPDATE STATUS
   ADMIN ONLY
===================================================== */

const updateStatus =
    async (req, res) => {

        try {

            if (
                !isAdmin(req)
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Only Admin can update status."

                });

            }


            const {
                status
            } = req.body;


            const allowedStatuses = [

                "Pending",

                "Approved",

                "Rejected",

                "Completed"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid status."

                });

            }


            const timesheet =
                await Timesheet

                    .findByIdAndUpdate(

                        req.params.id,

                        {
                            status
                        },

                        {
                            new: true,

                            runValidators: true
                        }

                    )

                    .populate(

                        "employee",

                        employeePopulate

                    );


            if (!timesheet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Timesheet Status Updated",

                timesheet

            });

        }

        catch (error) {

            console.error(
                "UPDATE STATUS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Failed to update status."

            });

        }

    };


/* =====================================================
   EXPORT
===================================================== */

module.exports = {

    createTimesheet,

    getTimesheets,

    getTimesheetById,

    updateTimesheet,

    deleteTimesheet,

    updateStatus

};