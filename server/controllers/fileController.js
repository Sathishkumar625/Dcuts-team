const File = require("../models/File");
const fs = require("fs");

// ========================================
// UPLOAD FILES
// ========================================

const uploadFiles = async (req, res) => {

    try {

        const { employee, client, project } = req.body;

        const files = [];

        // Images
        if (req.files && req.files.images) {

            req.files.images.forEach(image => {

                files.push({

                    employee,
                    client,
                    project,

                    fileName: image.originalname,

                    fileType: "image",

                    filePath: image.path.replace(/\\/g, "/"),

                    fileSize: image.size

                });

            });

        }

        // Video
        if (req.files && req.files.video) {

            req.files.video.forEach(video => {

                files.push({

                    employee,
                    client,
                    project,

                    fileName: video.originalname,

                    fileType: "video",

                    filePath: video.path.replace(/\\/g, "/"),

                    fileSize: video.size

                });

            });

        }

        await File.insertMany(files);

        res.status(201).json({

            success: true,

            message: "Files Uploaded Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ========================================
// GET ALL FILES
// ========================================

const getFiles = async (req, res) => {

    try {

        const files = await File.find()

            .populate("employee", "name")

            .populate("client", "clientName")

            .sort({ createdAt: -1 });

        res.json({

            success: true,

            files

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

// ========================================
// DELETE FILE
// ========================================

const deleteFile = async (req, res) => {

    try {

        const file = await File.findById(req.params.id);

        if (!file) {

            return res.status(404).json({

                success: false,

                message: "File Not Found"

            });

        }

        // Delete physical file
        if (fs.existsSync(file.filePath)) {

            fs.unlinkSync(file.filePath);

        }

        await File.findByIdAndDelete(req.params.id);

        res.json({

            success: true,

            message: "File Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {

    uploadFiles,

    getFiles,

    deleteFile

};