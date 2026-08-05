const express = require("express");

const router = express.Router();


const authMiddleware =
require("../middleware/authMiddleware");


const {

createEmployee,

getEmployees,

getEmployeeById,

updateEmployee,

deleteEmployee


}=require("../controllers/employeeController");




// CREATE

router.post(
"/",
authMiddleware,
createEmployee
);




// GET ALL

router.get(
"/",
authMiddleware,
getEmployees
);




// GET ONE

router.get(
"/:id",
authMiddleware,
getEmployeeById
);




// UPDATE

router.put(
"/:id",
authMiddleware,
updateEmployee
);




// DELETE

router.delete(
"/:id",
authMiddleware,
deleteEmployee
);



module.exports = router;