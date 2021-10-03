"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Users_1 = require("../controllers/Users");
const userValidate_1 = require("../middleware/userValidate");
const verifyUser_1 = __importDefault(require("../middleware/verifyUser"));
const router = (0, express_1.Router)();
router.post("/login", (0, userValidate_1.validate)(userValidate_1.loginSchema), Users_1.login);
router.get("/orders", verifyUser_1.default, Users_1.getUserOrders);
exports.default = router;
