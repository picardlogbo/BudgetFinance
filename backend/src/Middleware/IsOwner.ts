import { Request, Response, NextFunction } from "express";
import mongoose, { Model } from "mongoose";

export const IsOwner = (Model: Model<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Récupérer l'utilisateur authentifié depuis req.user (ajouté par le middleware d'authentification)
      const user = (req as any).user;
      const { id } = req.params;

      if (!user) {
        return res.status(401).json({ message: "Non autorisé" });
      }
      // Vérifier que l'id est un ObjectId valide
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Identifiant invalide" });
      }
      // Si pas de modèle fourni, on skippe la vérification
      if (!Model) return next();
      // Chercher le document par id
      const document = await Model.findById(id);
      if (!document) {
        return res.status(404).json({ message: "Document non trouvé" });
      }

      // Normaliser l'id de l'utilisateur authentifié (supporte string / mongoose doc)
      const authUserId = typeof user === "string" ? user : (user as any)._id ? String((user as any)._id) : (user as any).id ? String((user as any).id) : undefined;
      
      if (!authUserId) {
        console.warn("IsOwner: cannot determine auth user id from req.user", user);
        return res.status(401).json({ message: "Non autorisé" });
      }

      // document.user peut être ObjectId ou document peuplé => normaliser en string
      let ownerId: string | undefined;
      if (document.user == null) {
        ownerId = undefined;
      } else if (typeof document.user === "string") {
        ownerId = String(document.user);
      } else if (document.user instanceof mongoose.Types.ObjectId) {
        ownerId = document.user.toString();
      } else if ((document.user as any)._id) {
        ownerId = String((document.user as any)._id);
      } else {
        ownerId = String(document.user);
      }

      if (!ownerId) {
        console.warn("IsOwner: document has no owner field", { docId: id });
        return res.status(403).json({ message: "Accès refusé" });
      }

      if (ownerId !== String(authUserId)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      // Optionnel : attacher le document à req pour le controller
      (req as any).document = document;
      next();
    } catch (err) {
      console.error("IsOwner error:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
};

export default IsOwner;