const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");


// =====================================
// CREATE JWT TOKEN
// =====================================

function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        }
    );
}


// =====================================
// REGISTER STUDENT
// =====================================

async function registerStudent(req, res) {
    try {

        const {
            username,
            full_name,
            password,
            course
        } = req.body;


        // Check required fields
        if (
            !username ||
            !full_name ||
            !password ||
            !course
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "username, full_name, password and course are required"
            });
        }


        // Check if username already exists
        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        );


        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }


        // Hash password
        const passwordHash = await bcrypt.hash(
            password,
            12
        );


        // Insert student
        const result = await pool.query(
            `INSERT INTO users
            (
                username,
                full_name,
                password_hash,
                role,
                course
            )
            VALUES ($1, $2, $3, 'student', $4)

            RETURNING
                id,
                username,
                full_name,
                role,
                course,
                created_at`,
            [
                username,
                full_name,
                passwordHash,
                course
            ]
        );


        const user = result.rows[0];


        // Create token
        const token = createToken(user);


        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            user,
            token
        });


    } catch (error) {

        console.error("Register student error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
}


// =====================================
// REGISTER DEPARTMENT
// =====================================

async function registerDepartment(req, res) {

    try {

        const {
            username,
            full_name,
            password
        } = req.body;


        // Check required fields
        if (
            !username ||
            !full_name ||
            !password
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "username, full_name and password are required"
            });

        }


        // Check existing username
        const existingUser = await pool.query(
            `SELECT id
             FROM users
             WHERE username = $1`,
            [username]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });

        }


        // Hash password
        const passwordHash = await bcrypt.hash(
            password,
            12
        );


        // Insert department user
        const result = await pool.query(
            `INSERT INTO users
            (
                username,
                full_name,
                password_hash,
                role
            )
            VALUES ($1, $2, $3, 'department')

            RETURNING
                id,
                username,
                full_name,
                role,
                created_at`,
            [
                username,
                full_name,
                passwordHash
            ]
        );


        const user = result.rows[0];


        // Create JWT
        const token = createToken(user);


        res.status(201).json({
            success: true,
            message: "Department account created successfully",
            user,
            token
        });


    } catch (error) {

        console.error(
            "Register department error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
}


// =====================================
// LOGIN
// =====================================

async function login(req, res) {

    try {

        const {
            username,
            password
        } = req.body;


        // Check fields
        if (!username || !password) {

            return res.status(400).json({
                success: false,
                message:
                    "Username and password are required"
            });

        }


        // Find user
        const result = await pool.query(
            `SELECT
                id,
                username,
                full_name,
                password_hash,
                role,
                course
             FROM users
             WHERE username = $1`,
            [username]
        );


        if (result.rows.length === 0) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password"
            });

        }


        const user = result.rows[0];


        // Compare password
        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password_hash
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid username or password"
            });

        }


        // Remove password hash
        delete user.password_hash;


        // Create token
        const token = createToken(user);


        res.json({
            success: true,
            message: "Login successful",
            user,
            token
        });


    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
}


// =====================================
// GET CURRENT USER
// =====================================

async function me(req, res) {

    try {

        const result = await pool.query(
            `SELECT
                id,
                username,
                full_name,
                role,
                course,
                created_at

             FROM users

             WHERE id = $1`,
            [req.user.id]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }


        res.json({
            success: true,
            user: result.rows[0]
        });


    } catch (error) {

        console.error("Get user error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
}


// =====================================
// EXPORT
// =====================================

module.exports = {
    registerStudent,
    registerDepartment,
    login,
    me
};