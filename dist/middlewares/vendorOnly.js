"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorOnly = void 0;
const vendorOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "vendor") {
        return res.status(403).json({ message: "Vendor access only" });
    }
    next();
};
exports.vendorOnly = vendorOnly;
