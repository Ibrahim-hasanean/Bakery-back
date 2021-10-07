import IUserRequest from "../types/UserRequests";
import { Response, NextFunction } from "express";
import User, { UserInterface } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Order from "../models/Orders";

dotenv.config();

export const login = async (req: IUserRequest, res: Response, next: NextFunction) => {
    let { phoneNumber, password } = req.body;
    let user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ status: 404, msg: "المستخدم غير موجود" });
    let isValid = await user.comparePassword(password);
    if (isValid && user.isActive) {
        let tokenSecret = process.env.Users_JWT_SECRET as string;
        let token = jwt.sign({ _id: user._id, phoneNumber: user.phoneNumber, name: user.name }, tokenSecret);
        return res.status(200).json({ status: 200, user, token });
    }
    return res.status(400).json({ status: 400, msg: "كلمة السر خاطئة" });
}

export const getUserOrders = async (req: IUserRequest, res: Response, next: NextFunction) => {
    let user: UserInterface = req.user as UserInterface;
    let query: any = { userId: user._id };
    let { from, to, page } = req.query as { from: string, to: string, page: string };
    let pageNumber: number = Number(page || 1);
    let skip: number = (pageNumber - 1) * 5;
    if (from || to) query.createdAt = {};
    if (from) {
        query.createdAt.$gte = new Date(new Date(from).setHours(0, 0, 0));
    }
    if (to) {
        query.createdAt.$lte = new Date(new Date(to).setHours(23, 59, 59));
    }
    let orders = await Order.find(query).sort({ date: 'descending' }).limit(10);
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
    return res.status(200).json({ status: 200, summary: { ...ordersSummary[0], usersCount, restFlour, totalAccount, restAccount }, orders });
}
