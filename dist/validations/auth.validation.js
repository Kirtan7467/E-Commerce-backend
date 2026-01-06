"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.vendorregister = exports.register = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("./custom.validation");
exports.register = {
    body: joi_1.default.object({
        firstname: joi_1.default.string().required(),
        lastname: joi_1.default.string().required(),
        username: joi_1.default.string().required(),
        contact: joi_1.default.string().custom(custom_validation_1.phoneNumber),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required().custom(custom_validation_1.password),
    }),
};
exports.vendorregister = {
    body: joi_1.default.object({
        firstname: joi_1.default.string().required(),
        lastname: joi_1.default.string().required(),
        username: joi_1.default.string().required(),
        contact: joi_1.default.string().custom(custom_validation_1.phoneNumber),
        shopName: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().required().custom(custom_validation_1.password),
    }),
};
exports.login = {
    body: joi_1.default.object({
        email: joi_1.default.string().required(),
        password: joi_1.default.string().required(),
    }),
};
// export const logout = {
//   body: Joi.object({
//     refreshToken: Joi.string().required(),
//   }),
// };
// export const refreshTokens = {
//   body: Joi.object({
//     refreshToken: Joi.string().required(),
//   }),
// };
exports.forgotPassword = {
    body: joi_1.default.object({
        email: joi_1.default.string().email().required(),
    }),
};
exports.resetPassword = {
    query: joi_1.default.object({
        token: joi_1.default.string().required(),
    }),
    body: joi_1.default.object({
        email: joi_1.default.string().email().required(),
        otp: joi_1.default.string().required(),
        newPassword: joi_1.default.string().required().custom(custom_validation_1.password),
    }),
};
// export const verifyEmail = {
//   query: Joi.object({
//     token: Joi.string().required(),
//   }),
// };
