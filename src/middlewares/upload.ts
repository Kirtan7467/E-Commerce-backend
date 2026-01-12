import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";
import ApiError from "../utils/ApiError";

/**
 * ✅ IMAGE FILE FILTER
 */
const imageFileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowed.includes(file.mimetype)) {
    return cb(
      new ApiError(400, "Only JPG, JPEG, PNG images are allowed")
    );
  }

  cb(null, true);
};

/**
 * ✅ CLOUDINARY PRODUCT STORAGE
 * IMPORTANT: params MUST be a function (TS requirement)
 */
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [
      { width: 800, height: 800, crop: "limit" },
    ],
  }),
});

/**
 * ✅ CLOUDINARY BANNER STORAGE
 */
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "ecommerce/banners",
    allowed_formats: ["jpg", "jpeg", "png"],
  }),
});

/**
 * ✅ MULTER EXPORTS
 */
export const productUpload = multer({
  storage: productStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
