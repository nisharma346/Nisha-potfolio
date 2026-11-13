
const mongoose = require("mongoose");

const aboutSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            required: true,
        },

        shortBio: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            default: "",
        },

        profileImage: {
            type: String,
            default: "",
        },

        resumeUrl: {
            type: String,
            default: "",
        },

        education: {
            type: String,
            default: "",
        },

        location: {
            type: String,
            default: "",
        },

        email: {
            type: String,
            default: "",
        },

        isVisible: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const About = mongoose.model("About", aboutSchema);

module.exports = About;
