"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userValidate_1 = require("../middleware/userValidate");
const AdminUser_1 = require("../controllers/AdminUser");
const verifyManager_1 = __importDefault(require("../middleware/verifyManager"));
const verifyAdmin_1 = __importDefault(require("../middleware/verifyAdmin"));
const router = (0, express_1.Router)();
router.get("/", verifyAdmin_1.default, AdminUser_1.getUsers);
router.post("/", verifyManager_1.default, (0, userValidate_1.validate)(userValidate_1.registerSchema), AdminUser_1.addUser);
router.delete("/:id", verifyManager_1.default, AdminUser_1.deleteUser);
router.get("/:id", verifyAdmin_1.default, AdminUser_1.getUser);
router.patch("/:id", verifyManager_1.default, AdminUser_1.upadateUser);
router.get("/:id/active", verifyManager_1.default, AdminUser_1.toggleUserActive);
exports.default = router;
