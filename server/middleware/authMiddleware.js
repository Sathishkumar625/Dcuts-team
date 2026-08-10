const jwt =
    require("jsonwebtoken");


/* =====================================================
   AUTHENTICATION
===================================================== */

function authMiddleware(
    req,
    res,
    next
) {

    try {

        const header =
            req.headers.authorization;


        if (
            !header
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Authentication Required"

            });

        }


        if (
            !header.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Invalid Authorization Format"

            });

        }


        const token =
            header
                .substring(7)
                .trim();


        if (!token) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Token Missing"

            });

        }


        if (
            !process.env.JWT_SECRET
        ) {

            return res.status(500).json({

                success:
                    false,

                message:
                    "JWT_SECRET missing"

            });

        }


        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        req.user = {

            id:
                decoded.id,

            email:
                decoded.email,

            role:
                decoded.role

        };


        next();

    }

    catch (error) {

        console.error(
            "AUTH ERROR:",
            error.message
        );


        return res.status(401).json({

            success:
                false,

            message:
                "Invalid or Expired Login Session"

        });

    }

}


/* =====================================================
   ADMIN ONLY
===================================================== */

function adminOnly(
    req,
    res,
    next
) {

    if (
        !req.user
    ) {

        return res.status(401).json({

            success:
                false,

            message:
                "Authentication Required"

        });

    }


    if (
        String(req.user.role)
        .toLowerCase() !==
        "admin"
    ) {

        return res.status(403).json({

            success:
                false,

            message:
                "Admin Access Only"

        });

    }


    next();

}


/* =====================================================
   ADMIN OR EMPLOYEE
===================================================== */

function authenticatedUser(
    req,
    res,
    next
) {

    if (
        !req.user
    ) {

        return res.status(401).json({

            success:
                false,

            message:
                "Authentication Required"

        });

    }


    const role =
        String(
            req.user.role || ""
        )
        .toLowerCase();


    if (
        role !== "admin" &&
        role !== "employee"
    ) {

        return res.status(403).json({

            success:
                false,

            message:
                "Invalid User Role"

        });

    }


    next();

}


module.exports =
    authMiddleware;

module.exports.adminOnly =
    adminOnly;

module.exports.authenticatedUser =
    authenticatedUser;