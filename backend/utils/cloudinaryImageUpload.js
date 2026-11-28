const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

function createImageUploadMiddleware(folder) {
    const receiveImage = multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: MAX_IMAGE_SIZE,
            files: 1,
            fields: 0,
            parts: 1,
        },
        fileFilter: (req, file, callback) => {
            if (!IMAGE_TYPES.has(file.mimetype)) {
                return callback(new Error("Unsupported image type."));
            }
            return callback(null, true);
        },
    }).single("image");

    function parseImage(req, res, next) {
        receiveImage(req, res, (error) => {
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
                    message: "The selected file is not a valid JPG, JPEG, PNG, or WEBP image.",
                });
            }

            return next();
        });
    }

    async function uploadImage(req, res) {
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
                        folder,
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
            console.error("Cloudinary image upload failed:", error?.name || "Error");
            return res.status(502).json({
                success: false,
                message: "Image upload failed. Please try again.",
            });
        }
    }

    return [requireCloudinaryConfig, parseImage, uploadImage];
}

module.exports = createImageUploadMiddleware;
