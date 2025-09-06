import { Router } from "express";
import {CreateDepense, deleteDepense, getDepenseById, getDepenses, updateDepense } from "../controllers/depenseController.js";
import IsOwner from "../Middleware/IsOwner.js";
import { Authenticate } from "../Middleware/Authenticate.js";
import Depense from "../models/depensesModel.js";

const router = Router();

router.post("/", Authenticate, CreateDepense);
router.get("/", Authenticate, getDepenses);
router.get("/:id", Authenticate, IsOwner(Depense), getDepenseById);
router.put("/:id", Authenticate, IsOwner(Depense), updateDepense);
router.delete("/:id", Authenticate, IsOwner(Depense), deleteDepense);

export default router;
