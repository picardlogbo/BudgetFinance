import { Router } from "express";
    import { createEpargne, getEpargnes, getEpargneById, updateEpargne, deleteEpargne, contributeToEpargne } from "../controllers/epargneController.js";
import Authenticate from "../Middleware/Authenticate.js";
import IsOwner from "../Middleware/IsOwner.js";
import { Epargne } from "../models/EpargneModel.js";

const router = Router();
// Routes pour la gestion de l'épargne
router.post("/", Authenticate, createEpargne);
router.get("/", Authenticate, getEpargnes);
router.get("/:id", Authenticate, IsOwner(Epargne), getEpargneById);
router.put("/:id", Authenticate, IsOwner(Epargne), updateEpargne);
router.post("/:id/contribute", Authenticate, IsOwner(Epargne), contributeToEpargne);
router.delete("/:id", Authenticate, IsOwner(Epargne), deleteEpargne);

export default router;