const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {

    getSettings,
    updateSettings,
    exportDatabase

} = require("../controllers/settingController");

// GET SETTINGS

router.get(

    "/",

    authMiddleware,

    getSettings

);

// UPDATE SETTINGS

router.put(

    "/",

    authMiddleware,

    updateSettings

);

// EXPORT DATABASE

router.get(

    "/export",

    authMiddleware,

    exportDatabase

);

module.exports = router;