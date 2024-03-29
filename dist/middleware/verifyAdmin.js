"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const Admin_1 = __importDefault(require("../models/Admin"));
dotenv_1.default.config();
function verifyAdmin(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let authorization = req.headers.authorization;
        if (!authorization)
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        let jwtSecret = process.env.Admins_JWT_SECRET;
        let token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
        try {
            let decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            let admin = yield Admin_1.default.findOne({ phoneNumber: decoded.phoneNumber });
            if (!admin)
                return res.status(401).json({ status: 401, msg: "unauthorize" });
            req.admin = admin;
            return next();
        }
        catch (error) {
            console.log(error.toString());
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        }
    });
}
exports.default = verifyAdmin;
