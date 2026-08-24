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
    getTimesheetById,
    updateTimesheet,
    deleteTimesheet,
    updateStatus
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
   ADMIN    -> ALL
   EMPLOYEE -> OWN
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
    getTimesheetById
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
   UPDATE STATUS
   ADMIN ONLY
===================================================== */

router.patch(
    "/:id/status",
    authMiddleware,
    authenticatedUser,
    updateStatus
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