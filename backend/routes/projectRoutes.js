const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const Project = require("../models/project");
const createImageUploadMiddleware = require("../utils/cloudinaryImageUpload");

const router = express.Router();

router.post(
    "/upload-image",
    authMiddleware,
    ...createImageUploadMiddleware("nisha-portfolio/projects")
);

// 1. GET: All Projects
router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ displayOrder: 1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            projects,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// 2. GET: Single Project
router.get("/:id", async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// 3. POST: Add New Project
router.post("/", authMiddleware, async (req, res) => {
    try {
        const project = await Project.create(req.body);

        res.status(201).json({
            success: true,
            message: "Project added successfully!",
            project,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});


// 4. PUT: Update Project
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project updated successfully!",
            project,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// 5. DELETE: Remove Project
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Project deleted successfully!",
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

module.exports = router;