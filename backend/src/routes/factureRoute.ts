import { Router } from "express";
import { createFacture, deleteFacture, GetFacture, GetFactureById, UpdateFacture } from "../controllers/FactureController.js";
import Authenticate from "../Middleware/Authenticate.js";
import IsOwner from "../Middleware/IsOwner.js";
import Facture from "../models/factureModel.js";

const router = Router();

router.post("/", Authenticate, createFacture);

router.get("/", Authenticate, GetFacture);
router.get("/:id", Authenticate, IsOwner(Facture), GetFactureById);
router.put("/:id", Authenticate, IsOwner(Facture), UpdateFacture);
router.delete("/:id", Authenticate, IsOwner(Facture), deleteFacture);

export default router;
