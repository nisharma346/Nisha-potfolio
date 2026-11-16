
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const projectRoutes = require("./routes/projectRoutes");
const skillRoutes = require("./routes/skillRoutes");
const aboutRoutes = require("./routes/AboutRoutes");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Project Routes
app.use("/api/projects", projectRoutes);

// Skill Routes
app.use("/api/skills", skillRoutes);
// About Routes
app.use("/api/about", aboutRoutes);

// Home API
app.get("/", (req, res) => {
    res.send("Nisha Portfolio Backend is Running!");
});

// Test API
app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to Nisha Portfolio API!",
        technology: "Node.js + Express + MongoDB",
    });
});

// MongoDB Connection and Server Start
const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Atlas Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB Connection Failed:", error.message);
    });
