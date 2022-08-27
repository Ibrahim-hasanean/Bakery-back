import { Router } from "express";
import { validate, registerSchema, loginSchema } from "../middleware/adminValidate";
import { addAdmin, login, getAdmins, getAdmin, updateAdmin, deleteAdmin, refreshAdmin, addBigAdmin } from "../controllers/Admin";
import verifyManager from "../middleware/verifyManager";
import verifyAdmin from "../middleware/verifyAdmin";
const router = Router();

router.post("/bigadmin", addBigAdmin);
router.post("/register", verifyManager, validate(registerSchema), addAdmin);
router.post("/login", validate(loginSchema), login);
router.get("/refresh", verifyAdmin, refreshAdmin);
router.get("/", verifyManager, getAdmins);
router.get("/:id", verifyManager, getAdmin);
router.patch("/:id", verifyManager, validate(registerSchema), updateAdmin);
router.delete("/:id", verifyManager, deleteAdmin);

export default router;