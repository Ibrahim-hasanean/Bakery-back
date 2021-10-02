import { Router } from "express";
import { login, getUserOrders } from "../controllers/Users";
import { validate, loginSchema } from "../middleware/userValidate";
import verifyUser from "../middleware/verifyUser"
const router = Router();

router.post("/login", validate(loginSchema), login);
router.get("/orders", verifyUser, getUserOrders);


export default router;