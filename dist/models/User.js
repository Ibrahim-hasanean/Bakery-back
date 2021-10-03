"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
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
    orders: [{ type: mongoose_1.default.Types.ObjectId, ref: "Orders" }],
    adminCreator: { type: mongoose_1.default.Types.ObjectId, ref: "Admins" },
    adminUpdated: { type: mongoose_1.default.Types.ObjectId, ref: "Admins" },
}, { timestamps: true });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        if (!user.isModified("password"))
            return next();
    });
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        return user.password == candidatePassword;
    });
};
const User = mongoose_1.default.model("Users", userSchema);
exports.default = User;
