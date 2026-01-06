"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateBanner = exports.activateBanner = exports.deleteBanner = exports.updateBanner = exports.getBannerById = exports.getBanners = exports.createBanner = void 0;
const http_status_1 = __importDefault(require("http-status"));
const banner_model_1 = __importDefault(require("../models/banner.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
/**
 * CREATE BANNER (Admin)
 */
const createBanner = async (req, res) => {
    const { title, link, isActive } = req.body;
    if (!req.file) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Banner image is required");
    }
    const banner = await banner_model_1.default.create({
        title,
        link,
        isActive: isActive ?? true,
        image: `/uploads/banners/${req.file.filename}`,
    });
    res.status(http_status_1.default.CREATED).json({
        message: "Banner created successfully",
        banner,
    });
};
exports.createBanner = createBanner;
/**
 * GET ALL BANNERS (Public)
 */
const getBanners = async (req, res) => {
    const banners = await banner_model_1.default.find().sort({
        createdAt: -1,
    });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedProducts = banners.map((p) => ({
        ...p.toObject(),
        image: `${baseUrl}${p.image}`,
    }));
    res.status(http_status_1.default.OK).json({
        count: formattedProducts.length,
        banners: formattedProducts,
    });
};
exports.getBanners = getBanners;
/**
 * GET SINGLE BANNER BY ID
 */
const getBannerById = async (req, res) => {
    const banner = await banner_model_1.default.findById(req.params.id);
    if (!banner) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    res.status(http_status_1.default.OK).json(banner);
};
exports.getBannerById = getBannerById;
/**
 * UPDATE BANNER (Admin)
 */
const updateBanner = async (req, res) => {
    const banner = await banner_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!banner) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Banner updated successfully",
        banner,
    });
};
exports.updateBanner = updateBanner;
/**
 * DELETE BANNER (Admin)
 */
const deleteBanner = async (req, res) => {
    const banner = await banner_model_1.default.findByIdAndDelete(req.params.id);
    if (!banner) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Banner deleted successfully",
    });
};
exports.deleteBanner = deleteBanner;
const activateBanner = async (req, res) => {
    const banner = await banner_model_1.default.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!banner) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Banner activated successfully",
        banner,
    });
};
exports.activateBanner = activateBanner;
const deactivateBanner = async (req, res) => {
    const banner = await banner_model_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!banner) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Banner deactivated successfully",
        banner,
    });
};
exports.deactivateBanner = deactivateBanner;
