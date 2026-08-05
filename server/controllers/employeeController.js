const Employee = require("../models/Employee");



// ==========================
// CREATE EMPLOYEE
// ==========================

const createEmployee = async (req, res) => {

    try {


        const employee = await Employee.create({

            employeeId:
            "EMP" + Date.now(),


            name:
            req.body.name,


            email:
            req.body.email,


            phone:
            req.body.phone,


            department:
            req.body.department,


            designation:
            req.body.designation,


            joiningDate:
            req.body.joiningDate,


            salary:
            req.body.salary,


            status:
            req.body.status || "Active",


            role:
            req.body.role || "Employee"

        });



        res.status(201).json({

            success:true,

            message:
            "Employee Created Successfully",

            employee

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






// ==========================
// GET ALL EMPLOYEES
// ==========================


const getEmployees = async(req,res)=>{


    try{


        const employees =
        await Employee.find()
        .sort({createdAt:-1});



        res.json({

            success:true,

            employees

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};






// ==========================
// GET SINGLE EMPLOYEE
// ==========================


const getEmployeeById = async(req,res)=>{


    try{


        const employee =
        await Employee.findById(
            req.params.id
        );



        if(!employee){


            return res.status(404).json({

                success:false,

                message:
                "Employee Not Found"

            });


        }



        res.json({

            success:true,

            employee

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};








// ==========================
// UPDATE EMPLOYEE
// ==========================


const updateEmployee = async(req,res)=>{


    try{


        const employee =
        await Employee.findByIdAndUpdate(


            req.params.id,


            req.body,


            {
                new:true
            }


        );



        if(!employee){


            return res.status(404).json({

                success:false,

                message:
                "Employee Not Found"

            });


        }



        res.json({

            success:true,

            message:
            "Employee Updated Successfully",

            employee

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};








// ==========================
// DELETE EMPLOYEE
// ==========================


const deleteEmployee = async(req,res)=>{


    try{


        const employee =
        await Employee.findByIdAndDelete(
            req.params.id
        );



        if(!employee){


            return res.status(404).json({

                success:false,

                message:
                "Employee Not Found"

            });


        }



        res.json({

            success:true,

            message:
            "Employee Deleted Successfully"

        });



    }
    catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


};







// ==========================
// EXPORT
// ==========================


module.exports = {


    createEmployee,

    getEmployees,

    getEmployeeById,

    updateEmployee,

    deleteEmployee


};