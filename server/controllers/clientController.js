const Client = require("../models/Client");


// ===================================
// CREATE CLIENT
// ===================================

const createClient = async (req, res) => {

    try {
        const Project = require("../models/Project");
const Timesheet = require("../models/Timesheet");

        const client = await Client.create(req.body);

        res.status(201).json({

            success: true,

            message: "Client Created Successfully",

            client

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};




// ===================================
// GET ALL CLIENTS
// ===================================

const getClients = async (req, res) => {

    try {

        const clients = await Client.find().sort({

            createdAt: -1

        });

        res.json({

            success: true,

            clients

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};




// ===================================
// GET SINGLE CLIENT
// ===================================

const getClientById = async (req, res) => {

    try {

        const client = await Client.findById(req.params.id);

        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client Not Found"

            });

        }

        res.json({

            success: true,

            client

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};




// ===================================
// UPDATE CLIENT
// ===================================

const updateClient = async (req, res) => {

    try {

        const client = await Client.findByIdAndUpdate(

            req.params.id,

            req.body,

            {

                new: true,

                runValidators: true

            }

        );

        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client Not Found"

            });

        }

        res.json({

            success: true,

            message: "Client Updated Successfully",

            client

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};




// ===================================
// DELETE CLIENT
// ===================================

const deleteClient = async (req, res) => {

    try {

        const client = await Client.findByIdAndDelete(

            req.params.id

        );

        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client Not Found"

            });

        }

        res.json({

            success: true,

            message: "Client Deleted Successfully"

        });

    }

    catch (error) {

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

};




// ===================================
// EXPORT
// ===================================

module.exports = {

    createClient,

    getClients,

    getClientById,

    updateClient,

    deleteClient

};