const express = require("express");

const router = express.Router();

const authMiddleware =
require("../middleware/authMiddleware");

const upload =
require("../middleware/uploadMiddleware");

const {

    uploadFiles,
    getFiles,
    deleteFile

} = require("../controllers/fileController");

// =============================
// UPLOAD FILES
// =============================

router.post(

    "/",

    authMiddleware,

    upload.fields([

        {

            name: "images",

            maxCount: 20

        },

        {

            name: "video",

            maxCount: 1

        }

    ]),

    uploadFiles

);

// =============================
// GET ALL FILES
// =============================

router.get(

    "/",

    authMiddleware,

    getFiles

);

// =============================
// DELETE FILE
// =============================

router.delete(

    "/:id",

    authMiddleware,

    deleteFile

);

module.exports = router;