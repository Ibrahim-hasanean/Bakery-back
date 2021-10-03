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
exports.deleteUser = exports.upadateUser = exports.toggleUserActive = exports.getUser = exports.getUsers = exports.addUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const Orders_1 = __importDefault(require("../models/Orders"));
const mongoose_1 = __importDefault(require("mongoose"));
const calculateSummary_1 = __importDefault(require("../utils/calculateSummary"));
dotenv_1.default.config();
const addUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, password, phoneNumber, address, note } = req.body;
    let admin = req.admin;
    try {
        let isExist = yield User_1.default.findOne({ phoneNumber });
        if (isExist)
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم من قبل" });
        let maxIncrement = yield User_1.default.find({}).sort({ userCount: -1 }).limit(1);
        let userCount = ((_a = maxIncrement[0]) === null || _a === void 0 ? void 0 : _a.userCount) ? maxIncrement[0].userCount + 1 : 1;
        let newUser = yield User_1.default.create({ name, password, phoneNumber, address, note, adminCreator: admin._id, userCount });
        return res.status(201).json({ status: 201, msg: "تم اضافة المستخدم بنجاح", user: newUser });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.addUser = addUser;
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { name, phoneNumber, page, userCount } = req.query;
        let query = {};
        let pageNumber = Number(page || 1);
        let skip = (pageNumber - 1) * 5;
        if (name)
            query.name = { $regex: name, $options: "i" };
        if (userCount)
            query.userCount = Number(userCount);
        if (phoneNumber)
            query.phoneNumber = phoneNumber;
        // var users: UserInterface[] = await User
        //     .find(query)
        //     .sort({ createdAt: 'descending' })
        //     .skip(Number(skip || 0))
        //     .limit(5);
        var users = yield User_1.default.aggregate()
            .match(query)
            .sort({ createdAt: 'descending' })
            .skip(Number(skip || 0))
            .limit(5);
        let usersCount = yield User_1.default.where(query).count();
        return res.status(200).json({ status: 200, users, pages: Math.ceil(usersCount / 5) });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.getUsers = getUsers;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to, orderCount, page } = req.query;
        const userId = req.params.id;
        let query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        let match = { userId: new mongoose_1.default.Types.ObjectId(userId), date: { $lte: new Date(new Date().setHours(23, 59, 59)) } };
        if (from || to) {
            query.date = {};
        }
        if (from) {
            query.date.$gte = new Date(new Date(from).setHours(0, 0, 0));
        }
        if (to) {
            query.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
            match.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
        }
        if (orderCount)
            query.orderCount = Number(orderCount);
        let pageNumber = Number(page || 1);
        let skip = (pageNumber - 1) * 5;
        const user = yield User_1.default.findById(userId)
            .populate({
            path: "orders",
            match: query,
            options: { sort: { date: "desc", orderCount: "desc" }, skip, limit: 5 }
        });
        const ordersSummary = yield Orders_1.default.aggregate().match(match).group({
            _id: null,
            totalFlour: {
                $sum: "$flourAmount"
            },
            totalBreed: {
                $sum: "$breedAmount"
            },
            totalPayed: {
                $sum: "$payedAmount"
            },
            totalDebt: {
                $sum: "$debt"
            }
        });
        const ordersCount = yield Orders_1.default.where({ userId: user._id }).count();
        const { restFlour, totalAccount, restAccount } = (0, calculateSummary_1.default)(ordersSummary[0]);
        return res.status(200).json({
            status: 200,
            summary: Object.assign(Object.assign({}, ordersSummary[0]), { restFlour, totalAccount, restAccount }), user, pages: Math.ceil(ordersCount / 5)
        });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.getUser = getUser;
const toggleUserActive = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.params.id;
        var user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(400).json({ status: 400, msg: "المستخدم غير موجود" });
        if (user) {
            user.isActive = !user.isActive;
            yield user.save();
            return res.status(200).json({ status: 200, user });
        }
        return res.status(404).json({ status: 404, msg: "user not found" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.toggleUserActive = toggleUserActive;
const upadateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password, phoneNumber, address, note } = req.body;
    let userId = req.params.id;
    let admin = req.admin;
    try {
        let isExist = yield User_1.default.findOne({ phoneNumber });
        if (isExist && isExist._id != userId) {
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم من قبل" });
        }
        let user = yield User_1.default.findById(userId);
        if (user) {
            user.name = name;
            user.password = password;
            user.phoneNumber = phoneNumber;
            user.address = address;
            user.note = note;
            user.adminUpdated = admin._id;
            yield user.save();
            return res.status(200).json({ status: 200, user });
        }
        return res.status(404).json({ status: 404, msg: "user not found" });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.upadateUser = upadateUser;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userId = req.params.id;
        var user = yield User_1.default.findByIdAndDelete(userId);
        return res.status(200).json({ status: 200, user });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
});
exports.deleteUser = deleteUser;
