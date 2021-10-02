import { Request } from "express";
import { AdminInterface } from "../models/Admin";
export default interface IAdminRequest extends Request {
    admin?: AdminInterface | null;
}