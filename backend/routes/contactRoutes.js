
const express = require("express");
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// POST: Submit contact message
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contact = await Contact.create({
            name,
            email,
            subject,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Contact message submitted successfully!",
            contact,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
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
        res.status(400).json({
            success: false,
            message: error.message,
        });
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
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
