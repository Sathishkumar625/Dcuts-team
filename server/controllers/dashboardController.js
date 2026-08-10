const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Timesheet = require("../models/Timesheet");

/* ==========================================
   THE D CUTS DASHBOARD
========================================== */

const getDashboard = async (req, res) => {

    try {

        /* ===============================
           EMPLOYEES
        =============================== */

        const totalEmployees =
            await Employee.countDocuments();


        /* ===============================
           CLIENTS / PROJECTS
           
           Project.js இல்லாததால்
           Clients-ஐ project count-க்கு
           temporary source ஆக பயன்படுத்துகிறோம்.
        =============================== */

        const totalClients =
            await Client.countDocuments();

        const totalProjects =
            totalClients;


        /* ===============================
           TIMESHEETS
        =============================== */

        const totalTimesheets =
            await Timesheet.countDocuments();


        /* ===============================
           TIMESHEET STATUS
        =============================== */

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


        /* ===============================
           TOTAL WORKING HOURS
        =============================== */

        const hourResult =
            await Timesheet.aggregate([

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


        /* ===============================
           TODAY
        =============================== */

        const today =
            new Date()
                .toISOString()
                .split("T")[0];


        /* ===============================
           TODAY TIMESHEETS
        =============================== */

        const todayTimesheets =
            await Timesheet.countDocuments({
                date: today
            });


        /* ===============================
           RESPONSE
        =============================== */

        res.status(200).json({

            success: true,

            dashboard: {

                totalEmployees,

                totalClients,

                totalProjects,

                totalTimesheets,

                todayTimesheets,

                approvedTimesheets,

                pendingTimesheets,

                rejectedTimesheets,

                presentToday: 0,

                totalHours

            }

        });

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


/* ==========================================
   EXPORT
========================================== */

module.exports = {

    getDashboard

};