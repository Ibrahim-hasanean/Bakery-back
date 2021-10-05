import { Request, Response, NextFunction } from "express";
import Admin, { AdminInterface } from "../models/Admin";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import IAdminRequest from "../types/AdminRequests";
dotenv.config();

export const addBigAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { name, password, phoneNumber, } = req.body;
    try {
        let isExist = await Admin.findOne({ phoneNumber });
        if (isExist) return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        let newAdmin = await Admin.create({ name, password, phoneNumber, isBigManager: true, canManageDebts: true, canManagePaid: true, canManageUsers: true, canManageFlour: true, canManageBreed: true });
        return res.status(201).json({ status: 201, msg: "تم اضافة الادمن بنجاح", admin: newAdmin });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong")

    }
}

export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { name, password, phoneNumber, isBigManager, canManageUsers, canManageFlour, canManageBreed, canManageDebts, canManagePaid } = req.body;
    try {
        let isExist = await Admin.findOne({ phoneNumber });
        if (isExist) return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        let newAdmin = await Admin.create({ name, password, phoneNumber, isBigManager, canManageDebts, canManagePaid, canManageUsers, canManageFlour, canManageBreed });
        return res.status(201).json({ status: 201, msg: "تم اضافة الادمن بنجاح", admin: newAdmin });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong")

    }
}

export const refreshAdmin = async (req: IAdminRequest, res: Response, next: NextFunction) => {
    try {
        let admin: AdminInterface = req.admin as AdminInterface;
        let jwtSecret = process.env.Admins_JWT_SECRET as string;
        let token = jwt.sign({
            adminId: admin._id,
            phoneNumber: admin.phoneNumber,
            isBigManager: admin.isBigManager,
            canManageUsers: admin.canManageUsers,
            canManageFlour: admin.canManageFlour,
            canManageBreed: admin.canManageBreed,
        }, jwtSecret);
        return res.status(200).json({ status: 200, admin, token });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const getAdmins = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let admins = await Admin.find({});
        return res.status(200).json({ status: 200, admins });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const getAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let adminId = req.params.id;
        let admins = await Admin.findById(adminId);
        return res.status(200).json({ status: 200, admins });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let adminId = req.params.id;
        let admin = await Admin.findByIdAndDelete(adminId);
        return res.status(200).json({ status: 200, admin });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const updateAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const { name, password, phoneNumber, isBigManager, canManageDebts, canManageUsers, canManageFlour, canManageBreed, canManagePaid } = req.body;
    let adminId = req.params.id;
    try {
        let isExist = await Admin.findOne({ phoneNumber });
        if (isExist && adminId != isExist._id) {
            return res.status(409).json({ status: 409, msg: "رقم الجوال مستخدم" });
        }
        let admin = await Admin.findById(adminId);
        if (admin) {
            admin.name = name;
            admin.password = password;
            admin.phoneNumber = phoneNumber;
            admin.isBigManager = isBigManager;
            admin.canManageUsers = canManageUsers;
            admin.canManageFlour = canManageFlour;
            admin.canManageBreed = canManageBreed;
            admin.canManageDebts = canManageDebts;
            admin.canManagePaid = canManagePaid;
            await admin.save();
            return res.status(200).json({ status: 200, admin });
        }
        return res.status(404).json({ status: 404, msg: "admin not found" });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { password, phoneNumber } = req.body;
    try {
        let admin = await Admin.findOne({ phoneNumber });
        if (!admin)
            return res.status(404).json({ status: 404, msg: "هذا المستخدم غير موجود" });
        let isValid = await admin.comparePassword(password);
        if (!isValid) return res.status(400).json({ status: 400, msg: "كلمة السر غير صحيحة" });
        let jwtSecret = process.env.Admins_JWT_SECRET as string;
        let token = jwt.sign({
            adminId: admin._id,
            phoneNumber: admin.phoneNumber,
            isBigManager: admin.isBigManager,
            canManageUsers: admin.canManageUsers,
            canManageFlour: admin.canManageFlour,
            canManageBreed: admin.canManageBreed,
        }, jwtSecret);
        return res.status(200).json({ statu: 200, token, admin });
    } catch (error) {
        console.log(error);
        res.status(500).send("something wrong");
    }
}



