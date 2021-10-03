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
const mongoose_1 = __importDefault(require("mongoose"));
const calculateSummary_1 = __importDefault(require("./calculateSummary"));
const Orders_1 = __importDefault(require("../models/Orders"));
function calculateUserAccounts(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let match = { userId: new mongoose_1.default.Types.ObjectId(userId) };
        const ordersSummary = yield Orders_1.default.aggregate().match(match).group({
            _id: null,
            totalFlour: {
                $sum: "$flourAmount"
            },
            totalBreed: {
                $sum: "$breedAmount"
            },
            totalPayed: {
                $sum: "$payedAmount"
            },
            totalDebt: {
                $sum: "$debt"
            }
        });
        const { restFlour, totalAccount, restAccount } = (0, calculateSummary_1.default)(ordersSummary[0]);
        return { restFlour, totalBreed: ordersSummary[0].totalBreed, totalPayed: ordersSummary[0].totalPayed, totalDebt: ordersSummary[0].totalDebt, restAccount };
    });
}
exports.default = calculateUserAccounts;
