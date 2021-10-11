import express, { Errback, Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import "./config/mongoose";
import dotenv from "dotenv";
import AdminRoutes from "./routes/Admin";
import AdminUserRoutes from "./routes/AdminUsers";
import UsersRoutes from "./routes/Users";
import OrdersRoutes from "./routes/Orders";
import { errors } from "celebrate";
import path from "path";
const app: Express = express();
const port = process.env.PORT || 4000;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "build")));
app.use("/api/admins/users", AdminUserRoutes);
app.use("/api/admins/orders", OrdersRoutes);
app.use("/api/admins", AdminRoutes);
app.use("/api/users", UsersRoutes);
app.use("*", (req, res) => {
    res.redirect("/");
})
app.use(errors());
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
    res.send(err)
})

app.listen(port, () => {
    console.log(`listening on ${port}`)
})
