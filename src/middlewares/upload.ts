import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError";
import { createHash } from "crypto";

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 🔥 Generate hash from file buffer
const generateHash = (buffer: Buffer) => {
  return createHash("sha256").update(buffer).digest("hex");
};

const createStorage = (folder: "products" | "banners") =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadPath = `uploads/${folder}`;
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueName + path.extname(file.originalname));
    },
  });

const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedExt = [".jpg", ".jpeg" ,".png"];

  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedMimeTypes.includes(file.mimetype) || !allowedExt.includes(ext)) {
    return cb(new ApiError(400, "Only JPG or JPEG images are allowed"));
  }

  cb(null, true);
};
export const productUpload = multer({
  storage: createStorage("products"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB only
  },
});

export const bannerUpload = multer({
  storage: createStorage("banners"),
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB only
  },
});

/**
 * 🔥 CUSTOM MIDDLEWARE TO REMOVE DUPLICATE IMAGES
 */
export const deduplicateImage = (folder: "products" | "banners") => {
  return (req: any, _res: any, next: any) => {
    if (!req.file) return next();

    const uploadPath = `uploads/${folder}`;
    const uploadedFilePath = req.file.path;

    const uploadedBuffer = fs.readFileSync(uploadedFilePath);
    const uploadedHash = generateHash(uploadedBuffer);

    const files = fs.readdirSync(uploadPath);

    for (const file of files) {
      const existingPath = path.join(uploadPath, file);
      const existingBuffer = fs.readFileSync(existingPath);
      const existingHash = generateHash(existingBuffer);

      if (uploadedHash === existingHash) {
        // 🔥 SAME IMAGE FOUND
        fs.unlinkSync(uploadedFilePath); // delete new copy

        // reuse existing image
        req.file.filename = file;
        req.file.path = existingPath;

        break;
      }
    }

    next();
  };
};




