const express = require("express");

const {
    createSubmission,
    getMySubmissions,
    getMySubmission,
    updateSubmission,
    deleteSubmission,
    getAllSubmissions,
    getDepartmentSubmission
} = require("../controllers/submissionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();


// =====================================
// STUDENT ROUTES
// =====================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("student"),
    createSubmission
);


router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    getMySubmissions
);


router.get(
    "/my/:id",
    authMiddleware,
    roleMiddleware("student"),
    getMySubmission
);


router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("student"),
    updateSubmission
);


router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("student"),
    deleteSubmission
);


// =====================================
// DEPARTMENT ROUTES
// =====================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("department"),
    getAllSubmissions
);


router.get(
    "/department/:id",
    authMiddleware,
    roleMiddleware("department"),
    getDepartmentSubmission
);


module.exports = router;