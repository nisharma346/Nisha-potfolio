const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const Project = require("../models/project");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const MAX_PROJECT_IMAGE_SIZE = 5 * 1024 * 1024;
const PROJECT_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const receiveProjectImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_PROJECT_IMAGE_SIZE,
        files: 1,
        fields: 0,
        parts: 1,
    },
    fileFilter: (req, file, callback) => {
        if (!PROJECT_IMAGE_TYPES.has(file.mimetype)) {
            return callback(new Error("Unsupported project image type."));
        }
        return callback(null, true);
    },
}).single("image");

function hasExpectedImageSignature(buffer, mimetype) {
    if (!Buffer.isBuffer(buffer)) return false;

    if (mimetype === "image/jpeg") {
        return buffer.length >= 3 &&
            buffer[0] === 0xff &&
            buffer[1] === 0xd8 &&
            buffer[2] === 0xff;
    }

    if (mimetype === "image/png") {
        return buffer.length >= 8 &&
            buffer.subarray(0, 8).equals(
                Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
            );
    }

    return mimetype === "image/webp" &&
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";
}

function requireCloudinaryConfig(req, res, next) {
    const configured = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ].every((name) => Boolean(process.env[name]));

    if (!configured) {
        return res.status(503).json({
            success: false,
            message: "Image uploads are not configured.",
        });
    }

    return next();
}

function parseProjectImage(req, res, next) {
    receiveProjectImage(req, res, (error) => {
        if (error) {
            const isSizeLimit = error instanceof multer.MulterError &&
                error.code === "LIMIT_FILE_SIZE";
            return res.status(isSizeLimit ? 413 : 400).json({
                success: false,
                message: isSizeLimit
                    ? "Image files must be 5 MB or smaller."
                    : "Choose a JPG, JPEG, PNG, or WEBP image.",
            });
        }

        if (!req.file || !hasExpectedImageSignature(req.file.buffer, req.file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "The selected file is not a valid JPG, PNG, or WEBP image.",
            });
        }

        return next();
    });
}

async function uploadProjectImage(req, res) {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "nisha-portfolio/projects",
                    resource_type: "image",
                    allowed_formats: ["jpg", "jpeg", "png", "webp"],
                },
                (error, uploadedImage) => {
                    if (error) return reject(error);
                    return resolve(uploadedImage);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        if (typeof result?.secure_url !== "string" ||
            !result.secure_url.startsWith("https://")) {
            throw new Error("Cloudinary did not return a secure image URL.");
        }

        return res.status(201).json({
            success: true,
            imageUrl: result.secure_url,
        });
    } catch (error) {
        console.error("Cloudinary project image upload failed:", error?.name || "Error");
        return res.status(502).json({
            success: false,
            message: "Image upload failed. Please try again.",
        });
    }
}

router.post(
    "/upload-image",
    authMiddleware,
    requireCloudinaryConfig,
    parseProjectImage,
    uploadProjectImage
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