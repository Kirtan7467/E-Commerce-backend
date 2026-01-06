"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductsExcel = exports.deleteProduct = exports.deactivateProduct = exports.activateProduct = exports.updateProduct = exports.getProductById = exports.getVendorProducts = exports.getProducts = exports.createProduct = void 0;
const http_status_1 = __importDefault(require("http-status"));
const product_model_1 = __importDefault(require("../models/product.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const uploadExcel_1 = require("../middlewares/uploadExcel");
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
/**
 * VENDOR: CREATE PRODUCT
 */
const createProduct = async (req, res) => {
    const { title, description, price, isActive } = req.body;
    if (!req.user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const userId = req.user.userId;
    if (!req.file) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Image is required");
    }
    const product = await product_model_1.default.create({
        title,
        description,
        image: `/uploads/products/${req.file.filename}`,
        price: Number(price),
        isActive: isActive ?? true,
        vendor: userId,
    });
    res.status(http_status_1.default.CREATED).json({
        message: "Product created successfully",
        product,
    });
};
exports.createProduct = createProduct;
/**
 * GET ALL PRODUCTS (Public)
 */
const getProducts = async (req, res) => {
    const products = await product_model_1.default.find({ isActive: true }).populate("vendor", "shopName username firstname lastname");
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedProducts = products.map((p) => ({
        ...p.toObject(),
        image: `${baseUrl}${p.image}`,
    }));
    res.status(http_status_1.default.OK).json({
        count: formattedProducts.length,
        products: formattedProducts,
    });
};
exports.getProducts = getProducts;
// GET /vendor/products
const getVendorProducts = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "vendor") {
        return res.status(403).json({ message: "Only vendors allowed" });
    }
    const products = await product_model_1.default.find({
        vendor: req.user.userId, // 🔥 ONLY vendor’s products
    }).sort({ createdAt: -1 });
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedProducts = products.map((p) => ({
        ...p.toObject(),
        image: `${baseUrl}${p.image}`,
    }));
    res.status(200).json({
        count: formattedProducts.length,
        products: formattedProducts,
    });
};
exports.getVendorProducts = getVendorProducts;
/**
 * GET PRODUCT BY ID (Public)
 */
const getProductById = async (req, res) => {
    const product = await product_model_1.default.findById(req.params.id);
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    res.status(http_status_1.default.OK).json(product);
};
exports.getProductById = getProductById;
/**
 * UPDATE PRODUCT (Admin)
 */
const updateProduct = async (req, res) => {
    const product = await product_model_1.default.findById(req.params.id);
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    const { title, description, price, isActive } = req.body;
    if (title)
        product.title = title;
    if (description)
        product.description = description;
    if (price !== undefined)
        product.price = Number(price);
    if (isActive !== undefined)
        product.isActive = isActive;
    if (req.file) {
        product.image = `/uploads/products/${req.file.filename}`;
    }
    await product.save();
    res.status(http_status_1.default.OK).json({
        message: "Product updated successfully",
        product,
    });
};
exports.updateProduct = updateProduct;
/**
 * ACTIVATE PRODUCT (Admin)
 */
const activateProduct = async (req, res) => {
    const product = await product_model_1.default.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Product activated successfully",
        product,
    });
};
exports.activateProduct = activateProduct;
/**
 * DEACTIVATE PRODUCT (Admin)
 */
const deactivateProduct = async (req, res) => {
    const product = await product_model_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Product deactivated successfully",
        product,
    });
};
exports.deactivateProduct = deactivateProduct;
/**
 * DELETE PRODUCT (Admin) – HARD DELETE
 */
const deleteProduct = async (req, res) => {
    const product = await product_model_1.default.findByIdAndDelete(req.params.id);
    if (!product) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    res.status(http_status_1.default.OK).json({
        message: "Product deleted successfully",
    });
};
exports.deleteProduct = deleteProduct;
/**
 * BULK UPLOAD PRODUCTS USING EXCEL (Vendor)
 */
const uploadProductsExcel = async (req, res) => {
    // 🔐 Auth check
    if (!req.user || req.user.role !== "vendor") {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Vendor access only");
    }
    if (!req.user.userId) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, "Vendor ID missing");
    }
    // 📄 File check
    if (!req.file) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Excel file required");
    }
    // 📊 Read Excel
    const workbook = xlsx_1.default.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx_1.default.utils.sheet_to_json(sheet);
    if (!rows.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Excel file is empty");
    }
    const products = [];
    // 🔁 Process rows
    for (const row of rows) {
        if (!row.title || !row.price || !row.imageUrl) {
            continue;
        }
        let imagePath;
        try {
            imagePath = await (0, uploadExcel_1.downloadImage)(row.imageUrl, "products");
        }
        catch {
            // 🔥 Skip bad image rows safely
            continue;
        }
        products.push({
            title: row.title,
            description: row.description ?? "",
            price: Number(row.price),
            isActive: row.isActive ?? true,
            image: imagePath,
            vendor: req.user.userId,
        });
    }
    if (!products.length) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "No valid products found in Excel");
    }
    // 💾 Insert into DB
    await product_model_1.default.insertMany(products);
    // 🧹 Delete Excel after processing
    fs_1.default.unlinkSync(req.file.path);
    res.status(http_status_1.default.CREATED).json({
        message: "Products uploaded successfully",
        count: products.length,
    });
};
exports.uploadProductsExcel = uploadProductsExcel;
