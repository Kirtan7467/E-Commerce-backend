"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorRegister = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("../models/user.model");
const vendor_model_1 = __importDefault(require("../models/vendor.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const vendorRegister = async (req, res) => {
    const { firstname, lastname, username, contact, email, password, shopName, address, } = req.body;
    if (!email || !password || !shopName) {
        throw new ApiError_1.default(400, "All fields are required");
    }
    const existing = await user_model_1.User.findOne({ email });
    if (existing) {
        throw new ApiError_1.default(400, "Email already exists");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const user = await user_model_1.User.create({
        firstname,
        lastname,
        username,
        contact,
        email,
        password: hashedPassword,
        role: "user", // not vendor yet
    });
    const vendor = await vendor_model_1.default.create({
        user: user._id,
        shopName,
        email,
        username,
        contact: contact,
        address,
    });
    res.status(201).json({
        message: "Vendor registered. Waiting for admin approval.",
        vendorId: vendor._id,
    });
};
exports.vendorRegister = vendorRegister;
