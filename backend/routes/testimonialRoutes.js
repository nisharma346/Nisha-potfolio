
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const Testimonial = require("../models/Testimonial");
const authMiddleware = require("../middleware/authMiddleware");
const createImageUploadMiddleware = require("../utils/cloudinaryImageUpload");

const router = express.Router();

router.post(
    "/upload-image",
    authMiddleware,
    ...createImageUploadMiddleware("nisha-portfolio/testimonials")
);

// GET: All visible testimonials
router.get("/", async (req, res) => {
    try {
        const testimonials = await Testimonial.find({
            isVisible: true,
        }).sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            testimonials,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// GET: All testimonials for admins, including hidden records
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const testimonials = await Testimonial.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: testimonials.length,
            testimonials,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// POST: Add testimonial
router.post("/", authMiddleware, async (req, res) => {
    try {
        const testimonial = await Testimonial.create(req.body);

        res.status(201).json({
            success: true,
            message: "Testimonial added successfully!",
            testimonial,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// PUT: Update testimonial
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }

        const testimonial = await Testimonial.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Testimonial updated successfully!",
            testimonial,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// DELETE: Remove testimonial
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid testimonial ID",
            });
        }

        const testimonial = await Testimonial.findByIdAndDelete(
            req.params.id
        );

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Testimonial deleted successfully!",
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

module.exports = router;
