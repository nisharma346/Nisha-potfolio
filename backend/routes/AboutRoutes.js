
const express = require("express");
const mongoose = require("mongoose");
const About = require("../models/About");

const router = express.Router();

// GET: About details
router.get("/", async (req, res) => {
    try {
        const about = await About.findOne();

        res.status(200).json({
            success: true,
            about,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST: Create About details
router.post("/", async (req, res) => {
    try {
        const existingAbout = await About.findOne();

        if (existingAbout) {
            return res.status(409).json({
                success: false,
                message: "About details already exist. Use PUT to update.",
            });
        }

        const about = await About.create(req.body);

        res.status(201).json({
            success: true,
            message: "About details added successfully!",
            about,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT: Update About details
router.put("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid About ID",
            });
        }

        const about = await About.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!about) {
            return res.status(404).json({
                success: false,
                message: "About details not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "About details updated successfully!",
            about,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE: Remove About details
router.delete("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid About ID",
            });
        }

        const about = await About.findByIdAndDelete(req.params.id);

        if (!about) {
            return res.status(404).json({
                success: false,
                message: "About details not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "About details deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
