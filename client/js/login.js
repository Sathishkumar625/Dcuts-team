/* ==========================================
   LOGIN SYSTEM
   THE D CUTS TIMESHEET
========================================== */

// Demo Users
const users = [
    {
        email: "admin@dcuts.com",
        password: "admin123",
        role: "admin",
        name: "Admin"
    },
    {
        email: "employee@dcuts.com",
        password: "123456",
        role: "employee",
        name: "Employee"
    }
];

// Make login function global
window.login = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    message.innerHTML = "";

    // Validation
    if (email === "" || password === "") {
        message.innerHTML = "Please Enter Email & Password";
        return;
    }

    // Find User
    const user = users.find(u =>
        u.email === email &&
        u.password === password
    );

    if (!user) {
        message.innerHTML = "Invalid Email or Password";
        return;
    }

    // Save Login Session
    localStorage.setItem("loggedUser", JSON.stringify(user));
    localStorage.setItem("role", user.role);
    localStorage.setItem("userName", user.name);

    // Redirect
    if (user.role === "admin") {
        window.location.replace("index.html");
    } else {
        window.location.replace("pages/timesheet.html");
    }
};

// Logout Function
window.logout = function () {

    localStorage.removeItem("loggedUser");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");

    window.location.replace("../login.html");

};