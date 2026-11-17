
const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            default: "",
            trim: true,
        },

        company: {
            type: String,
            default: "",
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            default: "",
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 5,
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

const Testimonial = mongoose.model(
    "Testimonial",
    testimonialSchema
);

module.exports = Testimonial;
