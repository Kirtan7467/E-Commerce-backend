"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerUpload = exports.productUpload = exports.deduplicateImage = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const crypto_1 = require("crypto");
const ensureDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// 🔥 Generate hash from file buffer
const generateHash = (buffer) => {
    return (0, crypto_1.createHash)("sha256").update(buffer).digest("hex");
};
const createStorage = (folder) => multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        const uploadPath = `uploads/${folder}`;
        ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path_1.default.extname(file.originalname));
    },
});
const imageFileFilter = (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    const allowedExt = [".jpg", ".jpeg", ".png"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExt.includes(ext)) {
        return cb(new ApiError_1.default(400, "Only JPG or JPEG images are allowed"));
    }
    cb(null, true);
};
/**
 * 🔥 CUSTOM MIDDLEWARE TO REMOVE DUPLICATE IMAGES
 */
const deduplicateImage = (folder) => {
    return (req, _res, next) => {
        if (!req.file)
            return next();
        const uploadPath = `uploads/${folder}`;
        const uploadedFilePath = req.file.path;
        const uploadedBuffer = fs_1.default.readFileSync(uploadedFilePath);
        const uploadedHash = generateHash(uploadedBuffer);
        const files = fs_1.default.readdirSync(uploadPath);
        for (const file of files) {
            const existingPath = path_1.default.join(uploadPath, file);
            const existingBuffer = fs_1.default.readFileSync(existingPath);
            const existingHash = generateHash(existingBuffer);
            if (uploadedHash === existingHash) {
                // 🔥 SAME IMAGE FOUND
                fs_1.default.unlinkSync(uploadedFilePath); // delete new copy
                // reuse existing image
                req.file.filename = file;
                req.file.path = existingPath;
                break;
            }
        }
        next();
    };
};
exports.deduplicateImage = deduplicateImage;
exports.productUpload = (0, multer_1.default)({
    storage: createStorage("products"),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB only
    },
});
exports.bannerUpload = (0, multer_1.default)({
    storage: createStorage("banners"),
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB only
    },
});
