
const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            required: true,
            trim: true,
        },

        company: {
            type: String,
            required: true,
            trim: true,
        },

        employmentType: {
            type: String,
            default: "Other",
        },

        location: {
            type: String,
            default: "",
        },

        startDate: {
            type: String,
            default: "",
        },

        endDate: {
            type: String,
            default: "",
        },

        currentlyWorking: {
            type: Boolean,
            default: false,
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

const Experience = mongoose.model("Experience", experienceSchema);

module.exports = Experience;