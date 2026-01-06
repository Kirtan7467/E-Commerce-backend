"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sendEmail_1 = require("../utils/sendEmail");
const register = async (req, res) => {
    const { firstname, lastname, username, contact, email, password } = req.body;
    const existingUser = await user_model_1.User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        return res.status(500).json({ message: "JWT_SECRET not defined" });
    }
    const hashedPass = await bcrypt_1.default.hash(password, 10);
    const user = await user_model_1.User.create({
        firstname,
        lastname,
        username,
        contact,
        email,
        password: hashedPass,
    });
    const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "2h" });
    res.status(201).json({
        message: "Registered successfully",
        token,
        user: {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            contact: user.contact,
            email: user.email,
            role: user.role,
        },
    });
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            return res.status(500).json({ message: "JWT_SECRET not defined" });
        }
        if (!email || !password) {
            return res
                .status(400)
                .json({ message: "Email and password are required" });
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: "2h" });
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                userId: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                contact: user.contact,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Login error",
            error: error instanceof Error ? error.message : error,
        });
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const otp = crypto_1.default.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    try {
        await (0, sendEmail_1.sendEmail)(email, "Reset Password OTP", `
        <h2>Password Reset</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 10 minutes</p>
      `);
    }
    catch (error) {
        console.error("Email send failed:", error);
        return res.status(500).json({ message: "Failed to send OTP email" });
    }
    res.json({ message: "OTP sent to email" });
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await user_model_1.User.findOne({ email });
    if (!user ||
        user.otp !== otp ||
        !user.otpExpires ||
        user.otpExpires < new Date()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: "Password reset successful" });
};
exports.resetPassword = resetPassword;
