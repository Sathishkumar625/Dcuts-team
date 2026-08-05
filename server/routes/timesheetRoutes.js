const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    createTimesheet,
    getTimesheets,
    getTimesheetById,
    updateTimesheet,
    deleteTimesheet,
    updateStatus

} = require("../controllers/timesheetController");

/* ==========================================
   CREATE TIMESHEET
========================================== */

router.post(
    "/",
    authMiddleware,
    createTimesheet
);

/* ==========================================
   GET ALL TIMESHEETS
========================================== */

router.get(
    "/",
    authMiddleware,
    getTimesheets
);

/* ==========================================
   GET SINGLE TIMESHEET
========================================== */

router.get(
    "/:id",
    authMiddleware,
    getTimesheetById
);

/* ==========================================
   UPDATE TIMESHEET
========================================== */

router.put(
    "/:id",
    authMiddleware,
    updateTimesheet
);

/* ==========================================
   UPDATE STATUS
========================================== */

router.put(
    "/status/:id",
    authMiddleware,
    updateStatus
);

/* ==========================================
   DELETE TIMESHEET
========================================== */

router.delete(
    "/:id",
    authMiddleware,
    deleteTimesheet
);

module.exports = router;