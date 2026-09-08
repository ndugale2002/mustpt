require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const recordRoutes = require('./routes/recordRoutes');

const app = express();

app.use(cors());
app.use(express.json());


// HOME
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MUST IPT API is running"
    });
});


// DATABASE TEST
app.get("/api/health", async (req, res) => {
    try {

        await pool.query("SELECT 1");

        res.json({
            success: true,
            message: "API and PostgreSQL are connected"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});


// ROUTES
app.use("/api/auth", authRoutes);

app.use("/api/submissions", submissionRoutes);

app.use("/api/records", recordRoutes);

// 404
app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found"
    });

});


// SERVER ERROR
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {

    console.log(`MUST IPT API running on http://localhost:${PORT}`);

});