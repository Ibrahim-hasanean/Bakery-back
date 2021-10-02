import mongoose, { Schema } from "mongoose";
import { UserInterface } from "./User";

export interface AdminInterface extends mongoose.Document {
    name: String,
    phoneNumber: string,
    password: string,
    isBigManager: boolean,
    canManageUsers: boolean,
    canManageFlour: boolean,
    canManageBreed: boolean,
    canManageDebts: boolean,
    canManagePaid: boolean,
    comparePassword(candidatePassword: string): Promise<boolean>
}

const adminSchema = new Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    password: { type: String, required: true },
    isBigManager: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageDebts: { type: Boolean, default: false },
    canManageFlour: { type: Boolean, default: false },
    canManageBreed: { type: Boolean, default: false },
    canManagePaid: { type: Boolean, default: false },
});

adminSchema.pre("save", async function (next) {
    let admin = this as AdminInterface;
    if (!admin.isModified("password")) return next();
});
adminSchema.methods.comparePassword = async function (candidatePassword: string) {
    let user = this as UserInterface;
    return candidatePassword == user.password;

}


const Admin = mongoose.model<AdminInterface>("Admins", adminSchema);
export default Admin;