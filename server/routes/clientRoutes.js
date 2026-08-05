const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");


const {
    

    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient

} = require("../controllers/clientController");



// ==========================
// CREATE CLIENT
// ==========================

router.post(
    "/",
    authMiddleware,
    createClient
);



// ==========================
// GET ALL CLIENTS
// ==========================

router.get(
    "/",
    authMiddleware,
    getClients
);



// ==========================
// GET SINGLE CLIENT
// ==========================

router.get(
    "/:id",
    authMiddleware,
    getClientById
);



// ==========================
// UPDATE CLIENT
// ==========================

router.put(
    "/:id",
    authMiddleware,
    updateClient
);



// ==========================
// DELETE CLIENT
// ==========================

router.delete(
    "/:id",
    authMiddleware,
    deleteClient
);

module.exports = router;