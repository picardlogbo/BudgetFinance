import { Router } from "express";
import IsOwner from "../Middleware/IsOwner.js";
import { ArchiveRevenu, CreateRevenu, deleteRevenu, GetArchivedRevenus, GetRevenuById, GetRevenus, unarchiveAllRevenus, UnarchiveRevenu, UpdateRevenu } from "../controllers/RevenuController.js";
import { Authenticate } from "../Middleware/Authenticate.js";
import Revenu from "../models/revenuModel.js";

const router = Router();

router.post("/", Authenticate, CreateRevenu);
router.get("/", Authenticate, GetRevenus);
router.get("/revenu/:id", Authenticate, IsOwner(Revenu), GetRevenuById);
router.put("/revenu/:id", Authenticate, IsOwner(Revenu), UpdateRevenu);
router.delete("/revenu/:id", Authenticate, IsOwner(Revenu), deleteRevenu);
router.post("/revenu/:id/archiver", Authenticate, IsOwner(Revenu), ArchiveRevenu);
router.get("/revenus/archives", Authenticate, GetArchivedRevenus);
router.patch("/revenu/:id/restaurer", Authenticate, IsOwner(Revenu), UnarchiveRevenu);
router.patch("/revenus/restaurer", Authenticate, unarchiveAllRevenus);
export default router;
