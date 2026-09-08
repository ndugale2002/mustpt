const express = require("express");

const router =
    express.Router();


const {
    createRecord,
    getAllRecords,
    getStudentRecords,
    getRecordById,
    updateRecord,
    deleteRecord
} = require("../controllers/recordcontroller");



/*
====================================================
CREATE
POST /api/records
====================================================
*/

router.post(
    "/",
    createRecord
);



/*
====================================================
GET ALL
GET /api/records
====================================================
*/

router.get(
    "/",
    getAllRecords
);



/*
====================================================
GET STUDENT RECORDS
GET /api/records/student/:regNo
====================================================
*/

router.get(
    "/student/:regNo",
    getStudentRecords
);



/*
====================================================
GET ONE
GET /api/records/:id
====================================================
*/

router.get(
    "/:id",
    getRecordById
);



/*
====================================================
UPDATE
PUT /api/records/:id
====================================================
*/

router.put(
    "/:id",
    updateRecord
);



/*
====================================================
DELETE
DELETE /api/records/:id
====================================================
*/

router.delete(
    "/:id",
    deleteRecord
);



module.exports = router;