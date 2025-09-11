import { Router } from "express";
import { createFacture, deleteFacture, GetFacture, GetFactureById, UpdateFacture } from "../controllers/FactureController.js";
import Authenticate from "../Middleware/Authenticate.js";
import IsOwner from "../Middleware/IsOwner.js";
import Facture from "../models/factureModel.js";
import JobLog from "../models/JobLogModel.js";

const router = Router();

router.post("/", Authenticate, createFacture);

router.get("/", Authenticate, GetFacture);
router.get("/:id", Authenticate, IsOwner(Facture), GetFactureById);
router.put("/:id", Authenticate, IsOwner(Facture), UpdateFacture);
router.delete("/:id", Authenticate, IsOwner(Facture), deleteFacture);

// Endpoint admin (simple) pour récupérer les logs des jobs factures
router.get("/logs/admin", Authenticate, async (req, res) => {
	try {
		// TODO: ajouter un middleware isAdmin si rôles
		const { type, limit = 50 } = req.query;
		const q: any = {};
		if (type) q.type = type;
		const logs = await JobLog.find(q).sort({ startedAt: -1 }).limit(Number(limit));
		res.json(logs);
	} catch (e:any) {
		console.error('[LOGS][ERREUR]', e);
		res.status(500).json({ message: 'Erreur récupération logs' });
	}
});

export default router;
