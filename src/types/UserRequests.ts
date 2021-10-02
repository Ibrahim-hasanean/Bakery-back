import { Request } from "express";
import { UserInterface } from "../models/User";
export default interface IUserRequest extends Request {
    user?: UserInterface | null;
}