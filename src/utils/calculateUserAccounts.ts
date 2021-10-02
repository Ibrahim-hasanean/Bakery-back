import mongoose, { ObjectId } from "mongoose";
import calulateSummary from "./calculateSummary";
import Order from "../models/Orders";
export default async function calculateUserAccounts(userId: mongoose.Types.ObjectId) {
    let match: any = { userId: new mongoose.Types.ObjectId(userId) };
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
    const { restFlour, totalAccount, restAccount } = calulateSummary(ordersSummary[0]);
    return { restFlour, totalBreed: ordersSummary[0].totalBreed, totalPayed: ordersSummary[0].totalPayed, totalDebt: ordersSummary[0].totalDebt, restAccount }

}