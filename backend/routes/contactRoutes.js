
const express = require("express");
const sendApiError = require("../utils/apiError");
const mongoose = require("mongoose");
const Contact = require("../models/Contact");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET: List contact messages for admins
router.get("/", authMiddleware, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: contacts.length,
            contacts,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// POST: Submit contact message
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body || {};

        const values = [name, email, subject, message];
        if (values.some((value) => typeof value !== "string" || !value.trim())) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
            });
        }

        const contact = await Contact.create({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
        });

        res.status(201).json({
            success: true,
            message: "Contact message submitted successfully!",
            contact,
        });

    } catch (error) {
        return sendApiError(res, error);
    }
});

// PUT: Update a contact message status for admins
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact message ID",
            });
        }

        const allowedStatuses = ["new", "read", "replied"];
        if (!allowedStatuses.includes(req.body.status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be new, read, or replied",
            });
        }

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact message status updated successfully!",
            contact,
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

// DELETE: Remove a contact message for admins
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact message ID",
            });
        }

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Contact message deleted successfully!",
        });
    } catch (error) {
        return sendApiError(res, error);
    }
});

module.exports = router;
