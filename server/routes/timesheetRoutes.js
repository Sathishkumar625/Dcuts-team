const express = require("express");

const router = express.Router();


/* =====================================================
   MIDDLEWARE
===================================================== */

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    authenticatedUser
} =
    require("../middleware/authMiddleware");


/* =====================================================
   CONTROLLER
===================================================== */

const {
    createTimesheet,
    getTimesheets,
    getTimesheet,
    updateTimesheet,
    deleteTimesheet
} =
    require("../controllers/timesheetController");


/* =====================================================
   CREATE TIMESHEET
===================================================== */

router.post(
    "/",
    authMiddleware,
    authenticatedUser,
    createTimesheet
);


/* =====================================================
   GET ALL TIMESHEETS
===================================================== */

router.get(
    "/",
    authMiddleware,
    authenticatedUser,
    getTimesheets
);


/* =====================================================
   GET SINGLE TIMESHEET
===================================================== */

router.get(
    "/:id",
    authMiddleware,
    authenticatedUser,
    getTimesheet
);


/* =====================================================
   UPDATE TIMESHEET
===================================================== */

router.put(
    "/:id",
    authMiddleware,
    authenticatedUser,
    updateTimesheet
);


/* =====================================================
   DELETE TIMESHEET
===================================================== */

router.delete(
    "/:id",
    authMiddleware,
    authenticatedUser,
    deleteTimesheet
);


/* =====================================================
   EXPORT
===================================================== */

module.exports = router;