
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        technologies: {
            type: [String],
            default: [],
        },

        image: {
            type: String,
            default: "",
        },

        liveUrl: {
            type: String,
            default: "",
        },

        githubUrl: {
            type: String,
            default: "",
        },

        featured: {
            type: Boolean,
            default: false,
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

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
