import { Router } from "express";
import { addFlour, getOrders, addBreed, addDebt, deleteOrder, PaidDebt, summary, editeOrder } from "../controllers/Orders";
import { validate, addFlourSchema, addBreedSchema, addDebtSchema, addPayedSchema } from "../middleware/orderValidate";
import verifyCanManageBreed from "../middleware/verifyCanManageBreed";
import verifyCanManageFlour from "../middleware/verifyCanManageFlour";
import verifyCanAdmin from "../middleware/verifyAdmin";
const router = Router();

router.get("/home", verifyCanAdmin, validate(addFlourSchema), summary);
router.get("/", verifyCanAdmin, getOrders);
router.delete("/:id", verifyCanManageFlour, deleteOrder);
router.patch("/:id", verifyCanManageFlour, editeOrder);
router.post("/flour", verifyCanManageFlour, validate(addFlourSchema), addFlour);
router.post("/breed", verifyCanManageBreed, validate(addBreedSchema), addBreed);
router.post("/debt", verifyCanManageBreed, validate(addDebtSchema), addDebt);
router.post("/paid", verifyCanManageBreed, validate(addPayedSchema), PaidDebt);


export default router;