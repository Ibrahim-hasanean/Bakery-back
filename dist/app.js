"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("./config/mongoose");
const dotenv_1 = __importDefault(require("dotenv"));
const Admin_1 = __importDefault(require("./routes/Admin"));
const AdminUsers_1 = __importDefault(require("./routes/AdminUsers"));
const Users_1 = __importDefault(require("./routes/Users"));
const Orders_1 = __importDefault(require("./routes/Orders"));
const celebrate_1 = require("celebrate");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/", express_1.default.static(path_1.default.join(__dirname, "build")));
app.use("/api/admins/users", AdminUsers_1.default);
app.use("/api/admins/orders", Orders_1.default);
app.use("/api/admins", Admin_1.default);
app.use("/api/users", Users_1.default);
app.use("*", (req, res) => {
    res.redirect("/");
});
app.use((0, celebrate_1.errors)());
app.use((err, req, res, next) => {
    res.send(err);
});
app.listen(port, () => {
    console.log(`listening on ${port}`);
});
