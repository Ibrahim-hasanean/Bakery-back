import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IAdminRequest from "../types/AdminRequests";
import dotenv from "dotenv";
import Admin from "../models/Admin";
dotenv.config();
export default async function verifyAdmin(req: IAdminRequest, res: Response, next: NextFunction) {
    let authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ status: 401, msg: "unauthorize" });
    let jwtSecret = process.env.Admins_JWT_SECRET as string;
    let token = authorization?.split(" ")[1];
    try {
        let decoded: any = jwt.verify(token, jwtSecret);
        let admin = await Admin.findOne({ phoneNumber: decoded.phoneNumber });
        if (!admin) return res.status(401).json({ status: 401, msg: "unauthorize" });
        req.admin = admin;
        return next();
    } catch (error: any) {
        console.log(error.toString());
        return res.status(401).json({ status: 401, msg: "unauthorize" });
    }
}