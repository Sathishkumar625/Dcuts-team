const generatePDF = require("../utils/pdfGenerator");

const Employee = require("../models/Employee");
const Attendance = require("../models/Attendance");
const Timesheet = require("../models/Timesheet");
const ProjectReport = require("../models/ProjectReport");





// ===============================
// EMPLOYEE PDF
// ===============================

const employeePDF = async(req,res)=>{


    try{


        const employees =
        await Employee.find();



        generatePDF(
            "Employee_Report",
            employees,
            res
        );


    }
    catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


};







// ===============================
// ATTENDANCE PDF
// ===============================


const attendancePDF = async(req,res)=>{


    try{


        const attendance =
        await Attendance.find()
        .populate("employee");



        generatePDF(
            "Attendance_Report",
            attendance,
            res
        );



    }
    catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


};








// ===============================
// TIMESHEET PDF
// ===============================


const timesheetPDF = async(req,res)=>{


    try{


        const timesheets =
        await Timesheet.find();



        generatePDF(
            "Timesheet_Report",
            timesheets,
            res
        );



    }
    catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


};








// ===============================
// PROJECT REPORT PDF
// ===============================


const projectReportPDF = async(req,res)=>{


    try{


        const reports =
        await ProjectReport.find();



        generatePDF(
            "Project_Report",
            reports,
            res
        );


    }
    catch(error){


        res.status(500).json({

            success:false,
            message:error.message

        });


    }


};








module.exports = {


    employeePDF,

    attendancePDF,

    timesheetPDF,

    projectReportPDF


};