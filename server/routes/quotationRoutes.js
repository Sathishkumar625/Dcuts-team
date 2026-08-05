const express = require("express");

const router = express.Router();

const {

    getQuotations,
    getQuotationById,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertToInvoice

} = require("../controllers/quotationController");

router.get("/", getQuotations);

router.get("/:id", getQuotationById);

router.post("/", addQuotation);

router.put("/:id", updateQuotation);

router.delete("/:id", deleteQuotation);

router.post("/:id/convert", convertToInvoice);

module.exports = router;