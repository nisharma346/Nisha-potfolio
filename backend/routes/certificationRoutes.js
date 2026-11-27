
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

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
        return sendApiError(res, error);
    }
});

// GET all certifications for admins, including hidden records
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const certifications = await Certification.find().sort({
            displayOrder: 1,
        });

        res.status(200).json({
            success: true,
            count: certifications.length,
            certifications,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// POST - Add certification
router.post("/", authMiddleware, async (req, res) => {
    try {
        const certification = await Certification.create(req.body);

        res.status(201).json({
            success: true,
            message: "Certification added successfully!",
            certification,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// PUT - Update certification
router.put("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

// DELETE - Delete certification
router.delete("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

module.exports = router;
