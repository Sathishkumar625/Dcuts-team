const express = require("express");

const router = express.Router();


/* =====================================================
   MIDDLEWARE
===================================================== */

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    adminOnly,
    authenticatedUser
} =
    require("../middleware/authMiddleware");


/* =====================================================
   CONTROLLER
===================================================== */

const {
    createTimesheet,
    getTimesheets,

    /*
     * IMPORTANT:
     * Controller function is named getTimesheet.
     * Do NOT use getTimesheetById here.
     */
    getTimesheet,

    updateTimesheet,
    deleteTimesheet,
    updateStatus

} =
    require("../controllers/timesheetController");


/* =====================================================
   CREATE TIMESHEET
=====================================================

   ADMIN:
   - Can create timesheet

   EMPLOYEE:
   - Can create own timesheet

   Ownership is checked inside controller.
===================================================== */

router.post(
    "/",
    authMiddleware,
    authenticatedUser,
    createTimesheet
);


/* =====================================================
   GET ALL TIMESHEETS
=====================================================

   ADMIN:
   - Can see all employee timesheets

   EMPLOYEE:
   - Can see only own timesheets
===================================================== */

router.get(
    "/",
    authMiddleware,
    authenticatedUser,
    getTimesheets
);


/* =====================================================
   GET SINGLE TIMESHEET
=====================================================

   ADMIN:
   - Can view any timesheet

   EMPLOYEE:
   - Can view only own timesheet

   IMPORTANT:
   - Controller function is getTimesheet
===================================================== */

router.get(
    "/:id",
    authMiddleware,
    authenticatedUser,
    getTimesheet
);


/* =====================================================
   UPDATE TIMESHEET
=====================================================

   ADMIN:
   - Can update any employee timesheet

   EMPLOYEE:
   - Can update only own timesheet
===================================================== */

router.put(
    "/:id",
    authMiddleware,
    authenticatedUser,
    updateTimesheet
);


/* =====================================================
   UPDATE STATUS
=====================================================

   ADMIN:
   - Can update status

   EMPLOYEE:
   - Ownership checked inside controller
===================================================== */

router.put(
    "/status/:id",
    authMiddleware,
    authenticatedUser,
    updateStatus
);


/* =====================================================
   DELETE TIMESHEET
=====================================================

   ADMIN:
   - Can delete any employee timesheet

   EMPLOYEE:
   - Can delete only own timesheet
===================================================== */

router.delete(
    "/:id",
    authMiddleware,
    authenticatedUser,
    deleteTimesheet
);


/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;