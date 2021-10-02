import { timeStamp } from "console";
import mongoose, { Schema } from "mongoose";

export interface OrdersInterface extends mongoose.Document {
    // _id: any,
    flourAmount: number,
    breedAmount: number,
    orderCount: number,
    payedAmount: number,
    currentAccount: number,
    userId: mongoose.Types.ObjectId,
    note: string,
    debt: number,
    adminCreator: mongoose.Types.ObjectId,
    adminUpdated: mongoose.Types.ObjectId,
    createdAt: Date
    date: Date
}

const OrderSchema = new Schema({
    // orderNO: { type: Number, required: true },
    flourAmount: { type: Number, default: 0 },
    orderCount: { type: Number },
    breedAmount: { type: Number, default: 0 },
    debt: { type: Number, default: 0 },
    date: { type: Date },
    userId: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
    note: { type: String },
    currentAccount: { type: Number },
    payedAmount: { type: Number, default: 0 },
    adminCreator: { type: mongoose.Types.ObjectId, required: true },
    adminUpdated: { type: mongoose.Types.ObjectId },
}, { timestamps: true });

const Order = mongoose.model<OrdersInterface>("Orders", OrderSchema);
export default Order;