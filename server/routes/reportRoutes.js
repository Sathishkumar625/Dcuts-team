const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const {
    getReports
}
=
require("../controllers/reportController");

router.get(
    "/",
    authMiddleware,
    getReports
);

module.exports = router;