
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const About = require("../models/About");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { randomUUID } = require("crypto");

const router = express.Router();
const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const PROFILE_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
]);
const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const RESUME_MIME_TYPES = new Set([
    "application/pdf",
    "application/octet-stream",
]);

const receiveProfileImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_PROFILE_IMAGE_SIZE,
        files: 1,
        fields: 0,
        parts: 1,
    },
    fileFilter: (req, file, callback) => {
        if (!PROFILE_IMAGE_TYPES.has(file.mimetype)) {
            return callback(new Error("Unsupported profile image type."));
        }
        return callback(null, true);
    },
}).single("image");

const receiveResume = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_RESUME_SIZE,
        files: 1,
        fields: 0,
        parts: 1,
    },
    fileFilter: (req, file, callback) => {
        if (
            !file.originalname.toLowerCase().endsWith(".pdf") ||
            !RESUME_MIME_TYPES.has(file.mimetype)
        ) {
            return callback(new Error("Unsupported resume file type."));
        }
        return callback(null, true);
    },
}).single("resume");

function hasPdfSignature(buffer) {
    if (!Buffer.isBuffer(buffer)) return false;
    const header = buffer.subarray(0, Math.min(buffer.length, 1024));
    return header.indexOf(Buffer.from("%PDF-")) !== -1;
}

function getResumePublicId(resumeUrl) {
    const storagePrefix = "cloudinary:raw:";
    let publicId = "";

    if (typeof resumeUrl === "string" && resumeUrl.startsWith(storagePrefix)) {
        [publicId] = resumeUrl.slice(storagePrefix.length).split("|", 1);
    } else if (typeof resumeUrl === "string") {
        try {
            const url = new URL(resumeUrl);
            const segments = url.pathname.split("/").filter(Boolean);
            const [
                cloudName,
                resourceType,
                deliveryType,
                signature,
                version,
                ...publicIdSegments
            ] = segments;

            if (
                url.protocol !== "https:" ||
                url.hostname !== "res.cloudinary.com" ||
                cloudName !== process.env.CLOUDINARY_CLOUD_NAME ||
                resourceType !== "raw" ||
                deliveryType !== "authenticated" ||
                !/^s--[a-z0-9_-]+--$/i.test(signature || "") ||
                !/^v\d+$/.test(version || "")
            ) {
                return "";
            }

            publicId = publicIdSegments.join("/");
        } catch {
            return "";
        }
    }

    return /^nisha-portfolio\/about\/resumes\/resume-[0-9a-f-]{36}\.pdf$/i.test(
        publicId
    )
        ? publicId
        : "";
}

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
            message: "Profile image uploads are not configured on the backend.",
        });
    }

    return next();
}

function parseProfileImage(req, res, next) {
    receiveProfileImage(req, res, (error) => {
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

function requireResumeCloudinaryConfig(req, res, next) {
    const configured = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ].every((name) => Boolean(process.env[name]));

    if (!configured) {
        return res.status(503).json({
            success: false,
            message: "Resume storage is not configured on the backend.",
        });
    }

    return next();
}

function parseResume(req, res, next) {
    receiveResume(req, res, (error) => {
        if (error) {
            const isSizeLimit = error instanceof multer.MulterError &&
                error.code === "LIMIT_FILE_SIZE";
            return res.status(isSizeLimit ? 413 : 400).json({
                success: false,
                message: isSizeLimit
                    ? "Resume files must be 10 MB or smaller."
                    : "Choose a PDF resume file.",
            });
        }

        if (!req.file || !hasPdfSignature(req.file.buffer)) {
            return res.status(400).json({
                success: false,
                message: "The selected file is not a valid PDF.",
            });
        }

        return next();
    });
}

async function removeUploadedResume(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw",
            type: "authenticated",
            invalidate: true,
        });

        if (result?.result !== "ok") {
            console.error("Cloudinary temporary resume cleanup failed.");
        }
    } catch (error) {
        console.error(
            "Cloudinary temporary resume cleanup failed:",
            error?.name || "Error"
        );
    }
}

async function uploadResume(req, res) {
    let existingAbout;
    try {
        existingAbout = await About.findOne();
    } catch (error) {
        console.error("About record lookup failed:", error?.name || "Error");
        return res.status(500).json({
            success: false,
            message: "About information could not be loaded for the resume upload.",
        });
    }

    if (!existingAbout) {
        return res.status(404).json({
            success: false,
            message: "There is no About record to save this resume to.",
        });
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    const publicId = `nisha-portfolio/about/resumes/resume-${randomUUID()}.pdf`;
    let result;
    try {
        result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: publicId,
                    resource_type: "raw",
                    type: "authenticated",
                    access_mode: "authenticated",
                    allowed_formats: ["pdf"],
                    filename_override: req.file.originalname,
                },
                (error, uploadedResume) => {
                    if (error) return reject(error);
                    return resolve(uploadedResume);
                }
            );
            uploadStream.end(req.file.buffer);
        });
    } catch (error) {
        console.error("Cloudinary resume upload failed:", error?.name || "Error");
        return res.status(502).json({
            success: false,
            message: "Resume upload failed. Please try again.",
        });
    }

    if (
        result?.public_id !== publicId ||
        result?.type !== "authenticated" ||
        typeof result?.secure_url !== "string" ||
        !result.secure_url.startsWith("https://") ||
        getResumePublicId(result.secure_url) !== publicId
    ) {
        if (result?.public_id) await removeUploadedResume(result.public_id);
        console.error("Cloudinary returned an unexpected resume asset.");
        return res.status(502).json({
            success: false,
            message: "Resume upload failed. Please try again.",
        });
    }

    const resumeUrl = `${result.secure_url}#filename=${encodeURIComponent(req.file.originalname)}`;
    let about;
    try {
        about = await About.findByIdAndUpdate(
            existingAbout._id,
            { resumeUrl },
            { returnDocument: "after", runValidators: true }
        );
    } catch (error) {
        await removeUploadedResume(result.public_id);
        console.error("About resume save failed:", error?.name || "Error");
        return res.status(500).json({
            success: false,
            message: "The resume uploaded but could not be saved to About information.",
        });
    }

    if (!about) {
        await removeUploadedResume(result.public_id);
        return res.status(404).json({
            success: false,
            message: "The About record no longer exists.",
        });
    }

    return res.status(201).json({
        success: true,
        message: "Resume uploaded and saved successfully.",
        resumeUrl: about.resumeUrl,
        about: {
            _id: about._id,
            resumeUrl: about.resumeUrl,
            updatedAt: about.updatedAt,
        },
    });
}

async function uploadProfileImage(req, res) {
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
                    folder: "nisha-portfolio/about",
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
        console.error("Cloudinary profile image upload failed:", error?.name || "Error");
        return res.status(502).json({
            success: false,
            message: "Profile image upload failed. Please try again.",
        });
    }
}

async function downloadResume(req, res) {
    try {
        const about = await About.findOne().select("resumeUrl");
        const resumePath = about?.resumeUrl || "";

        if (!resumePath) {
            return res.status(404).json({
                success: false,
                message: "No resume is currently available.",
            });
        }

        const publicId = getResumePublicId(resumePath);
        if (!publicId) {
            return res.status(404).json({
                success: false,
                message: "The stored resume file is unavailable.",
            });
        }

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        });

        const downloadUrl = cloudinary.utils.private_download_url(
            publicId,
            "pdf",
            {
                resource_type: "raw",
                type: "authenticated",
                expires_at: Math.floor(Date.now() / 1000) + 120,
                attachment: true,
            }
        );
        const fileResponse = await fetch(downloadUrl, {
            cache: "no-store",
            signal: AbortSignal.timeout(60000),
        });

        if (!fileResponse.ok) {
            console.error("Cloudinary resume download failed:", fileResponse.status);
            return res.status(502).json({
                success: false,
                message: "The resume file could not be retrieved.",
            });
        }

        const file = Buffer.from(await fileResponse.arrayBuffer());
        if (
            file.length === 0 ||
            file.length > MAX_RESUME_SIZE ||
            !hasPdfSignature(file)
        ) {
            return res.status(502).json({
                success: false,
                message: "The stored resume file is invalid.",
            });
        }

        return res
            .status(200)
            .set({
                "Content-Type": "application/pdf",
                "Content-Length": String(file.length),
                "Content-Disposition": 'attachment; filename="resume.pdf"',
                "Cache-Control": "no-store",
                "X-Content-Type-Options": "nosniff",
            })
            .send(file);
    } catch (error) {
        console.error("Resume download failed:", error?.name || "Error");
        return res.status(502).json({
            success: false,
            message: "The resume file could not be retrieved.",
        });
    }
}

router.post(
    "/upload-image",
    authMiddleware,
    requireCloudinaryConfig,
    parseProfileImage,
    uploadProfileImage
);

router.post(
    "/upload-resume",
    authMiddleware,
    requireResumeCloudinaryConfig,
    parseResume,
    uploadResume
);

router.get("/resume", requireResumeCloudinaryConfig, downloadResume);

// GET: About details
router.get("/", async (req, res) => {
    try {
        const about = await About.findOne();

        res.status(200).json({
            success: true,
            about: about?.isVisible === false ? null : about,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// GET: About details for admins, including hidden information
router.get("/admin", authMiddleware, async (req, res) => {
    try {
        const about = await About.findOne();

        res.status(200).json({
            success: true,
            about,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// POST: Create About details
router.post("/", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

// PUT: Update About details
router.put("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

// DELETE: Remove About details
router.delete("/:id", authMiddleware, async (req, res) => {
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
        return sendApiError(res, error);
    }
});

module.exports = router;
