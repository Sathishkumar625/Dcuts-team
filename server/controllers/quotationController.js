const Quotation = require("../models/Quotation");
const Invoice = require("../models/Invoice");

// Generate Quotation Number
const generateQuotationNo = async () => {
    const count = await Quotation.countDocuments();
    const year = new Date().getFullYear();
    return `QT-${year}-${String(count + 1).padStart(5, "0")}`;
};

// Get All Quotations
exports.getQuotations = async (req, res) => {
    try {

        const quotations = await Quotation.find()
            .populate("clientId")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: quotations
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
};

// Get Single Quotation
exports.getQuotationById = async (req, res) => {

    try {

        const quotation = await Quotation.findById(req.params.id)
            .populate("clientId");

        if (!quotation) {

            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });

        }

        res.json({
            success: true,
            data: quotation
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Add Quotation
exports.addQuotation = async (req, res) => {

    try {

        req.body.quotationNo = await generateQuotationNo();

        const quotation = await Quotation.create(req.body);

        res.status(201).json({
            success: true,
            data: quotation
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

// Update Quotation
exports.updateQuotation = async (req, res) => {

    try {

        const quotation = await Quotation.findByIdAndUpdate(

            req.params.id,

            req.body,

            {
                new: true,
                runValidators: true
            }

        );

        res.json({
            success: true,
            data: quotation
        });

    } catch (err) {

        res.status(400).json({
            success: false,
            message: err.message
        });

    }

};

// Delete Quotation
exports.deleteQuotation = async (req, res) => {

    try {

        await Quotation.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: "Quotation Deleted Successfully"
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

};

// Convert Quotation to Invoice
exports.convertToInvoice = async (req, res) => {

    try {

        const quotation = await Quotation.findById(req.params.id);

        if (!quotation) {

            return res.status(404).json({
                success: false,
                message: "Quotation not found"
            });

        }

        const invoice = await Invoice.create({

            clientId: quotation.clientId,

            invoiceNo:
                `INV-${Date.now()}`,

            invoiceDate: new Date(),

            dueDate: quotation.validTill,

            services: quotation.services,

            subtotal: quotation.subtotal,

            discount: quotation.discount,

            tax: quotation.tax,

            totalAmount: quotation.grandTotal,

            advancePaid: 0,

            balanceAmount: quotation.grandTotal,

            remarks: quotation.remarks

        });

        res.json({

            success: true,

            message: "Invoice Created Successfully",

            data: invoice

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

};