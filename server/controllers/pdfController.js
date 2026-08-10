const PDFDocument = require("pdfkit");

const Employee = require("../models/Employee");
const Client = require("../models/Client");
const Timesheet = require("../models/Timesheet");

/* ==========================================
   THE D CUTS PDF CONTROLLER
========================================== */


/* ==========================================
   GENERATE TIMESHEET PDF
========================================== */

const generateTimesheetPDF = async (req, res) => {

    try {

        const timesheets =
            await Timesheet.find()
                .populate("employee")
                .populate("client")
                .sort({
                    date: -1,
                    createdAt: -1
                });


        const doc =
            new PDFDocument({
                margin: 50
            });


        /* ===============================
           RESPONSE HEADERS
        =============================== */

        res.setHeader(
            "Content-Type",
            "application/pdf"
        );

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=dcuts-timesheet-report.pdf"
        );


        /* ===============================
           PIPE PDF
        =============================== */

        doc.pipe(res);


        /* ===============================
           TITLE
        =============================== */

        doc
            .fontSize(22)
            .text(
                "THE D CUTS",
                {
                    align: "center"
                }
            );


        doc
            .moveDown(0.5)
            .fontSize(16)
            .text(
                "Timesheet Report",
                {
                    align: "center"
                }
            );


        doc.moveDown();


        doc
            .fontSize(10)
            .text(
                `Generated: ${new Date().toLocaleString()}`
            );


        doc.moveDown();


        /* ===============================
           NO DATA
        =============================== */

        if (timesheets.length === 0) {

            doc
                .moveDown()
                .fontSize(13)
                .text(
                    "No timesheet records found."
                );

            doc.end();

            return;

        }


        /* ===============================
           TIMESHEET DATA
        =============================== */

        timesheets.forEach(
            (item, index) => {

                const employeeName =
                    item.employee?.name ||
                    item.employeeName ||
                    "Unknown Employee";


                const clientName =
                    item.client?.clientName ||
                    item.client?.companyName ||
                    item.clientName ||
                    "Unknown Client";


                doc
                    .fontSize(13)
                    .text(
                        `${index + 1}. ${employeeName}`
                    );


                doc
                    .fontSize(10)
                    .text(
                        `Date: ${item.date || "-"}`
                    );


                doc
                    .text(
                        `Client: ${clientName}`
                    );


                doc
                    .text(
                        `Project: ${item.projectName || item.project || "-"}`
                    );


                doc
                    .text(
                        `Task: ${item.taskDetails || item.task || "-"}`
                    );


                doc
                    .text(
                        `Hours: ${item.hoursWorked || item.hours || 0}`
                    );


                doc
                    .text(
                        `Comments: ${item.comments || "-"}`
                    );


                doc
                    .text(
                        `Status: ${item.status || "Pending"}`
                    );


                doc.moveDown();


                /* separator */

                doc
                    .moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .stroke();


                doc.moveDown();


                /* New page if required */

                if (doc.y > 700) {

                    doc.addPage();

                }

            }
        );


        /* ===============================
           FOOTER
        =============================== */

        doc
            .moveDown()
            .fontSize(9)
            .text(
                "THE D CUTS - Timesheet Management System",
                {
                    align: "center"
                }
            );


        /* ===============================
           END PDF
        =============================== */

        doc.end();

    }

    catch (error) {

        console.error(
            "PDF Generation Error:",
            error
        );


        if (!res.headersSent) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

};


/* ==========================================
   EMPLOYEE PDF
========================================== */

const generateEmployeePDF = async (req, res) => {

    try {

        const employees =
            await Employee.find()
                .sort({
                    name: 1
                });


        const doc =
            new PDFDocument({
                margin: 50
            });


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=dcuts-employees.pdf"
        );


        doc.pipe(res);


        doc
            .fontSize(22)
            .text(
                "THE D CUTS",
                {
                    align: "center"
                }
            );


        doc
            .moveDown()
            .fontSize(16)
            .text(
                "Employee Report",
                {
                    align: "center"
                }
            );


        doc.moveDown();


        if (employees.length === 0) {

            doc
                .fontSize(12)
                .text(
                    "No employees found."
                );

            doc.end();

            return;

        }


        employees.forEach(
            (employee, index) => {

                doc
                    .fontSize(13)
                    .text(
                        `${index + 1}. ${employee.name}`
                    );


                doc
                    .fontSize(10)
                    .text(
                        `Employee ID: ${employee.employeeId || "-"}`
                    );


                doc
                    .text(
                        `Email: ${employee.email || "-"}`
                    );


                doc
                    .text(
                        `Phone: ${employee.phone || "-"}`
                    );


                doc
                    .text(
                        `Department: ${employee.department || "-"}`
                    );


                doc
                    .text(
                        `Designation: ${employee.designation || "-"}`
                    );


                doc
                    .text(
                        `Role: ${employee.role || "Employee"}`
                    );


                doc
                    .text(
                        `Status: ${employee.status || "Active"}`
                    );


                doc.moveDown();


                doc
                    .moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .stroke();


                doc.moveDown();


                if (doc.y > 700) {

                    doc.addPage();

                }

            }
        );


        doc.end();

    }

    catch (error) {

        console.error(
            "Employee PDF Error:",
            error
        );


        if (!res.headersSent) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

};


/* ==========================================
   CLIENT PDF
========================================== */

const generateClientPDF = async (req, res) => {

    try {

        const clients =
            await Client.find()
                .sort({
                    clientName: 1
                });


        const doc =
            new PDFDocument({
                margin: 50
            });


        res.setHeader(
            "Content-Type",
            "application/pdf"
        );


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=dcuts-clients.pdf"
        );


        doc.pipe(res);


        doc
            .fontSize(22)
            .text(
                "THE D CUTS",
                {
                    align: "center"
                }
            );


        doc
            .moveDown()
            .fontSize(16)
            .text(
                "Client Report",
                {
                    align: "center"
                }
            );


        doc.moveDown();


        if (clients.length === 0) {

            doc
                .fontSize(12)
                .text(
                    "No clients found."
                );

            doc.end();

            return;

        }


        clients.forEach(
            (client, index) => {

                doc
                    .fontSize(13)
                    .text(
                        `${index + 1}. ${client.clientName}`
                    );


                doc
                    .fontSize(10)
                    .text(
                        `Company: ${client.companyName || "-"}`
                    );


                doc
                    .text(
                        `Phone: ${client.phone || "-"}`
                    );


                doc
                    .text(
                        `Email: ${client.email || "-"}`
                    );


                doc
                    .text(
                        `Address: ${client.address || "-"}`
                    );


                doc
                    .text(
                        `GST: ${client.gst || "-"}`
                    );


                doc
                    .text(
                        `Status: ${client.status || "Active"}`
                    );


                doc.moveDown();


                doc
                    .moveTo(50, doc.y)
                    .lineTo(545, doc.y)
                    .stroke();


                doc.moveDown();


                if (doc.y > 700) {

                    doc.addPage();

                }

            }
        );


        doc.end();

    }

    catch (error) {

        console.error(
            "Client PDF Error:",
            error
        );


        if (!res.headersSent) {

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }

};


/* ==========================================
   EXPORT
========================================== */

module.exports = {

    generateTimesheetPDF,

    generateEmployeePDF,

    generateClientPDF

};