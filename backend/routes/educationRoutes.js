
const express = require("express");
const mongoose = require("mongoose");
const Education = require("../models/Education");

const router = express.Router();

// GET: All visible education records
router.get("/", async (req, res) => {
    try {
        const education = await Education.find({
            isVisible: true,
        }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: education.length,
            education,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GET: Single education record
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid education ID",
            });
        }

        const education = await Education.findById(req.params.id);

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education record not found",
            });
        }

        res.status(200).json({
            success: true,
            education,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST: Add education
router.post("/", async (req, res) => {
    try {
        const education = await Education.create(req.body);

        res.status(201).json({
            success: true,
            message: "Education added successfully!",
            education,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT: Update education
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid education ID",
            });
        }

        const education = await Education.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education record not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Education updated successfully!",
            education,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE: Remove education
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid education ID",
            });
        }

        const education = await Education.findByIdAndDelete(
            req.params.id
        );

        if (!education) {
            return res.status(404).json({
                success: false,
                message: "Education record not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Education deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;