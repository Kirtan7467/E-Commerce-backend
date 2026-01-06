"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
dotenv_1.default.config();
const seedAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URL);
        const adminEmail = "admin@gmail.com";
        const adminExists = await user_model_1.User.findOne({ email: adminEmail });
        if (adminExists) {
            console.log("✅ Admin already exists");
            process.exit(0);
        }
        const adminPassword = await bcrypt_1.default.hash("admin123", 10);
        await user_model_1.User.create({
            firstname: "Admin",
            lastname: "patel",
            username: "admin",
            contact: "99999998",
            email: adminEmail,
            password: adminPassword,
            role: "admin",
        });
        console.log("✅ Admin user seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Admin seed failed:", error);
        process.exit(1);
    }
};
seedAdmin();
