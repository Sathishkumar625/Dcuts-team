const Setting = require("../models/Setting");

// ================================
// GET SETTINGS
// ================================

const getSettings = async (req, res) => {

    try {

        let setting = await Setting.findOne();

        if (!setting) {

            setting = await Setting.create({
                companyName: "THE D CUTS"
            });

        }

        res.json({

            success: true,
            setting

        });

    }

    catch (error) {

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

        setting.adminName = req.body.adminName;
        setting.adminEmail = req.body.adminEmail;
        setting.adminPhone = req.body.adminPhone;

        setting.companyName = req.body.companyName;
        setting.companyAddress = req.body.companyAddress;
        setting.gst = req.body.gst;

        setting.theme = req.body.theme;

        await setting.save();

        res.json({

            success: true,
            message: "Settings Updated Successfully",
            setting

        });

    }

    catch (error) {

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
        message: "Export Module Coming Soon"

    });

};

module.exports = {

    getSettings,
    updateSettings,
    exportDatabase

};