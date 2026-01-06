"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController = __importStar(require("../controllers/product.controller"));
const auth_1 = require("../middlewares/auth");
const upload_1 = require("../middlewares/upload");
const adminOrVendor_1 = require("../middlewares/adminOrVendor");
const vendorOnly_1 = require("../middlewares/vendorOnly");
const uploadExcel_1 = require("../middlewares/uploadExcel");
const router = (0, express_1.Router)();
router.get("/", productController.getProducts);
router.get("/vendor", auth_1.protect, vendorOnly_1.vendorOnly, productController.getVendorProducts);
router.get("/:id", productController.getProductById);
router.post("/upload-excel", auth_1.protect, vendorOnly_1.vendorOnly, uploadExcel_1.uploadExcel.single("file"), productController.uploadProductsExcel);
router.post("/", auth_1.protect, vendorOnly_1.vendorOnly, upload_1.productUpload.single("image"), productController.createProduct);
router.put("/:id", auth_1.protect, adminOrVendor_1.adminOrVendor, upload_1.productUpload.single("image"), productController.updateProduct);
router.delete("/:id", auth_1.protect, adminOrVendor_1.adminOrVendor, productController.deleteProduct);
router.patch("/:id/activate", auth_1.protect, adminOrVendor_1.adminOrVendor, productController.activateProduct);
router.patch("/:id/deactivate", auth_1.protect, adminOrVendor_1.adminOrVendor, productController.deactivateProduct);
exports.default = router;
