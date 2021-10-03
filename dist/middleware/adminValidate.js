"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = exports.validate = void 0;
const celebrate_1 = require("celebrate");
const validate = (schema) => (0, celebrate_1.celebrate)(schema, { abortEarly: false }, { mode: celebrate_1.Modes.FULL });
exports.validate = validate;
const phoneNumber = celebrate_1.Joi.string().required();
const password = celebrate_1.Joi.string().min(6).required();
exports.loginSchema = {
    [celebrate_1.Segments.BODY]: {
        phoneNumber, password
    }
};
exports.registerSchema = {
    [celebrate_1.Segments.BODY]: {
        phoneNumber,
        password,
        name: celebrate_1.Joi.string().required(),
        isBigManager: celebrate_1.Joi.boolean(),
        canManageUsers: celebrate_1.Joi.boolean(),
        canManageFlour: celebrate_1.Joi.boolean(),
        canManageBreed: celebrate_1.Joi.boolean(),
        canManageDebts: celebrate_1.Joi.boolean(),
        canManagePaid: celebrate_1.Joi.boolean(),
    }
};
