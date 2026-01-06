"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendors = exports.rejectVendor = exports.approveVendor = void 0;
const vendor_model_1 = __importDefault(require("../models/vendor.model"));
const user_model_1 = require("../models/user.model");
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const approveVendor = async (req, res) => {
    const vendor = await vendor_model_1.default.findById(req.params.id);
    if (!vendor) {
        throw new ApiError_1.default(404, "Vendor not found");
    }
    vendor.status = "approved";
    await vendor.save();
    await user_model_1.User.findByIdAndUpdate(vendor.user, {
        role: "vendor",
    });
    res.json({ message: "Vendor approved successfully" });
};
exports.approveVendor = approveVendor;
const rejectVendor = async (req, res) => {
    const vendor = await vendor_model_1.default.findById(req.params.id);
    if (!vendor) {
        throw new ApiError_1.default(404, "Vendor not found");
    }
    vendor.status = "rejected";
    await vendor.save();
    // Optional: ensure user role stays "user"
    await user_model_1.User.findByIdAndUpdate(vendor.user, {
        role: "user",
    });
    res.status(200).json({
        message: "Vendor rejected successfully",
    });
};
exports.rejectVendor = rejectVendor;
const getVendors = async (_req, res) => {
    const vendors = await vendor_model_1.default.find().populate("user", "email role");
    res.json({ count: vendors.length, vendors });
};
exports.getVendors = getVendors;
