import { Response, NextFunction } from "express";
import IAdminRequest from "../types/AdminRequests";
import User, { UserInterface } from "../models/User";
import { AdminInterface } from "../models/Admin";
import dotenv from "dotenv";
import Order from "../models/Orders";
import mongoose from "mongoose";
import calulateSummary from "../utils/calculateSummary";
dotenv.config();


export const addUser = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    const { name, password, phoneNumber, address, note } = req.body;
    let admin: AdminInterface = req.admin as AdminInterface;
    try {
        let isExist = await User.findOne({ phoneNumber });
        if (isExist) return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم من قبل" });
        let maxIncrement = await User.find({}).sort({ userCount: -1 }).limit(1);
        let userCount = maxIncrement[0]?.userCount ? maxIncrement[0].userCount + 1 : 1;
        let newUser = await User.create({ name, password, phoneNumber, address, note, adminCreator: admin._id, userCount });
        return res.status(201).json({ status: 201, msg: "تم اضافة المستخدم بنجاح", user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong")

    }
}

export const getUsers = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    try {
        let { name, phoneNumber, page, userCount, account } = req.query as { name: string, phoneNumber: string, page: string, userCount: string, account: string };
        let query: any = {};
        let pageNumber: number = Number(page || 1);
        let skip: number = (pageNumber - 1) * 5;
        if (account) {
            let accountNumber = Number(account);
            if (accountNumber == 1) query.account = { $gt: 0 };
            if (accountNumber == 2) query.account = { $lt: 0 };
        }
        if (name) query.name = { $regex: name, $options: "i" };
        if (userCount) query.userCount = Number(userCount);
        if (phoneNumber) query.phoneNumber = phoneNumber;
        var users: UserInterface[] = await User.aggregate()
            .match(query)
            .sort({ createdAt: 'descending' })
            .skip(Number(skip || 0))
            .limit(5);
        let usersCount = await User.where(query).count();
        return res.status(200).json({ status: 200, users, pages: Math.ceil(usersCount / 5) });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const getUser = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    try {
        const { from, to, orderCount, page } = req.query as { from: string, to: string, orderCount: string, page: string };
        const userId: string = req.params.id;
        let query: any = { userId: new mongoose.Types.ObjectId(userId) };
        let match: any = { userId: new mongoose.Types.ObjectId(userId), date: { $lte: new Date(new Date().setHours(23, 59, 59)) } };
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
        if (orderCount) query.orderCount = Number(orderCount);
        let pageNumber: number = Number(page || 1);
        let skip: number = (pageNumber - 1) * 5;
        const user: UserInterface = await User.findById(userId)
            .populate({
                path: "orders",
                match: query,
                options: { sort: { date: "desc", orderCount: "desc" }, skip, limit: 5 }
            }) as UserInterface;
        const ordersSummary = await Order.aggregate().match(match).group({
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
        const ordersCount = await Order.where({ userId: user._id }).count();
        const { restFlour, totalAccount, restAccount } = calulateSummary(ordersSummary[0]);
        return res.status(200).json({
            status: 200,
            summary: { ...ordersSummary[0], restFlour, totalAccount, restAccount }, user, pages: Math.ceil(ordersCount / 5)
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const toggleUserActive = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    try {
        let userId = req.params.id;
        var user: UserInterface = await User.findById(userId) as UserInterface;
        if (!user) return res.status(400).json({ status: 400, msg: "المستخدم غير موجود" });
        if (user) {
            user.isActive = !user.isActive;
            await user.save();
            return res.status(200).json({ status: 200, user });
        }
        return res.status(404).json({ status: 404, msg: "user not found" });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const upadateUser = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    const { name, password, phoneNumber, address, note } = req.body;
    let userId = req.params.id;
    let admin = req.admin as AdminInterface;
    try {
        let isExist = await User.findOne({ phoneNumber });
        if (isExist && isExist._id != userId) {
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم من قبل" });
        }
        let user: UserInterface = await User.findById(userId) as UserInterface;
        if (user) {
            user.name = name;
            user.password = password;
            user.phoneNumber = phoneNumber;
            user.address = address;
            user.note = note;
            user.adminUpdated = admin._id;
            await user.save();
            return res.status(200).json({ status: 200, user });
        }
        return res.status(404).json({ status: 404, msg: "user not found" });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const deleteUser = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    try {
        let userId = req.params.id;
        let user = await User.findByIdAndDelete(userId);
        let deleteUsers = await Order.deleteMany({ userId });
        return res.status(200).json({ status: 200, user });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}
