import mongoose, { ObjectId, Schema } from "mongoose";
import { AdminInterface } from "./Admin";
import { OrdersInterface } from "./Orders";

export interface UserInterface extends mongoose.Document {
    name: String,
    address: string,
    userCount: number,
    phoneNumber: string,
    note: string,
    password: string,
    isActive: boolean,
    account: number,
    breedAmount: number,
    flourAmount: number,
    totalPayed: number,
    debtAmount: number,
    adminCreator: ObjectId | AdminInterface,
    adminUpdated: ObjectId | AdminInterface,
    orders: ObjectId[] | OrdersInterface[],
    comparePassword(candidatePAssword: string): Promise<boolean>
}

const userSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    userCount: { type: Number },
    phoneNumber: { type: String, required: true },
    note: { type: String },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    account: { type: Number, default: 0 },
    debtAmount: { type: Number, default: 0 },
    breedAmount: { type: Number, default: 0 },
    flourAmount: { type: Number, default: 0 },
    totalPayed: { type: Number, default: 0 },
    orders: [{ type: mongoose.Types.ObjectId, ref: "Orders" }],
    adminCreator: { type: mongoose.Types.ObjectId, ref: "Admins" },
    adminUpdated: { type: mongoose.Types.ObjectId, ref: "Admins" },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    let user = this as UserInterface;
    if (!user.isModified("password")) return next();
})

userSchema.methods.comparePassword = async function (candidatePassword) {
    let user = this as UserInterface;
    return user.password == candidatePassword;
}

const User = mongoose.model<UserInterface>("Users", userSchema);
export default User;