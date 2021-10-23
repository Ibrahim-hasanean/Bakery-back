import { Router } from "express";
import { validate, registerSchema } from "../middleware/userValidate";
import { getUsers, addUser, deleteUser, getUser, upadateUser, toggleUserActive } from "../controllers/AdminUser";
import verifyManager from "../middleware/verifyManager";
import verifyCanManageUsers from "../middleware/verifyCanManageUsers";
import verifyAdmin from "../middleware/verifyAdmin";
const router = Router();

router.get("/", verifyCanManageUsers, getUsers);
router.post("/", verifyCanManageUsers, validate(registerSchema), addUser);
router.delete("/:id", verifyCanManageUsers, deleteUser);
router.get("/:id", verifyCanManageUsers, getUser);
router.patch("/:id", verifyCanManageUsers, upadateUser);
router.get("/:id/active", verifyCanManageUsers, toggleUserActive);

export default router;