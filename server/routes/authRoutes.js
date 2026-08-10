const express = require("express");

const router = express.Router();

const {
    register,
    login,
    googleLogin
} = require("../controllers/authController");


/* =====================================================
   REGISTER
===================================================== */

router.post(
    "/register",
    register
);


/* =====================================================
   NORMAL LOGIN
===================================================== */

router.post(
    "/login",
    login
);


/* =====================================================
   GOOGLE LOGIN
===================================================== */

router.post(
    "/google",
    googleLogin
);


module.exports = router;