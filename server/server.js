/* ==========================================
   THE D CUTS TIMESHEET SERVER
========================================== */

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

/* ==========================================
   PORT
========================================== */

const PORT = process.env.PORT || 5000;


/* ==========================================
   MIDDLEWARE
========================================== */

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* ==========================================
   FRONTEND CONNECT
========================================== */

app.use(
    "/client",
    express.static(
        path.join(__dirname, "../client")
    )
);


/* ==========================================
   ROUTES
========================================== */

const authRoutes =
    require("./routes/authRoutes");

const employeeRoutes =
    require("./routes/employeeRoutes");

const clientRoutes =
    require("./routes/clientRoutes");

const timesheetRoutes =
    require("./routes/timesheetRoutes");

const reportRoutes =
    require("./routes/reportRoutes");

const dashboardRoutes =
    require("./routes/dashboardRoutes");

const settingRoutes =
    require("./routes/settingRoutes");


/* ==========================================
   API ROUTES
========================================== */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/clients",
    clientRoutes
);

app.use(
    "/api/timesheets",
    timesheetRoutes
);

app.use(
    "/api/reports",
    reportRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/settings",
    settingRoutes
);


/* ==========================================
   HEALTH CHECK
========================================== */

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "THE D CUTS Server Running",

            time:
                new Date()

        });

    }
);


/* ==========================================
   HOME
   OPEN LOGIN PAGE
========================================== */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "../client/login.html"
            )
        );

    }
);


/* ==========================================
   API ERROR
========================================== */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API Not Found"

        });

    }
);


/* ==========================================
   ERROR HANDLER
========================================== */

app.use(
    (err, req, res, next) => {

        console.error(err);

        res.status(500).json({

            success: false,

            message:
                "Server Error"

        });

    }
);


/* ==========================================
   DATABASE
========================================== */

const MONGO_URI =
    process.env.MONGO_URI;


if (!MONGO_URI) {

    console.log(
        "Mongo URI Missing"
    );

    process.exit(1);

}


console.log(
    "Mongo URL:",
    MONGO_URI
);


/* ==========================================
   MONGODB CONNECTION
========================================== */

mongoose
    .connect(MONGO_URI)

    .then(() => {

        console.log(
            "✅ MongoDB Connected"
        );


        /* ==========================================
           START SERVER
        ========================================== */

        app.listen(
            PORT,
            () => {

                console.log(
                    `🚀 Server running on port ${PORT}`
                );

                console.log(
                    `🌐 http://localhost:${PORT}`
                );

            }
        );

    })


    .catch((error) => {

        console.log(
            "❌ MongoDB Error"
        );

        console.log(
            error.message
        );

    });