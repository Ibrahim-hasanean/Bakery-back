import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IAdminRequest from "../types/AdminRequests";
import dotenv from "dotenv";
import Admin from "../models/Admin";
dotenv.config();
export default async function verifyCanManageUsers(req: IAdminRequest, res: Response, next: NextFunction) {
    let authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ status: 401, msg: "unauthorize" });
    let jwtSecret = process.env.Admins_JWT_SECRET as string;
    let token = authorization?.split(" ")[1];
    try {
        let decoded: any = jwt.verify(token, jwtSecret);
        if (decoded.isBigManager || decoded.canManageUsers) {
            let admin = await Admin.findOne({ phoneNumber: decoded.phoneNumber });
            req.admin = admin;
            return next();
        }
        return res.status(403).json({ status: 403, msg: "unauthorize" });

    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: 401, msg: "unauthorize" });
    }
}