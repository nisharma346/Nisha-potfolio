
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const Education = require("../models/Education");
const authMiddleware = require("../middleware/authMiddleware");

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
        return sendApiError(res, error);
    }
});

// GET: All education records for admins, including hidden records
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const education = await Education.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: education.length,
            education,
        });
    } catch (error) {
        return sendApiError(res, error);
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

        const education = await Education.findOne({
            _id: req.params.id,
            isVisible: true,
        });

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
        return sendApiError(res, error);
    }
});

// POST: Add education
router.post("/", authMiddleware, async (req, res) => {
    try {
        const education = await Education.create(req.body);

        res.status(201).json({
            success: true,
            message: "Education added successfully!",
            education,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// PUT: Update education
router.put("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

// DELETE: Remove education
router.delete("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

module.exports = router;