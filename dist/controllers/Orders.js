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
exports.summary = exports.PaidDebt = exports.addDebt = exports.addBreed = exports.addFlour = exports.editeOrder = exports.deleteOrder = exports.getOrders = void 0;
const Orders_1 = __importDefault(require("../models/Orders"));
const User_1 = __importDefault(require("../models/User"));
const calculateSummary_1 = __importDefault(require("../utils/calculateSummary"));
const calculateUserAccounts_1 = __importDefault(require("../utils/calculateUserAccounts"));
const getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { from, to, userName, phoneNumber, page, orderCount } = req.query;
        let query = {};
        if (from || to)
            query.date = {};
        if (from) {
            query.date.$gte = new Date(new Date(from).setHours(0, 0, 0));
        }
        if (to) {
            query.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
        }
        if (userName && phoneNumber) {
            const users = yield User_1.default.find({ name: userName, phoneNumber: phoneNumber });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (userName && !phoneNumber) {
            const users = yield User_1.default.find({ name: userName });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (phoneNumber && !userName) {
            const users = yield User_1.default.find({ phoneNumber: phoneNumber });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (orderCount)
            query.orderCount = Number(orderCount);
        let pageNumber = Number(page || 1);
        let skip = (pageNumber - 1) * 5;
        const orders = yield Orders_1.default.find(query).sort({ date: "desc", orderCount: "desc" }).skip(skip).limit(5).populate("userId");
        const ordersCount = yield Orders_1.default.where(query).count();
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
        return res.status(200).json({
            status: 200, summary: Object.assign(Object.assign({}, ordersSummary[0]), { usersCount, restFlour, totalAccount, restAccount }), orders: {
                orders, ordersCount
            }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.getOrders = getOrders;
const deleteOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orderId = req.params.id;
        let order = yield Orders_1.default.findByIdAndDelete(orderId);
        let user = yield User_1.default.findById(order.userId);
        // user.account = user.account - order.payedAmount;
        // user.account = user.account - (order.breedAmount * 1) + order.payedAmount;
        // user.flourAmount = Number(user.flourAmount) - Number(order.flourAmount) + Number(order.breedAmount);
        // user.breedAmount = Number(user.breedAmount) - Number(order.breedAmount);
        // user.account = user.account - order.debt;
        // user.debtAmount = Number(user.debtAmount) - Number(order.debt);
        // await order.delete();
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.breedAmount = totalBreed;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        yield user.save();
        return res.status(200).json({ status: 200, order });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.deleteOrder = deleteOrder;
const editeOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orderId = req.params.id;
        const { breedAmount, flourAmount, debt, payedAmount, date } = req.body;
        let order = yield Orders_1.default.findById(orderId);
        let user = yield User_1.default.findById(order.userId);
        //remove old data from user data
        // user.account = user.account - (order.breedAmount * 1) + order.payedAmount;
        // user.account = user.account - order.debt;
        // user.flourAmount = Number(user.flourAmount) - Number(order.flourAmount) + Number(order.breedAmount);
        // user.breedAmount = Number(user.breedAmount) - Number(order.breedAmount);
        // user.debtAmount = Number(user.debtAmount) - Number(order.debt);
        // modify order data
        order.breedAmount = breedAmount;
        order.flourAmount = flourAmount;
        order.debt = debt;
        order.payedAmount = payedAmount;
        order.date = new Date(date);
        yield order.save();
        //add new data to user 
        // user.account = user.account + (breedAmount * 1) - payedAmount;
        // user.account = user.account + debt;
        // user.flourAmount = Number(user.flourAmount) + Number(order.flourAmount);
        // user.breedAmount = Number(user.breedAmount) + Number(order.breedAmount);
        // user.debtAmount = Number(user.debtAmount) + Number(order.debt);
        //save currentlly user courrnency 
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.breedAmount = totalBreed;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        order.currentAccount = user.account;
        yield order.save();
        yield user.save();
        return res.status(200).json({ status: 200, order });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.editeOrder = editeOrder;
const addFlour = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let admin = req.admin;
    const { flourAmount, userId, note, payedAmount, date } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = yield Orders_1.default.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = ((_a = maxIncrement[0]) === null || _a === void 0 ? void 0 : _a.orderCount) ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = yield Orders_1.default.create({
            flourAmount, userId, note, adminCreator: admin._id, payedAmount, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        yield user.save();
        yield newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account - payedAmount;
        // user.flourAmount = user.flourAmount + flourAmount;
        // newOrder.currentAccount = user.account;
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.addFlour = addFlour;
const addBreed = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let admin = req.admin;
    const { breedAmount, userId, note, payedAmount, date } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = yield Orders_1.default.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = ((_b = maxIncrement[0]) === null || _b === void 0 ? void 0 : _b.orderCount) ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = yield Orders_1.default.create({
            breedAmount, userId, note, adminCreator: admin._id, payedAmount, orderCount, date
        });
        user.orders.push(newOrder._id);
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.account = restAccount;
        user.breedAmount = totalBreed;
        user.flourAmount = restFlour;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        yield user.save();
        yield newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account + (breedAmount * 1) - payedAmount;
        // user.breedAmount = user.breedAmount + breedAmount;
        // user.flourAmount = user.flourAmount - breedAmount;
        // newOrder.currentAccount = user.account;
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.addBreed = addBreed;
const addDebt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    let admin = req.admin;
    const { debt, userId, note, date } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = yield Orders_1.default.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = ((_c = maxIncrement[0]) === null || _c === void 0 ? void 0 : _c.orderCount) ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = yield Orders_1.default.create({
            debt, userId, note, adminCreator: admin._id, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        yield user.save();
        yield newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account + Number(debt);
        // user.debtAmount = user.debtAmount + Number(debt);
        // newOrder.currentAccount = user.account;
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.addDebt = addDebt;
const PaidDebt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    let admin = req.admin;
    const { amount, userId, note, date } = req.body;
    try {
        let user = yield User_1.default.findById(userId);
        if (!user)
            return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = yield Orders_1.default.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = ((_d = maxIncrement[0]) === null || _d === void 0 ? void 0 : _d.orderCount) ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = yield Orders_1.default.create({
            userId, note, adminCreator: admin._id, payedAmount: amount, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = yield (0, calculateUserAccounts_1.default)(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        yield user.save();
        yield newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account - amount;
        // user.debtAmount = user.debtAmount - amount;
        // newOrder.currentAccount = user.account;
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.PaidDebt = PaidDebt;
const summary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { page } = req.query;
    try {
        console.log("hoome");
        let pageNumber = Number(page || 1);
        const usersCount = yield User_1.default.count();
        let skip = (pageNumber - 1) * 5;
        // const updatedUsers = await User.find();
        // updatedUsers.forEach(async user => {
        //     const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        //     user.account = restAccount;
        //     user.flourAmount = restFlour;
        //     user.breedAmount = totalBreed;
        //     user.debtAmount = totalDebt;
        //     user.totalPayed = totalPayed;
        //     await user.save();
        // });
        const users = yield User_1.default.find({}).sort({ createdAt: 'descending' });
        // .skip(skip).limit(5);
        const ordersSummary = yield Orders_1.default.aggregate().group({
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
        const { restFlour, totalAccount, restAccount } = (0, calculateSummary_1.default)(ordersSummary[0]);
        return res.status(200)
            .json({
            status: 200,
            summary: Object.assign(Object.assign({}, ordersSummary[0]), { usersCount, restFlour, totalAccount, restAccount }),
            users: { users, usersCount }
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
});
exports.summary = summary;
