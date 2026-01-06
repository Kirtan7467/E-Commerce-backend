import Cart from "../models/cart.model";
import Product from "../models/product.model";
import { AuthRequest } from "../types/auth";
import { Response } from "express";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

export const addToCart = async (req: AuthRequest, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  let cart = await Cart.findOne({ user: req.user.userId });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.userId,
      items: [],
      totalPrice: 0,
    });
  }

  const index = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (index > -1) {
    cart.items[index].quantity += quantity;
  } else {
    cart.items.push({
      product: product._id,
      title: product.title,
      quantity,
      price: product.price,                                                                                         
    });
  }

  cart.totalPrice = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  await cart.save();
  res.json(cart);
};
export const getCart = async (req: AuthRequest, res: Response) => {
  
  const cart = await Cart.findOne({ user: req.user!.userId }).populate(
    "items.product"
  );
  

  res.json({
  items: cart?.items || [],
  totalPrice: cart?.totalPrice || 0,
});
};

export const mergeCart = async (req: AuthRequest, res: Response) => {
  const { items } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    cart = new Cart({
      user: req.user.userId,
      items: [],
      totalPrice: 0,
    });
  }

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const index = cart.items.findIndex(
      (i) => i.product.toString() === item.productId
    );

    if (index > -1) {
      cart.items[index].quantity += item.quantity;
    } else {
      cart.items.push({
        product: item.productId,
        title: product.title,
        quantity: item.quantity,
        price: product.price, // ✅ FIX
      });
    }
  }

  cart.totalPrice = cart.items.reduce(
    (sum, i) => sum + i.quantity * i.price,
    0
  );

  await cart.save();
  res.json({ message: "Cart merged successfully" });
};


/**
 * UPDATE CART ITEM QUANTITY
 */
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;

  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!productId || quantity === undefined) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "ProductId and quantity are required"
    );
  }

  if (quantity < 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found in cart");
  }

  //  Update quantity
  cart.items[itemIndex].quantity = quantity;

  //  Recalculate total price
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await cart.save();

  res.status(httpStatus.OK).json({
    message: "Cart item updated",
    cart,
  });
};

/**
 * REMOVE ITEM FROM CART
 */
export const removeCartItem = async (req: AuthRequest, res: Response) => {
  const { productId } = req.params;

  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  if (!productId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "ProductId is required");
  }

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
  }

  const initialLength = cart.items.length;

  //  Remove item
  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found in cart");
  }

  //  Recalculate total price
  cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  await cart.save();

  res.status(httpStatus.OK).json({
    message: "Item removed from cart",
    cart,
  });
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const cart = await Cart.findOne({ user: req.user.userId });
  if (!cart) {
    throw new ApiError(httpStatus.NOT_FOUND, "Cart not found");
  }

  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();

  res.status(httpStatus.OK).json({
    message: "Cart cleared successfully",
    cart,
  });
};
