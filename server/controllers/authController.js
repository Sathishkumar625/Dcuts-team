const User = require("../models/User");
const Employee = require("../models/Employee");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


/* =====================================================
   ADMIN EMAIL
===================================================== */

const ADMIN_EMAIL =
    String(
        process.env.ADMIN_EMAIL ||
        "dcutsdigitalsolutions@gmail.com"
    )
    .toLowerCase()
    .trim();


/* =====================================================
   CREATE JWT
===================================================== */

function createToken(user) {

    if (!process.env.JWT_SECRET) {

        throw new Error(
            "JWT_SECRET is missing in .env"
        );

    }


    return jwt.sign(

        {
            id:
                user._id.toString(),

            email:
                user.email,

            role:
                user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn:
                "7d"
        }

    );

}


/* =====================================================
   CREATE EMPLOYEE PROFILE
===================================================== */

async function createEmployeeProfile(user) {

    if (
        !user ||
        user.role !== "employee"
    ) {

        return null;

    }


    const cleanEmail =
        String(
            user.email || ""
        )
        .toLowerCase()
        .trim();


    if (!cleanEmail) {

        return null;

    }


    let employee =
        await Employee.findOne({

            email:
                cleanEmail

        });


    if (employee) {

        return employee;

    }


    employee =
        await Employee.create({

            employeeId:
                "EMP" +
                Date.now(),

            name:
                user.name || "Employee",

            email:
                cleanEmail,

            role:
                "Employee",

            status:
                "Active"

        });


    console.log(
        "EMPLOYEE PROFILE CREATED:",
        cleanEmail
    );


    return employee;

}


/* =====================================================
   REGISTER
===================================================== */

async function register(req, res) {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Name, Email and Password are required."

            });

        }


        const cleanEmail =
            String(email)
            .toLowerCase()
            .trim();


        const existingUser =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (existingUser) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "User already exists."

            });

        }


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        let userRole =
            String(
                role || "employee"
            )
            .toLowerCase()
            .trim();


        if (
            cleanEmail === ADMIN_EMAIL
        ) {

            userRole =
                "admin";

        }
        else {

            userRole =
                "employee";

        }


        const user =
            await User.create({

                name:
                    String(name).trim(),

                email:
                    cleanEmail,

                password:
                    hashedPassword,

                role:
                    userRole,

                active:
                    true

            });


        if (
            user.role === "employee"
        ) {

            await createEmployeeProfile(
                user
            );

        }


        const token =
            createToken(user);


        return res.status(201).json({

            success:
                true,

            message:
                "User Registered Successfully",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    }

    catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Registration failed."

        });

    }

}


/* =====================================================
   NORMAL LOGIN
===================================================== */

async function login(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        console.log(
            "LOGIN ATTEMPT:",
            email
        );


        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Email and Password are required."

            });

        }


        const cleanEmail =
            String(email)
            .toLowerCase()
            .trim();


        const user =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (!user) {

            return res.status(404).json({

                success:
                    false,

                message:
                    "User not found."

            });

        }


        if (
            user.active === false
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Your account is inactive."

            });

        }


        if (
            !user.password
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "This account does not have a password. Use Google Login."

            });

        }


        const passwordMatch =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordMatch) {

            console.log(
                "WRONG PASSWORD:",
                cleanEmail
            );


            return res.status(401).json({

                success:
                    false,

                message:
                    "Wrong Password."

            });

        }


        /* =================================================
           ADMIN EMAIL ALWAYS ADMIN
        ================================================= */

        if (
            cleanEmail === ADMIN_EMAIL
        ) {

            user.role =
                "admin";

            await user.save();

        }


        if (
            user.role === "employee"
        ) {

            await createEmployeeProfile(
                user
            );

        }


        const token =
            createToken(user);


        console.log(
            "LOGIN SUCCESS:",
            user.email,
            user.role
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Login Successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    }

    catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Login failed."

        });

    }

}


/* =====================================================
   GOOGLE LOGIN
===================================================== */

async function googleLogin(req, res) {

    try {

        const {
            name,
            email
        } = req.body;


        console.log(
            "GOOGLE LOGIN:",
            email
        );


        if (
            !email
        ) {

            return res.status(400).json({

                success:
                    false,

                message:
                    "Google email is required."

            });

        }


        const cleanEmail =
            String(email)
            .toLowerCase()
            .trim();


        const cleanName =
            String(
                name ||
                "Employee"
            ).trim();


        let user =
            await User.findOne({

                email:
                    cleanEmail

            });


        /* =================================================
           NEW GOOGLE USER
        ================================================= */

        if (!user) {

            const randomPassword =
                await bcrypt.hash(

                    "google-" +
                    Date.now() +
                    "-" +
                    Math.random(),

                    10

                );


            const userRole =
                cleanEmail === ADMIN_EMAIL
                    ? "admin"
                    : "employee";


            user =
                await User.create({

                    name:
                        cleanName,

                    email:
                        cleanEmail,

                    password:
                        randomPassword,

                    role:
                        userRole,

                    active:
                        true

                });


            console.log(
                "NEW GOOGLE USER CREATED:",
                cleanEmail
            );

        }


        /* =================================================
           ADMIN EMAIL
        ================================================= */

        if (
            cleanEmail === ADMIN_EMAIL
        ) {

            if (
                user.role !== "admin"
            ) {

                user.role =
                    "admin";

                await user.save();

            }

        }


        /* =================================================
           EMPLOYEE PROFILE
        ================================================= */

        if (
            user.role === "employee"
        ) {

            await createEmployeeProfile(
                user
            );

        }


        /* =================================================
           BACKEND JWT
        ================================================= */

        const token =
            createToken(user);


        console.log(
            "GOOGLE JWT CREATED:",
            user.email,
            user.role
        );


        return res.status(200).json({

            success:
                true,

            message:
                "Google Login Successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                role:
                    user.role

            }

        });

    }

    catch (error) {

        console.error(
            "GOOGLE LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                error.message ||
                "Google login failed."

        });

    }

}


/* =====================================================
   EXPORT
===================================================== */

module.exports = {

    register,

    login,

    googleLogin

};