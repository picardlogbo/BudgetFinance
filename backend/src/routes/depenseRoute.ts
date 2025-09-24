import { Router } from "express";
import {CreateDepense, deleteDepense, getDepenseById, getDepenses, updateDepense, ArchiveDepense, UnarchiveDepense, getArchivedDepenses, unarchiveAllDepenses, getDepensesByCategory, getArchivedDepensesSecure } from "../controllers/depenseController.js";
import IsOwner from "../Middleware/IsOwner.js";
import { Authenticate } from "../Middleware/Authenticate.js";
import Depense from "../models/depensesModel.js";

const router = Router();

router.post("/", Authenticate, CreateDepense);
router.get("/", Authenticate, getDepenses);
router.get("/archived", Authenticate, getArchivedDepenses);
router.post("/archived/secure", Authenticate, getArchivedDepensesSecure);
router.get("/by-category", Authenticate, getDepensesByCategory);
router.get("/:id", Authenticate, IsOwner(Depense), getDepenseById);
router.put("/:id", Authenticate, IsOwner(Depense), updateDepense);
router.post("/:id/archive", Authenticate, IsOwner(Depense), ArchiveDepense);
router.post("/:id/unarchive", Authenticate, IsOwner(Depense), UnarchiveDepense);
router.post("/unarchive-all", Authenticate, unarchiveAllDepenses);
router.delete("/:id", Authenticate, IsOwner(Depense), deleteDepense);

export default router;
