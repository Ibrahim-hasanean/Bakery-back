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
exports.getUserOrders = exports.login = void 0;
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Orders_1 = __importDefault(require("../models/Orders"));
dotenv_1.default.config();
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { phoneNumber, password } = req.body;
    let user = yield User_1.default.findOne({ phoneNumber });
    if (!user)
        return res.status(404).json({ status: 404, msg: "المستخدم غير موجود" });
    let isValid = yield user.comparePassword(password);
    if (isValid && user.isActive) {
        let tokenSecret = process.env.Users_JWT_SECRET;
        let token = jsonwebtoken_1.default.sign({ _id: user._id, phoneNumber: user.phoneNumber, name: user.name }, tokenSecret);
        return res.status(200).json({ status: 200, user, token });
    }
    return res.status(400).json({ status: 400, msg: "كلمة السر خاطئة" });
});
exports.login = login;
const getUserOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let user = req.user;
    let query = { userId: user._id };
    let { from, to, page } = req.query;
    console.log(page);
    let pageNumber = Number(page || 1);
    let skip = (pageNumber - 1) * 10;
    if (from || to)
        query.createdAt = {};
    if (from) {
        query.createdAt.$gte = new Date(new Date(from).setHours(0, 0, 0));
    }
    if (to) {
        query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }
    let orders = yield Orders_1.default.find(query).sort({ date: 'descending' }).skip(skip).limit(10);
    const ordrsCount = yield Orders_1.default.find(query).count();
    const pagesNumber = Math.ceil(ordrsCount / 10);
    const ordersSummary = yield Orders_1.default.aggregate().match(query).group({
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
    const usersCount = yield User_1.default.count();
    const restFlour = ordersSummary[0] ? ordersSummary[0].totalFlour - ordersSummary[0].totalBreed : 0;
    const totalAccount = ordersSummary[0] ? ordersSummary[0].totalBreed + ordersSummary[0].totalDebt : 0;
    const restAccount = ordersSummary[0] ? totalAccount - ordersSummary[0].totalPayed : 0;
    return res.status(200).json({ status: 200, pagesNumber, summary: Object.assign(Object.assign({}, ordersSummary[0]), { usersCount, restFlour, totalAccount, restAccount }), orders });
});
exports.getUserOrders = getUserOrders;
