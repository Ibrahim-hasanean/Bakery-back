"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userValidate_1 = require("../middleware/userValidate");
const AdminUser_1 = require("../controllers/AdminUser");
const verifyCanManageUsers_1 = __importDefault(require("../middleware/verifyCanManageUsers"));
const router = (0, express_1.Router)();
router.get("/", verifyCanManageUsers_1.default, AdminUser_1.getUsers);
router.post("/", verifyCanManageUsers_1.default, (0, userValidate_1.validate)(userValidate_1.registerSchema), AdminUser_1.addUser);
router.delete("/:id", verifyCanManageUsers_1.default, AdminUser_1.deleteUser);
router.get("/:id", verifyCanManageUsers_1.default, AdminUser_1.getUser);
router.patch("/:id", verifyCanManageUsers_1.default, AdminUser_1.upadateUser);
router.get("/:id/active", verifyCanManageUsers_1.default, AdminUser_1.toggleUserActive);
exports.default = router;
