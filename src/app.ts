import express, { Errback, Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import "./config/mongoose";
import dotenv from "dotenv";
import AdminRoutes from "./routes/Admin";
import AdminUserRoutes from "./routes/AdminUsers";
import UsersRoutes from "./routes/Users";
import OrdersRoutes from "./routes/Orders";
import { errors } from "celebrate";
const app: Express = express();
const port = process.env.PORT || 4000;

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/admins/users", AdminUserRoutes);
app.use("/admins/orders", OrdersRoutes);
app.use("/admins", AdminRoutes);
app.use("/users", UsersRoutes);
app.use(errors());
app.use((err: Errback, req: Request, res: Response, next: NextFunction) => {
    res.send(err)
})

app.listen(port, () => {
    console.log(`listening on ${port}`)
})
