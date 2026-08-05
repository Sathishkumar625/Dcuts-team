exports.roleMiddleware = (...allowedRoles)=>{


    return (req,res,next)=>{


        if(!req.user){

            return res.status(401).json({

                success:false,
                message:"User Not Authenticated"

            });

        }



        if(!allowedRoles.includes(req.user.role)){


            return res.status(403).json({

                success:false,
                message:"Access Denied"

            });


        }



        next();


    };


};