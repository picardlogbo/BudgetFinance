import { Router } from "express";
import { Login, Register, ValidateToken } from "../controllers/AuthController.js";

const router = Router();

router.post("/register", Register); // route inscription
router.post("/login", Login);       // route connexion
router.get("/validate-token", ValidateToken); // validation token

export default router;