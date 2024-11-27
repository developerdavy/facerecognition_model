const mongoose = require("mongoose");

// User Schema
const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        contributions: {
            type: [Number], // Array of contribution amounts
            default: [],
        },
        target: {
            type: Number,
            default: 10,
        },
        currentContribution: {
            type: Number,
            default: 0,
        },
        balance: {
            type: Number,
            default: function () {
                return this.target;
            },
        },
    },
    { timestamps: true }
);

// Contribution Schema
const contributionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Create Models
const User = mongoose.model("users", userSchema);
const Contribution = mongoose.model("contributions", contributionSchema);

// Export Models
module.exports = { User, Contribution };
