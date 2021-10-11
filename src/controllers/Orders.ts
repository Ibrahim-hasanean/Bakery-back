import { Response, NextFunction } from "express";
import AdminRequest from "../types/AdminRequests";
import { AdminInterface } from "../models/Admin";
import Order, { OrdersInterface } from "../models/Orders";
import User, { UserInterface } from "../models/User";
import calulateSummary from "../utils/calculateSummary";
import calulateUserAccounts from "../utils/calculateUserAccounts";

export const getOrders = async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        const { from, to, userName, phoneNumber, page, orderCount } = req.query as { to: string, from: string, userName: string, phoneNumber: string, page: string, orderCount: string };
        let query: any = {};
        if (from || to) query.date = {}
        if (from) {
            query.date.$gte = new Date(new Date(from).setHours(0, 0, 0));
        }
        if (to) {
            query.date.$lte = new Date(new Date(to).setHours(23, 59, 59));
        }
        if (userName && phoneNumber) {
            const users = await User.find({ name: userName, phoneNumber: phoneNumber });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (userName && !phoneNumber) {
            const users = await User.find({ name: userName });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (phoneNumber && !userName) {
            const users = await User.find({ phoneNumber: phoneNumber });
            const userIds = users.map(x => x._id);
            query.userId = { $in: userIds };
        }
        if (orderCount) query.orderCount = Number(orderCount);
        let pageNumber: number = Number(page || 1);
        let skip: number = (pageNumber - 1) * 5;
        const orders = await Order.find(query).sort({ date: "desc", orderCount: "desc" }).skip(skip).limit(5).populate("userId");
        const ordersCount = await Order.where(query).count();
        const ordersSummary = await Order.aggregate().match(query).group({
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
        const usersCount = await User.count();
        const restFlour = ordersSummary[0] ? ordersSummary[0].totalFlour - ordersSummary[0].totalBreed : 0;
        const totalAccount = ordersSummary[0] ? ordersSummary[0].totalBreed + ordersSummary[0].totalDebt : 0;
        const restAccount = ordersSummary[0] ? totalAccount - ordersSummary[0].totalPayed : 0;
        return res.status(200).json({
            status: 200, summary: { ...ordersSummary[0], usersCount, restFlour, totalAccount, restAccount }, orders: {
                orders, ordersCount
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const deleteOrder = async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        let orderId = req.params.id;
        let order: OrdersInterface = await Order.findByIdAndDelete(orderId) as OrdersInterface;
        let user: UserInterface = await User.findById(order.userId) as UserInterface;
        // user.account = user.account - order.payedAmount;
        // user.account = user.account - (order.breedAmount * 1) + order.payedAmount;
        // user.flourAmount = Number(user.flourAmount) - Number(order.flourAmount) + Number(order.breedAmount);
        // user.breedAmount = Number(user.breedAmount) - Number(order.breedAmount);
        // user.account = user.account - order.debt;
        // user.debtAmount = Number(user.debtAmount) - Number(order.debt);
        // await order.delete();
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.breedAmount = totalBreed;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        await user.save();
        return res.status(200).json({ status: 200, order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const editeOrder = async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        let orderId = req.params.id;
        const { breedAmount, flourAmount, debt, payedAmount, date } = req.body;
        let order: OrdersInterface = await Order.findById(orderId) as OrdersInterface;
        let user: UserInterface = await User.findById(order.userId) as UserInterface;
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
        await order.save();
        //add new data to user 
        // user.account = user.account + (breedAmount * 1) - payedAmount;
        // user.account = user.account + debt;
        // user.flourAmount = Number(user.flourAmount) + Number(order.flourAmount);
        // user.breedAmount = Number(user.breedAmount) + Number(order.breedAmount);
        // user.debtAmount = Number(user.debtAmount) + Number(order.debt);

        //save currentlly user courrnency 
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.breedAmount = totalBreed;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        order.currentAccount = user.account;
        await order.save();
        await user.save();
        return res.status(200).json({ status: 200, order });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}


export const addFlour = async (req: AdminRequest, res: Response, next: NextFunction) => {
    let admin = req.admin as AdminInterface;
    const { flourAmount, userId, note, payedAmount, date } = req.body;
    try {
        let user: UserInterface | null = await User.findById(userId);
        if (!user) return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = await Order.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = maxIncrement[0]?.orderCount ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder: OrdersInterface = await Order.create({
            flourAmount, userId, note, adminCreator: admin._id, payedAmount, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.flourAmount = restFlour;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        await user.save();
        await newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account - payedAmount;
        // user.flourAmount = user.flourAmount + flourAmount;
        // newOrder.currentAccount = user.account;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const addBreed = async (req: AdminRequest, res: Response, next: NextFunction) => {
    let admin = req.admin as AdminInterface;
    const { breedAmount, userId, note, payedAmount, date } = req.body;
    try {
        let user: UserInterface | null = await User.findById(userId);
        if (!user) return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = await Order.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = maxIncrement[0]?.orderCount ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = await Order.create({
            breedAmount, userId, note, adminCreator: admin._id, payedAmount, orderCount, date
        });
        user.orders.push(newOrder._id);
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.account = restAccount;
        user.breedAmount = totalBreed;
        user.flourAmount = restFlour;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        await user.save();
        await newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account + (breedAmount * 1) - payedAmount;
        // user.breedAmount = user.breedAmount + breedAmount;
        // user.flourAmount = user.flourAmount - breedAmount;
        // newOrder.currentAccount = user.account;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const addDebt = async (req: AdminRequest, res: Response, next: NextFunction) => {
    let admin = req.admin as AdminInterface;
    const { debt, userId, note, date } = req.body;
    try {
        let user: UserInterface | null = await User.findById(userId);
        if (!user) return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = await Order.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = maxIncrement[0]?.orderCount ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = await Order.create({
            debt, userId, note, adminCreator: admin._id, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        await user.save();
        await newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account + Number(debt);
        // user.debtAmount = user.debtAmount + Number(debt);
        // newOrder.currentAccount = user.account;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const PaidDebt = async (req: AdminRequest, res: Response, next: NextFunction) => {
    let admin = req.admin as AdminInterface;
    const { amount, userId, note, date } = req.body;
    try {
        let user: UserInterface | null = await User.findById(userId);
        if (!user) return res.status(400).json({ status: 400, msg: "لا يمكن ايجاد المستخدم" });
        let maxIncrement = await Order.find({}).sort({ orderCount: -1 }).limit(1);
        let orderCount = maxIncrement[0]?.orderCount ? maxIncrement[0].orderCount + 1 : 1;
        let newOrder = await Order.create({
            userId, note, adminCreator: admin._id, payedAmount: amount, orderCount, date
        });
        const { restFlour, totalBreed, totalPayed, totalDebt, restAccount } = await calulateUserAccounts(user._id);
        user.orders.push(newOrder._id);
        user.account = restAccount;
        user.debtAmount = totalDebt;
        user.totalPayed = totalPayed;
        newOrder.currentAccount = user.account;
        await user.save();
        await newOrder.save();
        return res.status(201).json({ status: 201, msg: "تم اضافة الطلب بنجاح", order: newOrder });
        // user.orders.push(newOrder._id);
        // user.account = user.account - amount;
        // user.debtAmount = user.debtAmount - amount;
        // newOrder.currentAccount = user.account;
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}

export const summary = async (req: AdminRequest, res: Response, next: NextFunction) => {
    let { page } = req.query as { page: string };
    try {
        console.log("hoome");
        let pageNumber: number = Number(page || 1);
        const usersCount = await User.count();
        let skip: number = (pageNumber - 1) * 5;
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

        const users = await User.find({}).sort({ createdAt: 'descending' }).skip(skip).limit(5);
        const ordersSummary = await Order.aggregate().group({
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
        const { restFlour, totalAccount, restAccount } = calulateSummary(ordersSummary[0]);
        return res.status(200)
            .json({
                status: 200,
                summary: { ...ordersSummary[0], usersCount, restFlour, totalAccount, restAccount },
                users: { users, usersCount }
            });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, msg: "خطأ غير معروف" });
    }
}
