/* =====================================================
   THE D CUTS - TIMESHEET CONTROLLER
   ADMIN / EMPLOYEE ACCESS CONTROL

   Includes:
   - Employee
   - Check-in
   - Lunch start
   - Lunch end
   - Check-out
   - Working hours
   - Total task
   - Multiple tasks
   - Comments
   - Status
===================================================== */

const mongoose =
    require("mongoose");

const Timesheet =
    require("../models/Timesheet");

const Employee =
    require("../models/Employee");


/* =====================================================
   POPULATE FIELDS
===================================================== */

const employeePopulate =
    "employeeId name email phone department designation role status";


/* =====================================================
   CHECK ADMIN
===================================================== */

const isAdmin = (req) => {

    return (
        req.user &&
        String(req.user.role).toLowerCase() ===
        "admin"
    );

};


/* =====================================================
   FIND LOGGED-IN EMPLOYEE
===================================================== */

const getLoggedInEmployee =
    async (req) => {

        try {

            if (
                !req.user ||
                !req.user.email
            ) {

                return null;

            }


            const email =
                String(
                    req.user.email
                )
                .toLowerCase()
                .trim();


            const employee =
                await Employee.findOne({
                    email: email
                });


            return employee;

        }

        catch (error) {

            console.error(
                "GET LOGGED EMPLOYEE ERROR:",
                error
            );

            return null;

        }

    };


/* =====================================================
   CHECK TIMESHEET ACCESS
===================================================== */

const userCanAccessTimesheet =
    async (
        req,
        timesheet
    ) => {

        /* ADMIN */

        if (
            isAdmin(req)
        ) {

            return true;

        }


        /* EMPLOYEE */

        const employee =
            await getLoggedInEmployee(
                req
            );


        if (!employee) {

            return false;

        }


        return (

            timesheet.employee &&

            timesheet.employee
                .toString() ===
            employee._id.toString()

        );

    };


/* =====================================================
   CALCULATE WORKING HOURS
===================================================== */

const calculateWorkingHours =
    (
        checkIn,
        lunchStart,
        lunchEnd,
        checkOut
    ) => {

        const toMinutes =
            (time) => {

                if (!time) {
                    return null;
                }


                const parts =
                    String(time)
                        .split(":");


                if (
                    parts.length < 2
                ) {

                    return null;

                }


                const hours =
                    Number(
                        parts[0]
                    );


                const minutes =
                    Number(
                        parts[1]
                    );


                if (
                    Number.isNaN(
                        hours
                    ) ||
                    Number.isNaN(
                        minutes
                    )
                ) {

                    return null;

                }


                return (
                    hours * 60 +
                    minutes
                );

            };


        const inMinutes =
            toMinutes(
                checkIn
            );


        const lunchStartMinutes =
            toMinutes(
                lunchStart
            );


        const lunchEndMinutes =
            toMinutes(
                lunchEnd
            );


        const outMinutes =
            toMinutes(
                checkOut
            );


        if (
            inMinutes === null ||
            lunchStartMinutes === null ||
            lunchEndMinutes === null ||
            outMinutes === null
        ) {

            return null;

        }


        if (
            lunchStartMinutes <=
            inMinutes
        ) {

            throw new Error(
                "Lunch start must be after Check-in."
            );

        }


        if (
            lunchEndMinutes <=
            lunchStartMinutes
        ) {

            throw new Error(
                "Lunch end must be after Lunch start."
            );

        }


        if (
            outMinutes <=
            lunchEndMinutes
        ) {

            throw new Error(
                "Check-out must be after Lunch end."
            );

        }


        const totalOfficeMinutes =
            outMinutes -
            inMinutes;


        const lunchMinutes =
            lunchEndMinutes -
            lunchStartMinutes;


        const workingMinutes =
            totalOfficeMinutes -
            lunchMinutes;


        if (
            workingMinutes < 0
        ) {

            throw new Error(
                "Invalid working hours."
            );

        }


        const hours =
            Math.floor(
                workingMinutes / 60
            );


        const minutes =
            workingMinutes % 60;


        return {

            minutes:
                workingMinutes,

            formatted:
                `${hours}h ${minutes}m`

        };

    };


/* =====================================================
   NORMALIZE TASKS
===================================================== */

const normalizeTasks =
    (tasks) => {

        if (
            !Array.isArray(
                tasks
            )
        ) {

            return [];

        }


        return tasks

            .map(
                task =>
                    String(
                        task
                    )
                    .trim()
            )

            .filter(
                task =>
                    task.length > 0
            );

    };


/* =====================================================
   CREATE TIMESHEET
===================================================== */

const createTimesheet =
    async (
        req,
        res
    ) => {

        try {

            const {

                employee,

                employeeCode,

                employeeName,

                date,

                checkIn,

                lunchStart,

                lunchEnd,

                checkOut,

                tasks,

                comments,

                /* OLD FIELDS */

                project,

                projectName,

                totalVideos,

                completedVideos

            } = req.body;


            /* =========================================
               BASIC REQUIRED VALIDATION
            ========================================= */

            if (!date) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Date is required."

                });

            }


            if (!checkIn) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Check-in time is required."

                });

            }


            if (!lunchStart) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Lunch start time is required."

                });

            }


            if (!lunchEnd) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Lunch end time is required."

                });

            }


            if (!checkOut) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "Check-out time is required."

                });

            }


            /* =========================================
               TASKS
            ========================================= */

            const normalizedTasks =
                normalizeTasks(
                    tasks
                );


            if (
                normalizedTasks.length === 0
            ) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        "At least one task is required."

                });

            }


            /* =========================================
               WORKING HOURS
            ========================================= */

            let workingHours;

            try {

                workingHours =
                    calculateWorkingHours(

                        checkIn,

                        lunchStart,

                        lunchEnd,

                        checkOut

                    );

            }

            catch (error) {

                return res.status(
                    400
                ).json({

                    success: false,

                    message:
                        error.message

                });

            }


            /* =========================================
               FIND EMPLOYEE
            ========================================= */

            let employeeId;


            /* -----------------------------------------
               ADMIN
            ----------------------------------------- */

            if (
                isAdmin(req)
            ) {

                if (!employee) {

                    return res.status(
                        400
                    ).json({

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

                    return res.status(
                        400
                    ).json({

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

                    return res.status(
                        404
                    ).json({

                        success: false,

                        message:
                            "Employee not found."

                    });

                }


                employeeId =
                    employeeData._id;

            }


            /* -----------------------------------------
               EMPLOYEE
               IGNORE FRONTEND EMPLOYEE ID
            ----------------------------------------- */

            else {

                const employeeData =
                    await getLoggedInEmployee(
                        req
                    );


                if (!employeeData) {

                    return res.status(
                        403
                    ).json({

                        success: false,

                        message:
                            "Employee profile not found for this login."

                    });

                }


                employeeId =
                    employeeData._id;

            }


            /* =========================================
               OLD VIDEO VALUES
            ========================================= */

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


            /* =========================================
               COMMENTS
            ========================================= */

            const finalComments =
                comments
                    ? String(
                        comments
                    ).trim()

                    : normalizedTasks.join(
                        " | "
                    );


            /* =========================================
               CREATE
            ========================================= */

            const timesheet =
                await Timesheet.create({

                    employee:
                        employeeId,

                    employeeCode:
                        employeeCode
                        ? String(
                            employeeCode
                        ).trim()
                        : "",

                    employeeName:
                        employeeName
                        ? String(
                            employeeName
                        ).trim()
                        : "",

                    date:

                        date,

                    checkIn:

                        String(
                            checkIn
                        ).trim(),

                    lunchStart:

                        String(
                            lunchStart
                        ).trim(),

                    lunchEnd:

                        String(
                            lunchEnd
                        ).trim(),

                    checkOut:

                        String(
                            checkOut
                        ).trim(),

                    workingHours:

                        workingHours,

                    totalTask:

                        normalizedTasks.length,

                    tasks:

                        normalizedTasks,

                    comments:

                        finalComments,

                    /* OLD */

                    project:

                        project
                        ? String(
                            project
                        ).trim()
                        : "",

                    projectName:

                        projectName
                        ? String(
                            projectName
                        ).trim()
                        : "",

                    totalVideos:

                        total,

                    completedVideos:

                        completed,

                    balanceVideos:

                        balance,

                    status:
                        "Pending"

                });


            /* =========================================
               POPULATE
            ========================================= */

            const savedTimesheet =
                await Timesheet

                    .findById(
                        timesheet._id
                    )

                    .populate(
                        "employee",
                        employeePopulate
                    );


            /* =========================================
               RESPONSE
            ========================================= */

            return res.status(
                201
            ).json({

                success: true,

                message:
                    "Timesheet Saved Successfully",

                timesheet:
                    savedTimesheet

            });

        }

        catch (error) {

            console.error(
                "CREATE TIMESHEET ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to create timesheet."

            });

        }

    };


/* =====================================================
   GET TIMESHEETS

   ADMIN    -> ALL
   EMPLOYEE -> OWN
===================================================== */

const getTimesheets =
    async (
        req,
        res
    ) => {

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

                    return res.status(
                        200
                    ).json({

                        success: true,

                        count: 0,

                        timesheets: []

                    });

                }


                query = {

                    employee:
                        employee._id

                };

            }


            const timesheets =
                await Timesheet

                    .find(
                        query
                    )

                    .populate(
                        "employee",
                        employeePopulate
                    )

                    .sort({

                        date: -1,

                        createdAt: -1

                    });


            return res.status(
                200
            ).json({

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


            return res.status(
                500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load timesheets."

            });

        }

    };


/* =====================================================
   GET SINGLE TIMESHEET
===================================================== */

const getTimesheetById =
    async (
        req,
        res
    ) => {

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

                return res.status(
                    404
                ).json({

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

                return res.status(
                    403
                ).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            return res.status(
                200
            ).json({

                success: true,

                timesheet

            });

        }

        catch (error) {

            console.error(
                "GET TIMESHEET ERROR:",
                error
            );


            return res.status(
                500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to load timesheet."

            });

        }

    };


/* =====================================================
   UPDATE TIMESHEET
===================================================== */

const updateTimesheet =
    async (
        req,
        res
    ) => {

        try {

            const {

                employee,

                employeeCode,

                employeeName,

                date,

                checkIn,

                lunchStart,

                lunchEnd,

                checkOut,

                tasks,

                comments,

                status,

                /* OLD */

                project,

                projectName,

                totalVideos,

                completedVideos

            } = req.body;


            const existing =
                await Timesheet.findById(
                    req.params.id
                );


            if (!existing) {

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            /* =========================================
               ACCESS
            ========================================= */

            const allowed =
                await userCanAccessTimesheet(
                    req,
                    existing
                );


            if (!allowed) {

                return res.status(
                    403
                ).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            /* =========================================
               EMPLOYEE CHANGE
            ========================================= */

            if (
                employee !== undefined &&
                isAdmin(req)
            ) {

                if (
                    !mongoose.Types.ObjectId.isValid(
                        employee
                    )
                ) {

                    return res.status(
                        400
                    ).json({

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

                    return res.status(
                        404
                    ).json({

                        success: false,

                        message:
                            "Employee not found."

                    });

                }


                existing.employee =
                    employeeData._id;

            }


            /* =========================================
               EMPLOYEE DISPLAY
            ========================================= */

            if (
                employeeCode !== undefined
            ) {

                existing.employeeCode =
                    String(
                        employeeCode
                    ).trim();

            }


            if (
                employeeName !== undefined
            ) {

                existing.employeeName =
                    String(
                        employeeName
                    ).trim();

            }


            /* =========================================
               DATE
            ========================================= */

            if (
                date !== undefined
            ) {

                existing.date =
                    date;

            }


            /* =========================================
               ATTENDANCE TIMES
            ========================================= */

            if (
                checkIn !== undefined
            ) {

                existing.checkIn =
                    String(
                        checkIn
                    ).trim();

            }


            if (
                lunchStart !== undefined
            ) {

                existing.lunchStart =
                    String(
                        lunchStart
                    ).trim();

            }


            if (
                lunchEnd !== undefined
            ) {

                existing.lunchEnd =
                    String(
                        lunchEnd
                    ).trim();

            }


            if (
                checkOut !== undefined
            ) {

                existing.checkOut =
                    String(
                        checkOut
                    ).trim();

            }


            /* =========================================
               RE-CALCULATE WORKING HOURS
            ========================================= */

            const finalCheckIn =
                existing.checkIn;


            const finalLunchStart =
                existing.lunchStart;


            const finalLunchEnd =
                existing.lunchEnd;


            const finalCheckOut =
                existing.checkOut;


            if (
                finalCheckIn &&
                finalLunchStart &&
                finalLunchEnd &&
                finalCheckOut
            ) {

                try {

                    existing.workingHours =
                        calculateWorkingHours(

                            finalCheckIn,

                            finalLunchStart,

                            finalLunchEnd,

                            finalCheckOut

                        );

                }

                catch (error) {

                    return res.status(
                        400
                    ).json({

                        success: false,

                        message:
                            error.message

                    });

                }

            }


            /* =========================================
               TASKS
            ========================================= */

            if (
                tasks !== undefined
            ) {

                const normalizedTasks =
                    normalizeTasks(
                        tasks
                    );


                if (
                    normalizedTasks.length === 0
                ) {

                    return res.status(
                        400
                    ).json({

                        success: false,

                        message:
                            "At least one task is required."

                    });

                }


                existing.tasks =
                    normalizedTasks;


                existing.totalTask =
                    normalizedTasks.length;


                existing.comments =
                    normalizedTasks.join(
                        " | "
                    );

            }


            /* =========================================
               COMMENTS
            ========================================= */

            if (
                comments !== undefined &&
                tasks === undefined
            ) {

                existing.comments =
                    String(
                        comments
                    ).trim();

            }


            /* =========================================
               OLD PROJECT
            ========================================= */

            if (
                project !== undefined
            ) {

                existing.project =
                    String(
                        project
                    ).trim();

            }


            if (
                projectName !== undefined
            ) {

                existing.projectName =
                    String(
                        projectName
                    ).trim();

            }


            /* =========================================
               OLD VIDEO VALUES
            ========================================= */

            if (
                totalVideos !== undefined
            ) {

                existing.totalVideos =
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

                existing.completedVideos =
                    Math.max(
                        Number(
                            completedVideos
                        ) || 0,
                        0
                    );

            }


            existing.balanceVideos =
                Math.max(

                    Number(
                        existing.totalVideos
                    ) || 0

                    -

                    Number(
                        existing.completedVideos
                    ) || 0,

                    0

                );


            /* =========================================
               STATUS
            ========================================= */

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

                    return res.status(
                        400
                    ).json({

                        success: false,

                        message:
                            "Invalid status."

                    });

                }


                if (
                    !isAdmin(req)
                ) {

                    return res.status(
                        403
                    ).json({

                        success: false,

                        message:
                            "Only Admin can change status."

                    });

                }


                existing.status =
                    status;

            }


            /* =========================================
               SAVE
            ========================================= */

            await existing.save();


            /* =========================================
               POPULATE
            ========================================= */

            const updated =
                await Timesheet

                    .findById(
                        existing._id
                    )

                    .populate(
                        "employee",
                        employeePopulate
                    );


            return res.status(
                200
            ).json({

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


            return res.status(
                500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to update timesheet."

            });

        }

    };


/* =====================================================
   DELETE TIMESHEET
===================================================== */

const deleteTimesheet =
    async (
        req,
        res
    ) => {

        try {

            const timesheet =
                await Timesheet.findById(
                    req.params.id
                );


            if (!timesheet) {

                return res.status(
                    404
                ).json({

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

                return res.status(
                    403
                ).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            await Timesheet.findByIdAndDelete(
                req.params.id
            );


            return res.status(
                200
            ).json({

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


            return res.status(
                500
            ).json({

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
    async (
        req,
        res
    ) => {

        try {

            if (
                !isAdmin(req)
            ) {

                return res.status(
                    403
                ).json({

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

                return res.status(
                    400
                ).json({

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

                return res.status(
                    404
                ).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            return res.status(
                200
            ).json({

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


            return res.status(
                500
            ).json({

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