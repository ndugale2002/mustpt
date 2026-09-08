const express = require("express");

const {
    registerStudent,
    registerDepartment,
    login,
    me
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================
// REGISTER STUDENT
// =====================================

router.post(
    "/register/student",
    registerStudent
);


// =====================================
// REGISTER DEPARTMENT
// =====================================

router.post(
    "/register/department",
    registerDepartment
);


// =====================================
// LOGIN
// =====================================

router.post(
    "/login",
    login
);


// =====================================
// CURRENT USER
// =====================================

router.get(
    "/me",
    authMiddleware,
    me
);


module.exports = router;