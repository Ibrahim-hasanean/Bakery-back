"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPayedSchema = exports.addDebtSchema = exports.addBreedSchema = exports.addFlourSchema = exports.validate = void 0;
const celebrate_1 = require("celebrate");
const validate = (schema) => (0, celebrate_1.celebrate)(schema, { abortEarly: false }, { mode: celebrate_1.Modes.FULL });
exports.validate = validate;
const userId = celebrate_1.Joi.string().required();
const breedAmount = celebrate_1.Joi.number().required();
const flourAmount = celebrate_1.Joi.number().required();
const payedAmount = celebrate_1.Joi.number().required();
const debt = celebrate_1.Joi.number().required();
const note = celebrate_1.Joi.string();
const date = celebrate_1.Joi.date();
exports.addFlourSchema = {
    [celebrate_1.Segments.BODY]: {
        date, userId, flourAmount, note, payedAmount
    }
};
exports.addBreedSchema = {
    [celebrate_1.Segments.BODY]: {
        date, userId, breedAmount, note, payedAmount
    }
};
exports.addDebtSchema = {
    [celebrate_1.Segments.BODY]: {
        date, userId, debt, note
    }
};
exports.addPayedSchema = {
    [celebrate_1.Segments.BODY]: {
        date, userId, note, amount: celebrate_1.Joi.number().required()
    }
};
