import { Router } from "express";
import { validate, registerSchema } from "../middleware/userValidate";
import { getUsers, addUser, deleteUser, getUser, upadateUser, toggleUserActive } from "../controllers/AdminUser";
import verifyManager from "../middleware/verifyManager";
import verifyAdmin from "../middleware/verifyAdmin";
const router = Router();

router.get("/", verifyAdmin, getUsers);
router.post("/", verifyManager, validate(registerSchema), addUser);
router.delete("/:id", verifyManager, deleteUser);
router.get("/:id", verifyAdmin, getUser);
router.patch("/:id", verifyManager, upadateUser);
router.get("/:id/active", verifyManager, toggleUserActive);

export default router;