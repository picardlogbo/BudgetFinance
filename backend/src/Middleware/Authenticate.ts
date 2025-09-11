// // import { NextFunction, Request, Response } from "express";
// // import jwt from "jsonwebtoken";
// // import UserModel from "../models/UserModel.js";

// // export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
// //   try {
// //     const authHeader = (req.headers.authorization || req.headers.Authorization || "") as string;
// //     if (!authHeader || !authHeader.startsWith("Bearer ")) {
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const token = authHeader.slice(7).trim();
// //     const secret = process.env.JWT_SECRET;
// //     if (!secret) {
// //       console.error("Authenticate: JWT_SECRET not set");
// //       return res.status(500).json({ message: "Server configuration error" });
// //     }

// //     let decoded: any;
// //     try {
// //       decoded = jwt.verify(token, secret);
// //     } catch (err) {
// //       console.warn("Authenticate: token verification failed:", (err as Error).message);
// //       return res.status(401).json({ message: "Unauthorized" });
// //     }

// //     const userId = decoded?.id || decoded?._id || decoded?.sub;
// //     if (!userId) return res.status(401).json({ message: "Unauthorized" });

// //     const user = await UserModel.findById(userId).select("-password");
// //     if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

// //     // Convert to a plain object and add a string id property — NE PAS écraser _id
// //     const plain: any = user.toObject ? user.toObject() : user;
// //     plain.id = plain._id ? String(plain._id) : undefined;

// //     // Attach normalized user payload to req.user
// //     (req as any).user = plain;

// //     next();
// //   } catch (error) {
// //     console.error("Authenticate unexpected error:", error);
// //     return res.status(500).json({ message: "Server error" });
// //   }
// // };

// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";
// import UserModel from "../models/UserModel.js";

// export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     // 1) chercher le token dans Authorization header
//     const authHeader = (req.headers.authorization || "") as string;
//     let token: string | undefined;

//     if (authHeader && authHeader.startsWith("Bearer ")) {
//       token = authHeader.slice(7).trim();
//     }

//     // 2) fallback : chercher dans cookie nommé "token"
//     if (!token && (req as any).cookies) {
//       token = (req as any).cookies.token;
//     } else if (!token && typeof req.headers.cookie === "string") {
//       // fallback si cookie-parser absent : parser manuellement
//       const raw = req.headers.cookie.split(";").map(c => c.trim());
//       const kv = raw.find(x => x.startsWith("token="));
//       if (kv) token = kv.split("=").slice(1).join("=");
//     }

//     if (!token) {
//       console.warn("Authenticate: no token provided");
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       console.error("Authenticate: JWT_SECRET not set");
//       return res.status(500).json({ message: "Server configuration error" });
//     }

//     let decoded: any;
//     try {
//       decoded = jwt.verify(token, secret);
//     } catch (err) {
//       console.warn("Authenticate: invalid token", (err as Error).message);
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const userId = decoded?.id || decoded?._id || decoded?.sub;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const user = await UserModel.findById(userId).select("-password");
//     if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

//     const plain: any = user.toObject ? user.toObject() : user;
//     plain.id = plain._id ? String(plain._id) : undefined;
//     (req as any).user = plain;

//     next();
//   } catch (error) {
//     console.error("Authenticate unexpected error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// export default Authenticate;

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel.js";

// Middleware d'authentification
export const Authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Récupérer le token depuis le header ou le cookie
    const authHeader = req.headers.authorization as string | undefined;
    let token: string | undefined;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    // Fallback: si pas de header, chercher dans cookies
    if (!token && (req as any).cookies?.token) {
      token = (req as any).cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Non autorisé, token manquant" });
    }

    // 2) Vérifier la validité du token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Configuration serveur manquante" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // 3) Identifier l’utilisateur
    const userId = decoded?.id || decoded?._id || decoded?.sub;
    if (!userId) return res.status(401).json({ message: "Utilisateur non reconnu" });

    // ⚠️ Ici on ne fait pas toObject()
    // On garde le Document Mongoose complet (avec comparePassword et autres méthodes)
    const user = await UserModel.findById(userId);
    if (!user) return res.status(401).json({ message: "Utilisateur introuvable" });

    // 4) Ajouter l’utilisateur complet dans req.user
    (req as any).user = user;

    next();
  } catch (error) {
    console.error("Authenticate error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export default Authenticate;
