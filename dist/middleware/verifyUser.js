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
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
function verifyUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let authorization = req.headers.authorization;
        if (!authorization)
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        let jwtSecret = process.env.Users_JWT_SECRET;
        let token = authorization === null || authorization === void 0 ? void 0 : authorization.split(" ")[1];
        try {
            let decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
            let user = yield User_1.default.findOne({ phoneNumber: decoded.phoneNumber });
            if (!(user === null || user === void 0 ? void 0 : user.isActive)) {
                return res.status(401).json({ status: 401, msg: "unauthorize" });
            }
            req.user = user;
            return next();
        }
        catch (error) {
            console.log(error);
            return res.status(401).json({ status: 401, msg: "unauthorize" });
        }
    });
}
exports.default = verifyUser;
