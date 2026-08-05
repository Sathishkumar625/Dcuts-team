const express = require("express");

const router = express.Router();


const authMiddleware =
require("../middleware/authMiddleware");



const {

    employeePDF,

    attendancePDF,

    timesheetPDF,

    projectReportPDF

}
=
require("../controllers/pdfController");





// ===============================
// EMPLOYEE PDF
// ===============================

router.get(

    "/employees",

    authMiddleware,

    employeePDF

);






// ===============================
// ATTENDANCE PDF
// ===============================

router.get(

    "/attendance",

    authMiddleware,

    attendancePDF

);






// ===============================
// TIMESHEET PDF
// ===============================

router.get(

    "/timesheet",

    authMiddleware,

    timesheetPDF

);







// ===============================
// PROJECT REPORT PDF
// ===============================

router.get(

    "/project-report",

    authMiddleware,

    projectReportPDF

);







module.exports = router;