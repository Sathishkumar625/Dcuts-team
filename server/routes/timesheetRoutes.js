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
} = require("../middleware/authMiddleware");


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
} = require("../controllers/timesheetController");


/* =====================================================
   CREATE TIMESHEET
=====================================================

   ADMIN:
   - Can create timesheet

   EMPLOYEE:
   - Can create own timesheet

   Actual employee ownership should be checked
   inside timesheetController using req.user.id.
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
   - Can see ALL employee timesheets

   EMPLOYEE:
   - Controller must return ONLY that employee's
     own timesheets.
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
   - Can view ONLY own timesheet
===================================================== */

router.get(
    "/:id",
    authMiddleware,
    authenticatedUser,
    getTimesheetById
);


/* =====================================================
   UPDATE TIMESHEET
=====================================================

   ADMIN:
   - Can update any employee timesheet

   EMPLOYEE:
   - Can update ONLY own timesheet
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
   - Controller should verify ownership
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
   - Can delete any timesheet

   EMPLOYEE:
   - Controller should allow delete only if
     the timesheet belongs to that employee.
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