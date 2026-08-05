const DailyReport =
require("../models/DailyReport");




// CREATE REPORT

const createDailyReport = async(req,res)=>{

    try{

        const report =
        await DailyReport.create(req.body);


        res.status(201).json({

            success:true,
            message:"Daily Report Created",
            report

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};





// GET ALL REPORTS


const getDailyReports = async(req,res)=>{

    try{

        const reports =
        await DailyReport.find()
        .populate("employee");


        res.json({

            success:true,
            reports

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};






// GET EMPLOYEE REPORT


const getEmployeeReports = async(req,res)=>{

    try{


        const reports =
        await DailyReport.find({

            employee:req.params.id

        });



        res.json({

            success:true,
            reports

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};






// DELETE REPORT


const deleteDailyReport = async(req,res)=>{

    try{


        await DailyReport.findByIdAndDelete(
            req.params.id
        );


        res.json({

            success:true,
            message:"Report Deleted"

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

};






module.exports={

createDailyReport,
getDailyReports,
getEmployeeReports,
deleteDailyReport

};