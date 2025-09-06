import { Request, Response } from "express";
import BudgetModel, { Budget } from "../models/BudgetModel.js";

// export const CreateBudget = async (req: Request, res: Response) => {
//   try {
//     // L'utilisateur est injecté par le middleware Authenticate
//     const user = req.user;
//     // Vérification de l'utilisateur
//     if (!user) return res.status(401).json({ message: "Non autorisé" });
//     // Récupérer l'ID de l'utilisateur (string ou ObjectId)
//     const userId = (user as any)._id ?? user;

//     // Valider les données reçues
//     let { categorie, montantAlloue, mois, annee } = req.body as {
//       categorie?: string;
//       montantAlloue?: number;
//       mois?: number;
//       annee?: number;
//     };

//     // Validation basique
//     const errors: string[] = [];
//     if (!categorie) errors.push("categorie requise");
//     if (mois === undefined) errors.push("mois requis");
//     if (annee === undefined) errors.push("annee requise");

//     if (typeof mois !== "number" || mois < 1 || mois > 12) errors.push("mois invalide (1-12)");
//     if (typeof annee !== "number" || annee < 1970) errors.push("annee invalide");
//     if (montantAlloue !== undefined && (typeof montantAlloue !== "number" || montantAlloue < 0)) {
//       errors.push("montantAlloue invalide");
//     }
//     // Vérification des doublons
//     if (errors.length) {
//       return res.status(400).json({ message: "Validation échouée", errors });
//     }
//     // Normalisation des données
//     categorie = categorie!.toLowerCase().trim();
//     montantAlloue = montantAlloue ?? 0;
//     // Vérifier qu'un budget n'existe pas déjà pour cet utilisateur/catégorie/mois/année
//     const existing = await BudgetModel.findOne({ user: userId, categorie, mois, annee });
//     if (existing) {
//       return res.status(409).json({ message: "Budget déjà existant pour cette période" });
//     }

//     // Créer le budget
//     const budget = new BudgetModel({
//       user: userId,
//       categorie,
//       montantAlloue,
//       montantDepense: 0,
//       mois,
//       annee
//     });

//     await budget.save();
//     return res.status(201).json(budget);
//   } catch (err) {
//     console.error("CreateBudget error:", err);
//     return res.status(500).json({ message: "Erreur lors de la création du budget" });
//   }
// };


export const CreateBudget = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const userId = (user as any)._id ?? user;
    let { categorie, montantAlloue, mois, annee } = req.body;

    const errors: string[] = [];
    if (!categorie) errors.push("categorie requise");
    if (mois === undefined) errors.push("mois requis");
    if (annee === undefined) errors.push("annee requise");
    if (typeof mois !== "number" || mois < 1 || mois > 12) errors.push("mois invalide (1-12)");
    if (typeof annee !== "number" || annee < 1970) errors.push("annee invalide");
    if (montantAlloue !== undefined && (typeof montantAlloue !== "number" || montantAlloue < 0)) {
      errors.push("montantAlloue invalide");
    }

    if (errors.length) {
      return res.status(400).json({ message: "Validation échouée", errors });
    }

    // ⚠️ Ne pas forcer en lowerCase
    categorie = categorie.trim();
    montantAlloue = montantAlloue ?? 0;

    // Vérifier les doublons
    const existing = await BudgetModel.findOne({ user: userId, categorie, mois, annee });
    if (existing) {
      return res.status(409).json({ message: "Budget déjà existant pour cette période" });
    }

    // Créer
    const budget = new BudgetModel({
      user: userId,
      categorie,
      montantAlloue,
      montantDepense: 0,
      mois,
      annee,
    });

    await budget.save();
    return res.status(201).json(budget);
  } catch (err) {
    console.error("CreateBudget error:", err);
    return res.status(500).json({ message: "Erreur lors de la création du budget" });
  }
};

export const GetBudgets = async (req: Request, res: Response) => {
    try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const userId = (user as any)._id ?? user;
    const budgets = await BudgetModel.find({ user: userId });

    res.status(200).json(budgets);
  } catch (error) {
    console.error("Erreur GetBudgets:", error);-
    res.status(500).json({ message: "Erreur lors de la récupération des budgets" });
  }
};

export const GetBudgetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        if (!id) {
            return res.status(400).json({ message: "L'identifiant du budget est requis" });
        }
        
        
             const budget = (req as any).document;
             if (!budget) {
            return res.status(404).json({ message: "Budget non trouvé" });
        }
        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du budget" });
    }
};


export const UpdateBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "L'identifiant du budget est requis" });
        }

        // Le budget est injecté par le middleware IsOwner
        const budget = (req as any).document;
        if (!budget) {
            return res.status(404).json({ message: "Budget non trouvé" });
        }

        // Fusionner les nouvelles données avec l'existant
        Object.assign(budget, req.body);

        // Sauvegarder
        await budget.save();

        res.status(200).json(budget);
    } catch (error) {
        console.error("Erreur UpdateBudget :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du budget" });
    }
};


export const DeleteBudget = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "L'identifiant du budget est requis" });
        }

        const budget = (req as any).document;
        if (!budget) {
            return res.status(404).json({ message: "Budget non trouvé" });
        }

        await budget.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du budget" });
    }
};
