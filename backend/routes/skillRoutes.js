
const express = require("express");
const mongoose = require("mongoose");
const Skill = require("../models/skill");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: All visible skills
router.get("/", async (req, res) => {
    try {
        const skills = await Skill.find({ isVisible: true })
            .sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: skills.length,
            skills,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GET: All skills for admins, including hidden skills
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const skills = await Skill.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: skills.length,
            skills,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// GET: Single skill
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID",
            });
        }

        const skill = await Skill.findOne({
            _id: req.params.id,
            isVisible: true,
        });

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            skill,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST: Add skill
router.post("/", authMiddleware, async (req, res) => {
    try {
        const skill = await Skill.create(req.body);

        res.status(201).json({
            success: true,
            message: "Skill added successfully!",
            skill,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// PUT: Update skill
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID",
            });
        }

        const skill = await Skill.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Skill updated successfully!",
            skill,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});

// DELETE: Remove skill
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid skill ID",
            });
        }

        const skill = await Skill.findByIdAndDelete(req.params.id);

        if (!skill) {
            return res.status(404).json({
                success: false,
                message: "Skill not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Skill deleted successfully!",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
