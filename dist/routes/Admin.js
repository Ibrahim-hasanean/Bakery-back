"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminValidate_1 = require("../middleware/adminValidate");
const Admin_1 = require("../controllers/Admin");
const verifyManager_1 = __importDefault(require("../middleware/verifyManager"));
const verifyAdmin_1 = __importDefault(require("../middleware/verifyAdmin"));
const router = (0, express_1.Router)();
router.post("/register", verifyManager_1.default, (0, adminValidate_1.validate)(adminValidate_1.registerSchema), Admin_1.addAdmin);
router.post("/login", (0, adminValidate_1.validate)(adminValidate_1.loginSchema), Admin_1.login);
router.get("/refresh", verifyAdmin_1.default, Admin_1.refreshAdmin);
router.get("/", verifyManager_1.default, Admin_1.getAdmins);
router.get("/:id", verifyManager_1.default, Admin_1.getAdmin);
router.patch("/:id", verifyManager_1.default, (0, adminValidate_1.validate)(adminValidate_1.registerSchema), Admin_1.updateAdmin);
router.delete("/:id", verifyManager_1.default, Admin_1.deleteAdmin);
exports.default = router;
