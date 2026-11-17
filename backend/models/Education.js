
const mongoose = require("mongoose");

const educationSchema = new mongoose.Schema(
    {
        degree: {
            type: String,
            required: true,
            trim: true,
        },

        institution: {
            type: String,
            required: true,
            trim: true,
        },

        fieldOfStudy: {
            type: String,
            default: "",
        },

        startYear: {
            type: String,
            default: "",
        },

        endYear: {
            type: String,
            default: "",
        },

        grade: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        displayOrder: {
            type: Number,
            default: 0,
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

const Education = mongoose.model("Education", educationSchema);

module.exports = Education;