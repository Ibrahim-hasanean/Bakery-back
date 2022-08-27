"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.updateAdmin = exports.deleteAdmin = exports.getAdmin = exports.getAdmins = exports.refreshAdmin = exports.addAdmin = exports.addBigAdmin = void 0;
const Admin_1 = __importDefault(require("../models/Admin"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const addBigAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, phoneNumber, } = req.body;
    try {
        let isExist = yield Admin_1.default.findOne({ phoneNumber });
        if (isExist)
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        let newAdmin = yield Admin_1.default.create({ name, password, phoneNumber, isBigManager: true, canManageDebts: true, canManagePaid: true, canManageUsers: true, canManageFlour: true, canManageBreed: true });
        return res.status(201).json({ status: 201, msg: "تم اضافة الادمن بنجاح", admin: newAdmin });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.addBigAdmin = addBigAdmin;
const addAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, phoneNumber, isBigManager, canManageUsers, canManageFlour, canManageBreed, canManageDebts, canManagePaid } = req.body;
    try {
        let isExist = yield Admin_1.default.findOne({ phoneNumber });
        if (isExist)
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        let newAdmin = yield Admin_1.default.create({ name, password, phoneNumber, isBigManager, canManageDebts, canManagePaid, canManageUsers, canManageFlour, canManageBreed });
        return res.status(201).json({ status: 201, msg: "تم اضافة الادمن بنجاح", admin: newAdmin });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.addAdmin = addAdmin;
const refreshAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let admin = req.admin;
        let jwtSecret = process.env.Admins_JWT_SECRET;
        if (!admin)
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        let token = jsonwebtoken_1.default.sign({
            adminId: admin === null || admin === void 0 ? void 0 : admin._id,
            phoneNumber: admin === null || admin === void 0 ? void 0 : admin.phoneNumber,
            isBigManager: admin === null || admin === void 0 ? void 0 : admin.isBigManager,
            canManageUsers: admin === null || admin === void 0 ? void 0 : admin.canManageUsers,
            canManageFlour: admin === null || admin === void 0 ? void 0 : admin.canManageFlour,
            canManageBreed: admin === null || admin === void 0 ? void 0 : admin.canManageBreed,
        }, jwtSecret);
        return res.status(200).json({ status: 200, admin, token });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.refreshAdmin = refreshAdmin;
const getAdmins = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let admins = yield Admin_1.default.find({});
        return res.status(200).json({ status: 200, admins });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.getAdmins = getAdmins;
const getAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let adminId = req.params.id;
        let admins = yield Admin_1.default.findById(adminId);
        return res.status(200).json({ status: 200, admins });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.getAdmin = getAdmin;
const deleteAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let adminId = req.params.id;
        let admin = yield Admin_1.default.findByIdAndDelete(adminId);
        return res.status(200).json({ status: 200, admin });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.deleteAdmin = deleteAdmin;
const updateAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, phoneNumber, isBigManager, canManageDebts, canManageUsers, canManageFlour, canManageBreed, canManagePaid } = req.body;
    let adminId = req.params.id;
    try {
        let isExist = yield Admin_1.default.findOne({ phoneNumber });
        if (isExist && adminId != isExist._id) {
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        }
        let admin = yield Admin_1.default.findById(adminId);
        if (admin) {
            admin.name = name;
            admin.password = password;
            admin.phoneNumber = phoneNumber;
            admin.isBigManager = isBigManager;
            admin.canManageUsers = canManageUsers;
            admin.canManageFlour = canManageFlour;
            admin.canManageBreed = canManageBreed;
            admin.canManageDebts = canManageDebts;
            admin.canManagePaid = canManagePaid;
            yield admin.save();
            return res.status(200).json({ status: 200, admin });
        }
        return res.status(404).json({ status: 404, msg: "admin not found" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.updateAdmin = updateAdmin;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, phoneNumber } = req.body;
    try {
        let admin = yield Admin_1.default.findOne({ phoneNumber });
        if (!admin)
            return res.status(404).json({ status: 404, msg: "هذا المستخدم غير موجود" });
        let isValid = yield admin.comparePassword(password);
        if (!isValid)
            return res.status(400).json({ status: 400, msg: "كلمة السر غير صحيحة" });
        let jwtSecret = process.env.Admins_JWT_SECRET;
        let token = jsonwebtoken_1.default.sign({
            adminId: admin._id,
            phoneNumber: admin.phoneNumber,
            isBigManager: admin.isBigManager,
            canManageUsers: admin.canManageUsers,
            canManageFlour: admin.canManageFlour,
            canManageBreed: admin.canManageBreed,
        }, jwtSecret);
        return res.status(200).json({ statu: 200, token, admin });
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
exports.login = login;
