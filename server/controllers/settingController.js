const Setting = require("../models/Setting");

// ================================
// GET SETTINGS
// ================================

const getSettings = async (req, res) => {

    try {

        let setting = await Setting.findOne();

        if (!setting) {

            setting = await Setting.create({
                adminName: "",
                adminEmail: "",
                adminPhone: "",
                companyName: "THE D CUTS",
                companyPhone: "",
                companyEmail: "",
                companyAddress: "",
                gst: "",
                theme: "dark"
            });

        }

        res.json({

            success: true,
            setting

        });

    }

    catch (error) {

        console.error(
            "GET SETTINGS ERROR:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ================================
// UPDATE SETTINGS
// ================================

const updateSettings = async (req, res) => {

    try {

        let setting = await Setting.findOne();

        if (!setting) {

            setting = new Setting();

        }


        // ============================
        // ADMIN
        // ============================

        if (
            req.body.adminName !== undefined
        ) {

            setting.adminName =
                req.body.adminName;

        }


        if (
            req.body.adminEmail !== undefined
        ) {

            setting.adminEmail =
                req.body.adminEmail;

        }


        if (
            req.body.adminPhone !== undefined
        ) {

            setting.adminPhone =
                req.body.adminPhone;

        }


        // ============================
        // COMPANY
        // ============================

        if (
            req.body.companyName !== undefined
        ) {

            setting.companyName =
                req.body.companyName;

        }


        if (
            req.body.companyPhone !== undefined
        ) {

            setting.companyPhone =
                req.body.companyPhone;

        }


        if (
            req.body.companyEmail !== undefined
        ) {

            setting.companyEmail =
                req.body.companyEmail;

        }


        if (
            req.body.companyAddress !== undefined
        ) {

            setting.companyAddress =
                req.body.companyAddress;

        }


        if (
            req.body.gst !== undefined
        ) {

            setting.gst =
                req.body.gst;

        }


        // ============================
        // THEME
        // ============================

        if (
            req.body.theme !== undefined
        ) {

            if (
                req.body.theme !== "dark" &&
                req.body.theme !== "light"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Theme must be dark or light"

                });

            }


            setting.theme =
                req.body.theme;

        }


        await setting.save();


        res.json({

            success: true,

            message:
                "Settings Updated Successfully",

            setting

        });

    }

    catch (error) {

        console.error(
            "UPDATE SETTINGS ERROR:",
            error
        );

        res.status(500).json({

            success: false,
            message: error.message

        });

    }

};


// ================================
// EXPORT DATABASE
// ================================

const exportDatabase = async (req, res) => {

    res.json({

        success: true,

        message:
            "Export Module Coming Soon"

    });

};


module.exports = {

    getSettings,
    updateSettings,
    exportDatabase

};