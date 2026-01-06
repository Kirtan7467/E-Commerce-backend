"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.mergeCart = exports.getCart = exports.addToCart = void 0;
const cart_model_1 = __importDefault(require("../models/cart.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const ApiError_1 = __importDefault(require("../utils/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const addToCart = async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const product = await product_model_1.default.findById(productId);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }
    let cart = await cart_model_1.default.findOne({ user: req.user.userId });
    if (!cart) {
        cart = await cart_model_1.default.create({
            user: req.user.userId,
            items: [],
            totalPrice: 0,
        });
    }
    const index = cart.items.findIndex((item) => item.product.toString() === productId);
    if (index > -1) {
        cart.items[index].quantity += quantity;
    }
    else {
        cart.items.push({
            product: product._id,
            title: product.title,
            quantity,
            price: product.price,
        });
    }
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    await cart.save();
    res.json(cart);
};
exports.addToCart = addToCart;
const getCart = async (req, res) => {
    const cart = await cart_model_1.default.findOne({ user: req.user.userId }).populate("items.product");
    res.json({
        items: cart?.items || [],
        totalPrice: cart?.totalPrice || 0,
    });
};
exports.getCart = getCart;
const mergeCart = async (req, res) => {
    const { items } = req.body;
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    let cart = await cart_model_1.default.findOne({ user: req.user.userId });
    if (!cart) {
        cart = new cart_model_1.default({
            user: req.user.userId,
            items: [],
            totalPrice: 0,
        });
    }
    for (const item of items) {
        const product = await product_model_1.default.findById(item.productId);
        if (!product)
            continue;
        const index = cart.items.findIndex((i) => i.product.toString() === item.productId);
        if (index > -1) {
            cart.items[index].quantity += item.quantity;
        }
        else {
            cart.items.push({
                product: item.productId,
                title: product.title,
                quantity: item.quantity,
                price: product.price, // ✅ FIX
            });
        }
    }
    cart.totalPrice = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    await cart.save();
    res.json({ message: "Cart merged successfully" });
};
exports.mergeCart = mergeCart;
/**
 * UPDATE CART ITEM QUANTITY
 */
const updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    if (!req.user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    if (!productId || quantity === undefined) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "ProductId and quantity are required");
    }
    if (quantity < 1) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Quantity must be at least 1");
    }
    const cart = await cart_model_1.default.findOne({ user: req.user.userId });
    if (!cart) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Cart not found");
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found in cart");
    }
    //  Update quantity
    cart.items[itemIndex].quantity = quantity;
    //  Recalculate total price
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    await cart.save();
    res.status(http_status_1.default.OK).json({
        message: "Cart item updated",
        cart,
    });
};
exports.updateCartItem = updateCartItem;
/**
 * REMOVE ITEM FROM CART
 */
const removeCartItem = async (req, res) => {
    const { productId } = req.params;
    if (!req.user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    if (!productId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "ProductId is required");
    }
    const cart = await cart_model_1.default.findOne({ user: req.user.userId });
    if (!cart) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Cart not found");
    }
    const initialLength = cart.items.length;
    //  Remove item
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    if (cart.items.length === initialLength) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Product not found in cart");
    }
    //  Recalculate total price
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    await cart.save();
    res.status(http_status_1.default.OK).json({
        message: "Item removed from cart",
        cart,
    });
};
exports.removeCartItem = removeCartItem;
const clearCart = async (req, res) => {
    if (!req.user) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    }
    const cart = await cart_model_1.default.findOne({ user: req.user.userId });
    if (!cart) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "Cart not found");
    }
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    res.status(http_status_1.default.OK).json({
        message: "Cart cleared successfully",
        cart,
    });
};
exports.clearCart = clearCart;
