
const express = require("express");
const mongoose = require("mongoose");
const Experience = require("../models/Experience");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: All visible experiences
router.get("/", async (req, res) => {
    try {
        const experiences = await Experience.find({
            isVisible: true,
        }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: experiences.length,
            experiences,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GET: All experiences for admins, including hidden records
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const experiences = await Experience.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: experiences.length,
            experiences,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GET: Single experience
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid experience ID",
            });
        }

        const experience = await Experience.findOne({
            _id: req.params.id,
            isVisible: true,
        });

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        res.status(200).json({
            success: true,
            experience,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST: Add experience
router.post("/", authMiddleware, async (req, res) => {
    try {
        const experience = await Experience.create(req.body);

        res.status(201).json({
            success: true,
            message: "Experience added successfully!",
            experience,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT: Update experience
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid experience ID",
            });
        }

        const experience = await Experience.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Experience updated successfully!",
            experience,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE: Remove experience
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid experience ID",
            });
        }

        const experience = await Experience.findByIdAndDelete(
            req.params.id
        );

        if (!experience) {
            return res.status(404).json({
                success: false,
                message: "Experience not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Experience deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
