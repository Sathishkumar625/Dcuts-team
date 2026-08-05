const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Project = require("../models/Project");
const Timesheet = require("../models/Timesheet");
const Attendance = require("../models/Attendance");

/* ==========================================
   DASHBOARD
========================================== */

const getDashboard = async (req, res) => {

    try {

        const totalEmployees = await Employee.countDocuments();

        const totalClients = await Client.countDocuments();

        const totalProjects = await Project.countDocuments();

        const totalTimesheets = await Timesheet.countDocuments();

        const approvedTimesheets =
            await Timesheet.countDocuments({
                status: "Approved"
            });

        const pendingTimesheets =
            await Timesheet.countDocuments({
                status: "Pending"
            });

        const rejectedTimesheets =
            await Timesheet.countDocuments({
                status: "Rejected"
            });

        const today = new Date().toISOString().split("T")[0];

        const presentToday =
            await Attendance.countDocuments({
                date: today,
                status: "Present"
            });

        // Total Working Hours

        const hourResult = await Timesheet.aggregate([
            {
                $group: {
                    _id: null,
                    totalHours: {
                        $sum: "$hoursWorked"
                    }
                }
            }
        ]);

        const totalHours =
            hourResult.length > 0
                ? hourResult[0].totalHours
                : 0;

        res.status(200).json({

            success: true,

            dashboard: {

                totalEmployees,

                totalClients,

                totalProjects,

                totalTimesheets,

                approvedTimesheets,

                pendingTimesheets,

                rejectedTimesheets,

                presentToday,

                totalHours

            }

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

    getDashboard

};