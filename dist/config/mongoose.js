"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const databaseURL = process.env.DATABASE_URL;
// mongoose.connect(databaseURL).then(() => { console.log("database connected") }).catch((e) => {
//     console.log("Error in database connection");
//     console.log(e);
// })
mongoose_1.default.connect("mongodb+srv://ibrahim:481997@cluster0.lyvgk.mongodb.net/bakeryTest?retryWrites=true&w=majority").then(() => { console.log("database connected"); }).catch((e) => {
    console.log("Error in database connection");
    console.log(e);
});
