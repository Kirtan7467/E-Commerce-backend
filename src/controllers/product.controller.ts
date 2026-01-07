import { Request, Response } from "express";
import httpStatus from "http-status";
import Product from "../models/product.model";
import ApiError from "../utils/ApiError";
import { downloadImage } from "../middlewares/uploadExcel";
import { AuthRequest } from "../middlewares/auth";
import XLSX from "xlsx";
import fs from "fs";

/**
 * VENDOR: CREATE PRODUCT
 */
export const createProduct = async (req: AuthRequest, res: Response) => {
  const { title, description, price, isActive } = req.body;
  if (!req.user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const userId = req.user.userId;

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
  }

  const product = await Product.create({
    title,
    description,
    image: `/uploads/products/${req.file.filename}`,
    price: Number(price),
    isActive: isActive ?? true,
    vendor: userId,
  });

  res.status(httpStatus.CREATED).json({
    message: "Product created successfully",
    product,
  });
};

/**
 * GET ALL PRODUCTS (Public)
 */
export const getProducts = async (req: Request, res: Response) => {
  const {
    search,
    minPrice,
    maxPrice,
    sort,
    page = "1",
    limit = "10",
  } = req.query;

  // 🔍 Base query
  const query: any = {
    isActive: true,
  };

  // 🔍 Search by title / description
  if (search) {
    query.$or = [
      { title: { $regex: search as string, $options: "i" } },
      { description: { $regex: search as string, $options: "i" } },
    ];
  }

  // 💰 Price filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // 🔃 Sorting
  let sortOption: any = { createdAt: -1 }; // latest first
  if (sort === "price_asc") sortOption = { price: 1 };
  if (sort === "price_desc") sortOption = { price: -1 };

  // 📄 Pagination
  const pageNumber = Number(page);
  const pageSize = Number(limit);
  const skip = (pageNumber - 1) * pageSize;

  // 📦 Fetch products
  const products = await Product.find(query)
    .populate("vendor", "shopName username firstname lastname")
    .sort(sortOption)
    .skip(skip)
    .limit(pageSize);

  const total = await Product.countDocuments(query);

  // 🌐 Base URL for images
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  // 🖼 Format images (supports multiple images)
  const formattedProducts = products.map((p) => ({
  ...p.toObject(),
  image: `${baseUrl}${p.image}`, // ✅ string
}));


  res.status(httpStatus.OK).json({
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / pageSize),
    count: formattedProducts.length,
    products: formattedProducts,
  });
};

// GET /vendor/products

export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "vendor") {
    return res.status(403).json({ message: "Only vendors allowed" });
  }

  const products = await Product.find({
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

/**
 * GET PRODUCT BY ID (Public)
 */
export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  res.status(httpStatus.OK).json(product);
};

/**
 * UPDATE PRODUCT (Admin)
 */
export const updateProduct = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  const { title, description, price, isActive } = req.body;

  if (title) product.title = title;
  if (description) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (isActive !== undefined) product.isActive = isActive;

  if ((req as any).file) {
    product.image = `/uploads/products/${(req as any).file.filename}`;
  }

  await product.save();

  res.status(httpStatus.OK).json({
    message: "Product updated successfully",
    product,
  });
};

/**
 * ACTIVATE PRODUCT (Admin)
 */
export const activateProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: true },
    { new: true }
  );

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  res.status(httpStatus.OK).json({
    message: "Product activated successfully",
    product,
  });
};

/**
 * DEACTIVATE PRODUCT (Admin)
 */
export const deactivateProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  res.status(httpStatus.OK).json({
    message: "Product deactivated successfully",
    product,
  });
};

/**
 * DELETE PRODUCT (Admin) – HARD DELETE
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    throw new ApiError(httpStatus.NOT_FOUND, "Product not found");
  }

  res.status(httpStatus.OK).json({
    message: "Product deleted successfully",
  });
};


/**
 * BULK UPLOAD PRODUCTS USING EXCEL (Vendor)
 */
export const uploadProductsExcel = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // 🔐 Auth check
  if (!req.user || req.user.role !== "vendor") {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Vendor access only"
    );
  }

  if (!req.user.userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Vendor ID missing"
    );
  }

  // 📄 File check
  if (!req.file) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Excel file required"
    );
  }

  // 📊 Read Excel
  const workbook = XLSX.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<{
    title: string;
    description?: string;
    price: number | string;
    isActive?: boolean;
    imageUrl: string;
  }>(sheet);

  if (!rows.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Excel file is empty"
    );
  }

  const products: any[] = [];

  // 🔁 Process rows
  for (const row of rows) {
  if (!row.title || !row.price || !row.imageUrl) {
    continue;
  }

  let imagePath: string;

  try {
    imagePath = await downloadImage(
      row.imageUrl,
      "products"
    );
  } catch {
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
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No valid products found in Excel"
    );
  }

  // 💾 Insert into DB
  await Product.insertMany(products);

  // 🧹 Delete Excel after processing
  fs.unlinkSync(req.file.path);

  res.status(httpStatus.CREATED).json({
    message: "Products uploaded successfully",
    count: products.length,
  });
};


