import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import IUserRequest from "../types/UserRequests";
import dotenv from "dotenv";
import User from "../models/User";
dotenv.config();
export default async function verifyUser(req: IUserRequest, res: Response, next: NextFunction) {
    let authorization = req.headers.authorization;
    if (!authorization) return res.status(401).json({ status: 401, msg: "unauthorize" });
    let jwtSecret = process.env.Users_JWT_SECRET as string;
    let token = authorization?.split(" ")[1];
    try {
        let decoded: any = jwt.verify(token, jwtSecret);
        let user = await User.findOne({ phoneNumber: decoded.phoneNumber });
        if (!user?.isActive) {
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        }
        req.user = user;
        return next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ status: 401, msg: "unauthorize" });
    }
}