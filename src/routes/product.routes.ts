import { Router } from "express";
import * as productController from "../controllers/product.controller";
import { protect } from "../middlewares/auth";
import { productUpload } from "../middlewares/upload";
import { adminOrVendor } from "../middlewares/adminOrVendor";
import { vendorOnly } from "../middlewares/vendorOnly";
import { uploadExcel } from "../middlewares/uploadExcel";

const router = Router();

router.get("/", productController.getProducts);
router.get("/vendor", protect, vendorOnly, productController.getVendorProducts);
router.get("/:id", productController.getProductById);

router.post(
  "/upload-excel",
  protect,
  vendorOnly,
  uploadExcel.single("file"),
  productController.uploadProductsExcel
);
router.post(
  "/",
  protect,
  vendorOnly,
  productUpload.array("image",5),
  productController.createProduct
);

router.put(
  "/:id",
  protect,
  adminOrVendor,
  productUpload.array("image",5),
  productController.updateProduct
);

router.delete("/:id", protect, adminOrVendor, productController.deleteProduct);

router.patch(
  "/:id/activate",
  protect,
  adminOrVendor,
  productController.activateProduct
);
router.patch(
  "/:id/deactivate",
  protect,
  adminOrVendor,
  productController.deactivateProduct
);

export default router;
