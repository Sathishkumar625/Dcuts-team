const express = require("express");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");


const {

    generateTimesheetPDF,

    generateEmployeePDF,

    generateClientPDF

} = require("../controllers/pdfController");


/* ==========================================
   TIMESHEET PDF
========================================== */

router.get(
    "/timesheets",
    authMiddleware,
    generateTimesheetPDF
);


/* ==========================================
   EMPLOYEE PDF
========================================== */

router.get(
    "/employees",
    authMiddleware,
    generateEmployeePDF
);


/* ==========================================
   CLIENT PDF
========================================== */

router.get(
    "/clients",
    authMiddleware,
    generateClientPDF
);


/* ==========================================
   EXPORT
========================================== */

module.exports = router;