const pool = require("../config/db");


// ===============================
// CREATE SUBMISSION
// ===============================
async function createSubmission(req, res) {
    const client = await pool.connect();

    try {
        const { week, weekly_summary, days } = req.body;

        // Validation
        if (!week || !weekly_summary || !days) {
            return res.status(400).json({
                success: false,
                message: "week, weekly_summary and days are required"
            });
        }

        if (week < 1 || week > 5) {
            return res.status(400).json({
                success: false,
                message: "Week must be between 1 and 5"
            });
        }

        if (!Array.isArray(days) || days.length !== 5) {
            return res.status(400).json({
                success: false,
                message: "Exactly 5 days are required"
            });
        }

        // Check duplicate week
        const existing = await client.query(
            `SELECT id
             FROM ipt_submissions
             WHERE student_id = $1 AND week = $2`,
            [req.user.id, week]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Week ${week} has already been submitted`
            });
        }

        await client.query("BEGIN");

        // Create submission
        const submissionResult = await client.query(
            `INSERT INTO ipt_submissions
             (student_id, week, weekly_summary)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [
                req.user.id,
                week,
                weekly_summary
            ]
        );

        const submission = submissionResult.rows[0];

        // Insert 5 days
        for (const day of days) {

            if (
                !day.day_number ||
                !day.activity_date ||
                !day.activity
            ) {
                throw new Error(
                    "Each day must contain day_number, activity_date and activity"
                );
            }

            await client.query(
                `INSERT INTO ipt_days
                 (submission_id, day_number, activity_date, activity)
                 VALUES ($1, $2, $3, $4)`,
                [
                    submission.id,
                    day.day_number,
                    day.activity_date,
                    day.activity
                ]
            );
        }

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "Submission created successfully",
            submission
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create submission"
        });

    } finally {
        client.release();
    }
}


// ===============================
// GET MY SUBMISSIONS
// ===============================
async function getMySubmissions(req, res) {

    try {

        const result = await pool.query(
            `SELECT
                s.id,
                s.week,
                s.weekly_summary,
                s.status,
                s.submitted_at,
                s.updated_at
             FROM ipt_submissions s
             WHERE s.student_id = $1
             ORDER BY s.week ASC`,
            [req.user.id]
        );

        res.json({
            success: true,
            submissions: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get submissions"
        });

    }
}


// ===============================
// GET ONE STUDENT SUBMISSION
// ===============================
async function getMySubmission(req, res) {

    try {

        const { id } = req.params;

        const submissionResult = await pool.query(
            `SELECT
                s.id,
                s.week,
                s.weekly_summary,
                s.status,
                s.submitted_at,
                s.updated_at,
                u.username,
                u.full_name,
                u.course
             FROM ipt_submissions s
             JOIN users u
                 ON u.id = s.student_id
             WHERE s.id = $1
             AND s.student_id = $2`,
            [id, req.user.id]
        );

        if (submissionResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });

        }

        const daysResult = await pool.query(
            `SELECT
                id,
                day_number,
                activity_date,
                activity
             FROM ipt_days
             WHERE submission_id = $1
             ORDER BY day_number ASC`,
            [id]
        );

        res.json({
            success: true,
            submission: {
                ...submissionResult.rows[0],
                days: daysResult.rows
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get submission"
        });

    }
}


// ===============================
// UPDATE SUBMISSION
// ===============================
async function updateSubmission(req, res) {

    const client = await pool.connect();

    try {

        const { id } = req.params;
        const { weekly_summary, days } = req.body;

        if (!weekly_summary || !days) {

            return res.status(400).json({
                success: false,
                message: "weekly_summary and days are required"
            });

        }

        if (!Array.isArray(days) || days.length !== 5) {

            return res.status(400).json({
                success: false,
                message: "Exactly 5 days are required"
            });

        }

        // Check ownership
        const existing = await client.query(
            `SELECT id
             FROM ipt_submissions
             WHERE id = $1
             AND student_id = $2`,
            [id, req.user.id]
        );

        if (existing.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });

        }

        await client.query("BEGIN");

        // Update summary
        await client.query(
            `UPDATE ipt_submissions
             SET weekly_summary = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [weekly_summary, id]
        );

        // Delete old days
        await client.query(
            `DELETE FROM ipt_days
             WHERE submission_id = $1`,
            [id]
        );

        // Insert new days
        for (const day of days) {

            await client.query(
                `INSERT INTO ipt_days
                 (submission_id, day_number, activity_date, activity)
                 VALUES ($1, $2, $3, $4)`,
                [
                    id,
                    day.day_number,
                    day.activity_date,
                    day.activity
                ]
            );

        }

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Submission updated successfully"
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to update submission"
        });

    } finally {

        client.release();

    }

}


// ===============================
// DELETE SUBMISSION
// ===============================
async function deleteSubmission(req, res) {

    try {

        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM ipt_submissions
             WHERE id = $1
             AND student_id = $2
             RETURNING id`,
            [id, req.user.id]
        );

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });

        }

        res.json({
            success: true,
            message: "Submission deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to delete submission"
        });

    }

}


// ===============================
// DEPARTMENT - GET ALL
// ===============================
async function getAllSubmissions(req, res) {

    try {

        const { search, week } = req.query;

        let query = `
            SELECT
                s.id,
                s.week,
                s.weekly_summary,
                s.status,
                s.submitted_at,
                s.updated_at,

                u.id AS student_id,
                u.username AS registration_number,
                u.full_name,
                u.course

            FROM ipt_submissions s

            JOIN users u
                ON u.id = s.student_id

            WHERE 1 = 1
        `;

        const values = [];
        let counter = 1;

        // Search student
        if (search) {

            query += `
                AND (
                    u.username ILIKE $${counter}
                    OR u.full_name ILIKE $${counter}
                )
            `;

            values.push(`%${search}%`);
            counter++;

        }

        // Filter week
        if (week) {

            query += ` AND s.week = $${counter}`;

            values.push(Number(week));
            counter++;

        }

        query += `
            ORDER BY s.week ASC, s.submitted_at DESC
        `;

        const result = await pool.query(query, values);

        res.json({
            success: true,
            submissions: result.rows
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get submissions"
        });

    }

}


// ===============================
// DEPARTMENT - GET ONE
// ===============================
async function getDepartmentSubmission(req, res) {

    try {

        const { id } = req.params;

        const submissionResult = await pool.query(
            `SELECT
                s.id,
                s.week,
                s.weekly_summary,
                s.status,
                s.submitted_at,
                s.updated_at,

                u.username AS registration_number,
                u.full_name,
                u.course

             FROM ipt_submissions s

             JOIN users u
                 ON u.id = s.student_id

             WHERE s.id = $1`,
            [id]
        );

        if (submissionResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Submission not found"
            });

        }

        const daysResult = await pool.query(
            `SELECT
                id,
                day_number,
                activity_date,
                activity

             FROM ipt_days

             WHERE submission_id = $1

             ORDER BY day_number ASC`,
            [id]
        );

        res.json({
            success: true,
            submission: {
                ...submissionResult.rows[0],
                days: daysResult.rows
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to get submission"
        });

    }

}


module.exports = {
    createSubmission,
    getMySubmissions,
    getMySubmission,
    updateSubmission,
    deleteSubmission,
    getAllSubmissions,
    getDepartmentSubmission
};