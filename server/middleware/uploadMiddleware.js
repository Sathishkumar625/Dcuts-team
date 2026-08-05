const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload folders if not exist
const imageDir = "uploads/images";
const videoDir = "uploads/videos";

if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
}

if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir);
}

// Storage
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        if (file.mimetype.startsWith("image")) {

            cb(null, imageDir);

        } else {

            cb(null, videoDir);

        }

    },

    filename: (req, file, cb) => {

        cb(

            null,

            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname)

        );

    }

});

// File Filter
const fileFilter = (req, file, cb) => {

    const allowedImage = [

        "image/jpeg",
        "image/png",
        "image/webp",
        "image/jpg"

    ];

    const allowedVideo = [

        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "video/x-matroska"

    ];

    if (

        allowedImage.includes(file.mimetype) ||

        allowedVideo.includes(file.mimetype)

    ) {

        cb(null, true);

    } else {

        cb(new Error("Invalid File Type"));

    }

};

const upload = multer({

    storage,

    fileFilter,

    limits:{

        fileSize:1024*1024*500

    }

});

module.exports = upload;