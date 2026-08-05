const Timesheet = require("../models/Timesheet");
const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Project = require("../models/Project");

/* ==========================================
   CREATE TIMESHEET
========================================== */

const createTimesheet = async (req, res) => {

    try {

        const {

            employee,
            client,
            project,
            date,
            taskDetails,
            hoursWorked,
            comments

        } = req.body;

        // Validation

        if (
            !employee ||
            !client ||
            !project ||
            !date ||
            !taskDetails ||
            !hoursWorked
        ) {

            return res.status(400).json({

                success: false,
                message: "Please fill all required fields."

            });

        }

        // Check Employee

        const employeeData = await Employee.findById(employee);

        if (!employeeData) {

            return res.status(404).json({

                success: false,
                message: "Employee not found"

            });

        }

        // Check Client

        const clientData = await Client.findById(client);

        if (!clientData) {

            return res.status(404).json({

                success: false,
                message: "Client not found"

            });

        }

        // Check Project

        const projectData = await Project.findById(project);

        if (!projectData) {

            return res.status(404).json({

                success: false,
                message: "Project not found"

            });

        }

        // Create Timesheet

        const timesheet = await Timesheet.create({

            employee,

            client,

            project,

            projectName: projectData.projectName,

            date,

            taskDetails,

            hoursWorked,

            comments,

            status: "Pending"

        });

        res.status(201).json({

            success: true,

            message: "Timesheet Saved Successfully",

            timesheet

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET ALL TIMESHEETS
========================================== */

const getTimesheets = async (req, res) => {

    try {

        const timesheets = await Timesheet.find()

            .populate("employee")

            .populate("client")

            .populate("project")

            .sort({

                createdAt: -1

            });

        res.json({

            success: true,

            timesheets

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   GET SINGLE TIMESHEET
========================================== */

const getTimesheetById = async (req, res) => {

    try {

        const timesheet = await Timesheet.findById(req.params.id)

            .populate("employee")

            .populate("client")

            .populate("project");

        if (!timesheet) {

            return res.status(404).json({

                success: false,

                message: "Timesheet not found"

            });

        }

        res.json({

            success: true,

            timesheet

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UPDATE TIMESHEET
========================================== */

const updateTimesheet = async (req, res) => {

    try {

        const updated = await Timesheet.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new: true

            }

        );

        res.json({

            success: true,

            message: "Timesheet Updated Successfully",

            updated

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   DELETE TIMESHEET
========================================== */

const deleteTimesheet = async (req, res) => {

    try {

        await Timesheet.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "Timesheet Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

/* ==========================================
   UPDATE STATUS
========================================== */

const updateStatus = async (req, res) => {

    try {

        const timesheet = await Timesheet.findByIdAndUpdate(

            req.params.id,

            {

                status: req.body.status

            },

            {

                new: true

            }

        );

        res.json({

            success: true,

            message: "Status Updated",

            timesheet

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    createTimesheet,

    getTimesheets,

    getTimesheetById,

    updateTimesheet,

    deleteTimesheet,

    updateStatus

};