import { Router } from "express";
import IsOwner from "../Middleware/IsOwner.js";
import { CreateBudget, DeleteBudget, GetBudgetById, GetBudgets, UpdateBudget } from "../controllers/BudgetController.js";
import { Authenticate } from "../Middleware/Authenticate.js";

const router = Router();

router.post("/", Authenticate, CreateBudget);
router.get("/", Authenticate, GetBudgets);
router.get("/:id", Authenticate, IsOwner, GetBudgetById);
router.put("/:id", Authenticate, IsOwner, UpdateBudget);
router.delete("/:id", Authenticate, IsOwner, DeleteBudget);

export default router;
