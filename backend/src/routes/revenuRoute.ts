import { Router } from "express";
import IsOwner from "../Middleware/IsOwner.js";
import { CreateRevenu, deleteRevenu, GetRevenuById, GetRevenus, UpdateRevenu } from "../controllers/RevenuController.js";
import { Authenticate } from "../Middleware/Authenticate.js";
import Revenu from "../models/revenuModel.js";

const router = Router();

router.post("/", Authenticate, CreateRevenu);
router.get("/", Authenticate, GetRevenus);
router.get("/revenu/:id", Authenticate, IsOwner(Revenu), GetRevenuById);
router.put("/revenu/:id", Authenticate, IsOwner(Revenu), UpdateRevenu);
router.delete("/revenu/:id", Authenticate, IsOwner(Revenu), deleteRevenu);

export default router;
