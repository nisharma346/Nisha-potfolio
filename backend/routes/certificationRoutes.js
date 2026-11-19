
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Certification = require("../models/Certification");

// GET all visible certifications
router.get("/", async (req, res) => {
    try {
        const certifications = await Certification.find({
            isVisible: true,
        }).sort({ displayOrder: 1 });

        res.json({
            success: true,
            count: certifications.length,
            certifications,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST - Add certification
router.post("/", async (req, res) => {
    try {
        const certification = await Certification.create(req.body);

        res.status(201).json({
            success: true,
            message: "Certification added successfully!",
            certification,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT - Update certification
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certification ID",
            });
        }

        const certification = await Certification.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: "Certification not found",
            });
        }

        res.json({
            success: true,
            message: "Certification updated successfully!",
            certification,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE - Delete certification
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid certification ID",
            });
        }

        const certification = await Certification.findByIdAndDelete(
            req.params.id
        );

        if (!certification) {
            return res.status(404).json({
                success: false,
                message: "Certification not found",
            });
        }

        res.json({
            success: true,
            message: "Certification deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
