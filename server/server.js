// ===============================
// IMPORT PACKAGES
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");


// ===============================
// ENV CONFIG
// ===============================

dotenv.config();


// ===============================
// APP CREATE
// ===============================

const app = express();


// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// DATABASE CONNECTION
// ===============================

console.log("Mongo URL:", process.env.MONGO_URI);


mongoose.connect(process.env.MONGO_URI)

.then(() => {

    console.log("✅ MongoDB Connected");

})

.catch((error)=>{

    console.log(
        "❌ MongoDB Error:",
        error.message
    );

});



// ===============================
// ROUTES IMPORT
// ===============================


const authRoutes = require("./routes/authRoutes");

const employeeRoutes = require("./routes/employeeRoutes");

const clientRoutes = require("./routes/clientRoutes");

const timesheetRoutes = require("./routes/timesheetRoutes");

const dailyReportRoutes =require("./routes/dailyReportRoutes");

const projectReportRoutes =require("./routes/projectReportRoutes");

const reportRoutes =require("./routes/reportRoutes");

const dashboardRoutes =require("./routes/dashboardRoutes");

const pdfRoutes =require("./routes/pdfRoutes");

const settingRoutes = require("./routes/settingRoutes");

const fileRoutes = require("./routes/fileRoutes");




// ===============================
// ROUTES USE
// ===============================


app.use(
    "/api/auth",
    authRoutes
);
app.use("/api/settings", settingRoutes);


app.use(
    "/api/employees",
    employeeRoutes
);
app.use("/api/files", fileRoutes);
app.use("/uploads", express.static("uploads"));


app.use(
    "/api/clients",
    clientRoutes
);


app.use(
    "/api/projects",
    projectRoutes
);


app.use(
    "/api/timesheets",
    timesheetRoutes
);


app.use(
    "/api/attendance",
    attendanceRoutes
);


app.use(
    "/api/invoices",
    invoiceRoutes
);
app.use(
"/api/dailyreports",
dailyReportRoutes
);
app.use(
"/api/projectreports",
projectReportRoutes
);
app.use(
"/api/reports",
require("./routes/reportRoutes")
);
app.use(
"/api/dashboard",
require("./routes/dashboardRoutes")
);
app.use(
    "/api/pdf",
    pdfRoutes
);

// ===============================
// TEST API
// ===============================


app.get("/", (req,res)=>{

    res.json({

        message:"THE D CUTS API Running Successfully"

    });

});



// ===============================
// SERVER START
// ===============================


const PORT = process.env.PORT || 5000;


app.listen(PORT,()=>{

    console.log(
        `✅ Server running on http://localhost:${PORT}`
    );

});