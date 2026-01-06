"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phoneNumber = exports.password = exports.objectId = void 0;
const objectId = (value, helpers) => {
    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
        return helpers.error("any.invalid", {
            message: `"{{#label}}" must be a valid MongoDB ObjectId`,
        });
    }
    return value;
};
exports.objectId = objectId;
const password = (value, helpers) => {
    if (value.length < 8) {
        return helpers.error("any.invalid", {
            message: "password must be at least 8 characters",
        });
    }
    if (!/\d/.test(value) || !/[a-zA-Z]/.test(value)) {
        return helpers.error("any.invalid", {
            message: "password must contain at least 1 letter and 1 number",
        });
    }
    return value;
};
exports.password = password;
const phoneNumber = (value, helpers) => {
    // Allow only exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(value)) {
        return helpers.error("any.invalid", {
            message: "phone number must be exactly 10 digits",
        });
    }
    return value;
};
exports.phoneNumber = phoneNumber;
