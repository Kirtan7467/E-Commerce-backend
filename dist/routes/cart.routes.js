"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Get current user's cart
router.get("/", auth_1.protect, cart_controller_1.getCart);
// Add product to cart
router.post("/add", auth_1.protect, cart_controller_1.addToCart);
// merge product to cart
router.post("/merge", auth_1.protect, cart_controller_1.mergeCart);
// Update product quantity
router.put("/update", auth_1.protect, cart_controller_1.updateCartItem);
// Remove product from cart
router.delete("/remove/:productId", auth_1.protect, cart_controller_1.removeCartItem);
// Clear entire cart
router.delete("/clear", auth_1.protect, cart_controller_1.clearCart);
exports.default = router;
