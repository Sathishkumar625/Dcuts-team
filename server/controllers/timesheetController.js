/* =====================================================
   THE D CUTS - TIMESHEET CONTROLLER
   ADMIN / EMPLOYEE ACCESS CONTROL
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
        req.user.role === "admin"
    );

};


/* =====================================================
   FIND EMPLOYEE OF LOGGED-IN USER
===================================================== */

const getLoggedInEmployee = async (req) => {

    if (!req.user || !req.user.email) {
        return null;
    }


    const email =
        req.user.email
            .toLowerCase()
            .trim();


    const employee =
        await Employee.findOne({
            email: email
        });


    return employee;

};


/* =====================================================
   CHECK TIMESHEET ACCESS
===================================================== */

const userCanAccessTimesheet =
    async (req, timesheet) => {

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


        return (
            timesheet.employee &&
            timesheet.employee.toString() ===
            employee._id.toString()
        );

    };


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

                totalVideos,

                completedVideos,

                comments

            } = req.body;


            /* ==========================================
               BASIC VALIDATION
            ========================================== */

            if (
                !project ||
                !date
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Project and Date are required."

                });

            }


            /* ==========================================
               FIND EMPLOYEE
            ========================================== */

            let employeeId;


            /* ------------------------------------------
               ADMIN CAN SELECT ANY EMPLOYEE
            ------------------------------------------ */

            if (isAdmin(req)) {

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


            /* ------------------------------------------
               EMPLOYEE
               IGNORE FRONTEND EMPLOYEE ID
            ------------------------------------------ */

            else {

                const employeeData =
                    await getLoggedInEmployee(req);


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
               VIDEO VALUES
            ========================================== */

            const total =
                Math.max(
                    Number(totalVideos) || 0,
                    0
                );


            const completed =
                Math.max(
                    Number(completedVideos) || 0,
                    0
                );


            const balance =
                Math.max(
                    total - completed,
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
                        String(project).trim(),

                    projectName:
                        String(
                            projectName ||
                            project
                        ).trim(),

                    date,

                    totalVideos:
                        total,

                    completedVideos:
                        completed,

                    balanceVideos:
                        balance,

                    comments:
                        comments
                            ? String(
                                comments
                              ).trim()
                            : "",

                    status:
                        "Pending"

                });


            /* ==========================================
               POPULATE
            ========================================== */

            const savedTimesheet =
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
                    savedTimesheet

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

   ADMIN    -> ALL
   EMPLOYEE -> OWN
===================================================== */

const getTimesheets =
    async (req, res) => {

        try {

            let query = {};


            /* ==========================================
               EMPLOYEE FILTER
            ========================================== */

            if (!isAdmin(req)) {

                const employee =
                    await getLoggedInEmployee(req);


                if (!employee) {

                    return res.status(200).json({

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


            /* ==========================================
               FIND
            ========================================== */

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
                    error.message ||
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


            /* ==========================================
               ACCESS CHECK
            ========================================== */

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
                    error.message ||
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

            const {

                employee,

                project,

                projectName,

                date,

                totalVideos,

                completedVideos,

                comments,

                status

            } = req.body;


            const existing =
                await Timesheet.findById(
                    req.params.id
                );


            if (!existing) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Timesheet not found."

                });

            }


            /* ==========================================
               ACCESS CHECK
            ========================================== */

            const allowed =
                await userCanAccessTimesheet(
                    req,
                    existing
                );


            if (!allowed) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Access Denied."

                });

            }


            /* ==========================================
               EMPLOYEE CHANGE
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


                existing.employee =
                    employeeData._id;

            }


            /* ==========================================
               PROJECT
            ========================================== */

            if (
                project !== undefined
            ) {

                existing.project =
                    String(
                        project
                    ).trim();

            }


            /* ==========================================
               PROJECT NAME
            ========================================== */

            if (
                projectName !== undefined
            ) {

                existing.projectName =
                    String(
                        projectName
                    ).trim();

            }


            /* ==========================================
               DATE
            ========================================== */

            if (
                date !== undefined
            ) {

                existing.date =
                    date;

            }


            /* ==========================================
               VIDEOS
            ========================================== */

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


            /* ==========================================
               BALANCE
            ========================================== */

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


            /* ==========================================
               COMMENTS
            ========================================== */

            if (
                comments !== undefined
            ) {

                existing.comments =
                    String(
                        comments
                    ).trim();

            }


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


                /* Only Admin changes status */

                if (!isAdmin(req)) {

                    return res.status(403).json({

                        success: false,

                        message:
                            "Only Admin can change status."

                    });

                }


                existing.status =
                    status;

            }


            await existing.save();


            const updated =
                await Timesheet
                    .findById(
                        existing._id
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


            /* ==========================================
               DELETE
            ========================================== */

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

            if (!isAdmin(req)) {

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