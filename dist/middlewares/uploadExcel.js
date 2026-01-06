"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadImage = exports.uploadExcel = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const axios_1 = __importDefault(require("axios"));
const excelDir = "uploads/excel";
if (!fs_1.default.existsSync(excelDir)) {
    fs_1.default.mkdirSync(excelDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, excelDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path_1.default.extname(file.originalname));
    },
});
const normalizeImageUrl = (url) => {
    // Fix Unsplash URLs
    if (url.includes("images.unsplash.com") && !url.includes("?")) {
        return `${url}?auto=format&fit=crop&w=800&q=80`;
    }
    return url;
};
exports.uploadExcel = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            cb(null, true);
        }
        else {
            cb(new Error("Only Excel (.xlsx) files allowed"));
        }
    },
});
const downloadImage = async (imageUrl, folder) => {
    const ext = ".jpg"; // force jpg
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const uploadDir = path_1.default.join("uploads", folder);
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path_1.default.join(uploadDir, filename);
    const response = await axios_1.default.get(imageUrl, {
        responseType: "stream",
        timeout: 10000,
    });
    const writer = fs_1.default.createWriteStream(filePath);
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(`/uploads/${folder}/${filename}`));
        writer.on("error", reject);
    });
};
exports.downloadImage = downloadImage;
