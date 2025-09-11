
import express, { Application, Request, Response } from "express"; 
// express → framework web
// Application, Request, Response → types TS pour typer req/res/app

import dotenv from "dotenv"; 
// dotenv → permet de lire les variables d'environnement (.env)

dotenv.config(); // Charger les variables d'environnement

import cookieParser from "cookie-parser"; 
// cookie-parser → permet de lire et écrire des cookies

import cors from "cors"; 
// cors → permet au frontend (React) d'appeler notre API

import connectDB from "./config/database.js";
import AuthRoutes from "./routes/AuthRoutes.js";
import DepenseRoutes from "./routes/depenseRoute.js";
import RevenuRoutes from "./routes/revenuRoute.js";
import BudgetRoutes from "./routes/BudgetRoute.js";
import FactureRoutes from "./routes/factureRoute.js";
import EpargneRoutes from "./routes/epargneRoutes.js";
import Facture from "./models/factureModel.js"; // utilisé ailleurs éventuellement
import { scheduleOverdueFacturesJob } from "./jobs/overdueFacturesCron.js"; // cron factures

// Notre fonction de connexion à MongoDB

// =======================
// Configuration
// =======================
connectDB(); // Connexion à la base MongoDB

// =======================
// Initialisation Express
// =======================
const app: Application = express(); // Création de l'application Express

// =======================
// Middlewares globaux
// =======================
app.use(express.json()); 

// Permet de lire le body en JSON (req.body)
app.use(cookieParser()); 

// Permet de lire/écrire les cookies dans les requêtes
app.use(
  cors({
    origin:process.env.FRONTEND_URL || "http://localhost:5173", // votre frontend
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// app.use(cors({ 
//    origin: process.env.FRONTEND_URL || "http://localhost:5173", // récupère depuis .env
//    // autorise le frontend React à accéder à l'API
//   credentials: true                // permet l’envoi de cookies avec les requêtes
// }));

// =======================
// Route test
// =======================
// Routes
app.use("/api/auth", AuthRoutes);
app.use("/api/depenses", DepenseRoutes);
app.use("/api/revenus", RevenuRoutes);
app.use("/api/budgets", BudgetRoutes);
app.use("/api/factures", FactureRoutes);
app.use("/api/epargnes", EpargneRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("🚀 API Budget Manager fonctionne avec TypeScript !");
});

// =======================
// Lancer le serveur
// =======================
const PORT = process.env.PORT || 5000; 
// On récupère le port depuis .env ou sinon 5000 par défaut

app.listen(PORT, () => console.log(`✅ Serveur lancé sur  http://localhost:${PORT}`));
// Démarrage du serveur

// =======================
// Planification des tâches (node-cron)
// =======================
// Job: passage des factures en "En_retard" chaque nuit (0 0 * * *)
scheduleOverdueFacturesJob();