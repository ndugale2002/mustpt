const pool = require("../config/db");


/*
====================================================
CREATE RECORD
POST /api/records
====================================================
*/

const createRecord = async (req, res) => {

    const client = await pool.connect();

    try {

        const {
            regNo,
            fullName,
            course,
            week,
            days,
            summary
        } = req.body;


        /*
        VALIDATION
        */

        if (
            !regNo ||
            !fullName ||
            !course ||
            !week ||
            !days ||
            !summary
        ) {

            return res.status(400).json({
                message: "All fields are required."
            });

        }


        if (
            !Array.isArray(days) ||
            days.length !== 5
        ) {

            return res.status(400).json({
                message:
                    "Exactly 5 daily activities are required."
            });

        }


        const weekNumber =
            Number(week);


        if (
            weekNumber < 1 ||
            weekNumber > 5
        ) {

            return res.status(400).json({
                message:
                    "Week must be between 1 and 5."
            });

        }


        /*
        START TRANSACTION
        */

        await client.query("BEGIN");


        /*
        CHECK EXISTING WEEK
        */

        const existing =
            await client.query(
                `
                SELECT id
                FROM ipt_records
                WHERE reg_no = $1
                AND week = $2
                `,
                [
                    regNo.trim(),
                    weekNumber
                ]
            );


        if (existing.rows.length > 0) {

            await client.query("ROLLBACK");

            return res.status(409).json({
                message:
                    `Week ${weekNumber} already exists.`
            });

        }


        /*
        CREATE MAIN RECORD
        */

        const recordResult =
            await client.query(
                `
                INSERT INTO ipt_records
                (
                    reg_no,
                    full_name,
                    course,
                    week,
                    summary
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
                `,
                [
                    regNo.trim(),
                    fullName.trim(),
                    course.trim(),
                    weekNumber,
                    summary.trim()
                ]
            );


        const record =
            recordResult.rows[0];


        /*
        INSERT 5 DAYS
        */

        for (const day of days) {

            await client.query(
                `
                INSERT INTO ipt_record_days
                (
                    record_id,
                    day,
                    date,
                    activity
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    record.id,
                    day.day,
                    day.date,
                    day.activity.trim()
                ]
            );

        }


        /*
        COMMIT
        */

        await client.query("COMMIT");


        /*
        RESPONSE
        */

        res.status(201).json({

            message:
                "IPT record created successfully.",

            record: {
                id: record.id,

                regNo: record.reg_no,

                fullName: record.full_name,

                course: record.course,

                week: record.week,

                summary: record.summary,

                submittedAt:
                    record.submitted_at,

                days: days
            }

        });


    } catch (error) {

        await client.query("ROLLBACK");


        console.error(
            "CREATE RECORD ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to create IPT record."

        });


    } finally {

        client.release();

    }

};



/*
====================================================
GET ALL RECORDS
GET /api/records
====================================================
*/

const getAllRecords = async (req, res) => {

    try {

        const result =
            await pool.query(
                `
                SELECT
                    r.id,
                    r.reg_no,
                    r.full_name,
                    r.course,
                    r.week,
                    r.summary,
                    r.submitted_at,
                    r.updated_at,

                    COALESCE(
                        json_agg(
                            json_build_object(
                                'day', d.day,
                                'date', d.date,
                                'activity', d.activity
                            )
                            ORDER BY d.day
                        )
                        FILTER (
                            WHERE d.id IS NOT NULL
                        ),
                        '[]'
                    ) AS days

                FROM ipt_records r

                LEFT JOIN ipt_record_days d
                    ON r.id = d.record_id

                GROUP BY r.id

                ORDER BY r.week ASC
                `
            );


        const records =
            result.rows.map(
                formatRecord
            );


        res.json(records);


    } catch (error) {

        console.error(
            "GET ALL RECORDS ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to get IPT records."

        });

    }

};



/*
====================================================
GET STUDENT RECORDS
GET /api/records/student/:regNo
====================================================
*/

const getStudentRecords = async (req, res) => {

    try {

        const {
            regNo
        } = req.params;


        const result =
            await pool.query(
                `
                SELECT
                    r.id,
                    r.reg_no,
                    r.full_name,
                    r.course,
                    r.week,
                    r.summary,
                    r.submitted_at,
                    r.updated_at,

                    COALESCE(
                        json_agg(
                            json_build_object(
                                'day', d.day,
                                'date', d.date,
                                'activity', d.activity
                            )
                            ORDER BY d.day
                        )
                        FILTER (
                            WHERE d.id IS NOT NULL
                        ),
                        '[]'
                    ) AS days

                FROM ipt_records r

                LEFT JOIN ipt_record_days d
                    ON r.id = d.record_id

                WHERE r.reg_no = $1

                GROUP BY r.id

                ORDER BY r.week ASC
                `,
                [regNo]
            );


        const records =
            result.rows.map(
                formatRecord
            );


        res.json({
            records
        });


    } catch (error) {

        console.error(
            "GET STUDENT RECORDS ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to get student records."

        });

    }

};



/*
====================================================
GET ONE RECORD
GET /api/records/:id
====================================================
*/

const getRecordById = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const result =
            await pool.query(
                `
                SELECT
                    r.id,
                    r.reg_no,
                    r.full_name,
                    r.course,
                    r.week,
                    r.summary,
                    r.submitted_at,
                    r.updated_at,

                    COALESCE(
                        json_agg(
                            json_build_object(
                                'day', d.day,
                                'date', d.date,
                                'activity', d.activity
                            )
                            ORDER BY d.day
                        )
                        FILTER (
                            WHERE d.id IS NOT NULL
                        ),
                        '[]'
                    ) AS days

                FROM ipt_records r

                LEFT JOIN ipt_record_days d
                    ON r.id = d.record_id

                WHERE r.id = $1

                GROUP BY r.id
                `,
                [id]
            );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Record not found."

            });

        }


        const record =
            formatRecord(
                result.rows[0]
            );


        res.json({
            record
        });


    } catch (error) {

        console.error(
            "GET RECORD ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to get record."

        });

    }

};



/*
====================================================
UPDATE RECORD
PUT /api/records/:id
====================================================
*/

const updateRecord = async (req, res) => {

    const client =
        await pool.connect();

    try {

        const {
            id
        } = req.params;


        const {
            regNo,
            fullName,
            course,
            week,
            days,
            summary
        } = req.body;


        if (
            !regNo ||
            !fullName ||
            !course ||
            !week ||
            !days ||
            !summary
        ) {

            return res.status(400).json({

                message:
                    "All fields are required."

            });

        }


        if (
            !Array.isArray(days) ||
            days.length !== 5
        ) {

            return res.status(400).json({

                message:
                    "Exactly 5 daily activities are required."

            });

        }


        await client.query(
            "BEGIN"
        );


        /*
        CHECK RECORD
        */

        const recordCheck =
            await client.query(
                `
                SELECT id
                FROM ipt_records
                WHERE id = $1
                `,
                [id]
            );


        if (
            recordCheck.rows.length === 0
        ) {

            await client.query(
                "ROLLBACK"
            );


            return res.status(404).json({

                message:
                    "Record not found."

            });

        }


        /*
        UPDATE MAIN RECORD
        */

        const result =
            await client.query(
                `
                UPDATE ipt_records

                SET
                    reg_no = $1,
                    full_name = $2,
                    course = $3,
                    week = $4,
                    summary = $5,
                    updated_at = CURRENT_TIMESTAMP

                WHERE id = $6

                RETURNING *
                `,
                [
                    regNo.trim(),
                    fullName.trim(),
                    course.trim(),
                    Number(week),
                    summary.trim(),
                    id
                ]
            );


        const record =
            result.rows[0];


        /*
        DELETE OLD DAYS
        */

        await client.query(
            `
            DELETE FROM ipt_record_days
            WHERE record_id = $1
            `,
            [id]
        );


        /*
        INSERT NEW DAYS
        */

        for (const day of days) {

            await client.query(
                `
                INSERT INTO ipt_record_days
                (
                    record_id,
                    day,
                    date,
                    activity
                )
                VALUES ($1, $2, $3, $4)
                `,
                [
                    id,
                    day.day,
                    day.date,
                    day.activity.trim()
                ]
            );

        }


        await client.query(
            "COMMIT"
        );


        res.json({

            message:
                "Record updated successfully.",

            record: {

                id: record.id,

                regNo: record.reg_no,

                fullName:
                    record.full_name,

                course:
                    record.course,

                week:
                    record.week,

                summary:
                    record.summary,

                submittedAt:
                    record.submitted_at,

                updatedAt:
                    record.updated_at,

                days

            }

        });


    } catch (error) {

        await client.query(
            "ROLLBACK"
        );


        console.error(
            "UPDATE RECORD ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to update record."

        });


    } finally {

        client.release();

    }

};



/*
====================================================
DELETE RECORD
DELETE /api/records/:id
====================================================
*/

const deleteRecord = async (req, res) => {

    try {

        const {
            id
        } = req.params;


        const result =
            await pool.query(
                `
                DELETE FROM ipt_records

                WHERE id = $1

                RETURNING id
                `,
                [id]
            );


        if (
            result.rows.length === 0
        ) {

            return res.status(404).json({

                message:
                    "Record not found."

            });

        }


        res.json({

            message:
                "Record deleted successfully.",

            id:
                result.rows[0].id

        });


    } catch (error) {

        console.error(
            "DELETE RECORD ERROR:",
            error
        );


        res.status(500).json({

            message:
                "Failed to delete record."

        });

    }

};



/*
====================================================
FORMAT DATABASE RECORD
====================================================
*/

function formatRecord(row) {

    return {

        id: row.id,

        regNo: row.reg_no,

        fullName:
            row.full_name,

        course:
            row.course,

        week:
            row.week,

        summary:
            row.summary,

        submittedAt:
            row.submitted_at,

        updatedAt:
            row.updated_at,

        days:
            row.days || []

    };

}



/*
====================================================
EXPORT
====================================================
*/

module.exports = {

    createRecord,

    getAllRecords,

    getStudentRecords,

    getRecordById,

    updateRecord,

    deleteRecord

};