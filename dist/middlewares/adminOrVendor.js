"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrVendor = void 0;
const adminOrVendor = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user.role !== "admin" && req.user.role !== "vendor") {
        return res.status(403).json({ message: "Admin or Vendor access only" });
    }
    next();
};
exports.adminOrVendor = adminOrVendor;
