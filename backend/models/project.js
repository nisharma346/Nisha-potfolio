
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
            validate: {
                validator: (value) =>
                    typeof value === "string" &&
                    !/^(?:[a-z]:[\\/]|\\\\|file:)/i.test(value.trim()),
                message: "Project image must be a public URL, not a local file path.",
            },
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
