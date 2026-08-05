const Timesheet = require("../models/Timesheet");

/* ==========================================
   GET REPORTS
========================================== */

const getReports = async (req, res) => {

    try {

        const reports = await Timesheet.find()

            .populate("employee")
            .populate("client")
            .populate("project")

            .sort({
                date: -1
            });

        res.status(200).json({

            success: true,

            reports

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

    getReports

};