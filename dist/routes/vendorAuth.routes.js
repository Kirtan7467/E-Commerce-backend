"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const vendorAuth_controller_1 = require("../controllers/vendorAuth.controller");
const validate_1 = __importDefault(require("../middlewares/validate"));
const validations_1 = require("../validations");
const router = (0, express_1.Router)();
router.post("/register", (0, validate_1.default)(validations_1.authValidation.vendorregister), vendorAuth_controller_1.vendorRegister);
exports.default = router;
