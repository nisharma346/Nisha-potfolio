const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        issuer: {
            type: String,
            required: true,
            trim: true,
        },
        issueDate: {
            type: String,
            default: "",
        },
        credentialId: {
            type: String,
            default: "",
        },
        credentialUrl: {
            type: String,
            default: "",
        },
        image: {
            type: String,
            default: "",
        },
        description: {
            type: String,
            default: "",
        },
        isVisible: {
            type: Boolean,
            default: true,
        },
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Certification", certificationSchema);