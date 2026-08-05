const express = require("express");

const router = express.Router();


const authMiddleware =
require("../middleware/authMiddleware");



const {

createDailyReport,
getDailyReports,
getEmployeeReports,
deleteDailyReport

}
=
require("../controllers/dailyReportController");





router.post(
"/",
authMiddleware,
createDailyReport
);




router.get(
"/",
authMiddleware,
getDailyReports
);




router.get(
"/employee/:id",
authMiddleware,
getEmployeeReports
);




router.delete(
"/:id",
authMiddleware,
deleteDailyReport
);




module.exports = router;