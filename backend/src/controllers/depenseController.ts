import e, { Request, Response } from "express";
import Budget from "../models/BudgetModel.js";
import { Types } from "mongoose";
import Depense from "../models/depensesModel.js";

/**
 * Ajouter une dépense :
 * - Crée la dépense
 * - Recherche un budget existant pour user+categorie+mois+annee
 * - Si budget trouvé -> associe la dépense au budget et incrémente budget.montantDepense
 * - Sinon -> dépense sauvegardée sans budget (suivi libre)
 */
// export const CreateDepense = async (req: Request, res: Response) => {
//     try {
//         // 1. Auth
//         if (!req.user) {
//             return res.status(401).json({ message: "Non autorisé" });
//         }
//         const userId = (req.user as any)._id as Types.ObjectId; // cast sûr ici car créé par mongoose

//         // 2. Extraction + normalisation input
//         let { montant, categorie, title, frequence } = req.body as {
//             montant?: number | string;
//             categorie?: string;
//             frequence?: string; 
//             title?: string;
//             date?: string;
//         };

//         // Validation minimale
//         if (montant === undefined || categorie === undefined) {
//             return res.status(400).json({ message: "montant et categorie sont requis" });
//         }

//         // Convertir montant si string
//         if (typeof montant === "string") {
//             const parsed = parseFloat(montant);
//             if (Number.isNaN(parsed)) {
//                 return res.status(400).json({ message: "montant invalide" });
//             }
//             montant = parsed;
//         }

//         // 3. Date + période
//         const depenseDate = new Date();
//         const mois = depenseDate.getMonth() + 1; // 1..12
//         const annee = depenseDate.getFullYear();

//         // 4. Création instance (budget ajouté plus tard si trouvé)
//         const depense = new Depense({
//             user: userId,
//             categorie,
//             frequence,
//             montant,
//             title,
//         });

//         // 5. Chercher un budget existant correspondant
//         const budget = await Budget.findOne({
//             user: userId,
//             categorie,
//             mois,
//             annee,
//             isActive: true,
//         });

//         if (budget) {
//             // budget._id est parfois "unknown" selon la version de mongoose -> cast
//             depense.budget = budget._id as Types.ObjectId;
//             budget.montantDepense += montant as number;
//             await budget.save();
//         }

//         // 6. Sauvegarde dépense
//         await depense.save();
//         return res.status(201).json(depense);
//     } catch (error) {
//         console.error("CreateDepense error:", error);
//         return res.status(500).json({ message: "Erreur lors de la création de la dépense" });
//     }
// };



export const CreateDepense = async (req: Request, res: Response) => {
  try {
    // 1. Auth
    if (!req.user) {
      return res.status(401).json({ message: "Non autorisé" });
    }
    const userId = (req.user as any)._id as Types.ObjectId;

    // 2. Extraction + normalisation input
    let { montant, categorie, title, frequence } = req.body as {
      montant?: number | string;
      categorie?: string;
      frequence?: string;
      title?: string;
      date?: string;
    };

    // Validation minimale
    if (montant === undefined || categorie === undefined) {
      return res.status(400).json({ message: "montant et categorie sont requis" });
    }

    // Convertir montant si string
    if (typeof montant === "string") {
      const parsed = parseFloat(montant);
      if (Number.isNaN(parsed)) {
        return res.status(400).json({ message: "montant invalide" });
      }
      montant = parsed;
    }

    // Récupérer les enums autorisés depuis le schema Mongoose
    const categorieField: any = Depense.schema.path("categorie");
    const frequenceField: any = Depense.schema.path("frequence");
    const allowedCategories: string[] = (categorieField && categorieField.enumValues) || [];
    const allowedFrequences: string[] = (frequenceField && frequenceField.enumValues) || [];

    // helper de matching case-insensitive
    const findAllowed = (val?: string, allowed: string[] = []) => {
      if (!val) return undefined;
      const v = val.toString().trim();
      // match exact / case-insensitive
      const found = allowed.find((a) => a === v || a.toLowerCase() === v.toLowerCase());
      return found;
    };

    const matchedCategorie = findAllowed(categorie, allowedCategories);
    const matchedFrequence = frequence ? findAllowed(frequence, allowedFrequences) : undefined;

    if (!matchedCategorie) {
      return res.status(400).json({
        message: "categorie invalide",
        received: categorie,
        allowed: allowedCategories,
      });
    }

    if (frequence !== undefined && !matchedFrequence) {
      return res.status(400).json({
        message: "frequence invalide",
        received: frequence,
        allowed: allowedFrequences,
      });
    }

    // 3. Date + période
    const depenseDate = new Date();
    const mois = depenseDate.getMonth() + 1; // 1..12
    const annee = depenseDate.getFullYear();

    // 4. Création instance (budget ajouté plus tard si trouvé)
    const depense = new Depense({
      user: userId,
      categorie: matchedCategorie,
      frequence: matchedFrequence,
      montant,
      title,
    });

    // 5. Chercher un budget existant correspondant
    const budget = await Budget.findOne({
      user: userId,
      categorie: matchedCategorie,
      mois,
      annee,
      isActive: true,
    });

    if (budget) {
      depense.budget = budget._id as Types.ObjectId;
      budget.montantDepense += montant as number;
      await budget.save();
    }

    // 6. Sauvegarde dépense
    await depense.save();
    return res.status(201).json(depense);
  } catch (error: any) {
    // Gérer ValidationError de Mongoose explicitement pour renvoyer 400 et détails
    if (error && error.name === "ValidationError") {
      const details: Record<string, string> = {};
      for (const key in error.errors) {
        if (error.errors[key].message) details[key] = error.errors[key].message;
      }
      console.error("CreateDepense validation error:", error);
      return res.status(400).json({ message: "Validation failed", details });
    }

    console.error("CreateDepense error:", error);
    return res.status(500).json({ message: "Erreur lors de la création de la dépense" });
  }
};

export const getDepenses = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }


            const depenses = await Depense.find({ user });
            res.status(200).json(depenses);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des dépenses", error });
        }
};

export const getDepenseById = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const depense = (req as any).document; 
        if (!depense) {
            return res.status(404).json({ message: "Dépense non trouvée" });
        }

        res.status(200).json(depense);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération de la dépense", error });
    }
}

export const updateDepense = async (req: Request, res: Response) => {
    try {
        // Vérification des droits d'accès
        const { id } = req.params;
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'authentification)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        // Récupérer les données à mettre à jour depuis le corps de la requête
        const { montant, frequence, categorie, title } = req.body;
        // Récupérer la dépense depuis le middleware IsOwner
       const depense = (req as any).document; 
       // Vérifier que la dépense existe
       if (!depense) {
           return res.status(404).json({ message: "Dépense non trouvée" });
       }
       // Mettre à jour les champs de la dépense
        if(montant !== undefined) depense.montant = montant;
        if(frequence !== undefined) depense.frequence = frequence;
        if(categorie !== undefined) depense.categorie = categorie;
        if(title !== undefined) depense.title = title;
        // Enregistrer les modifications
        await depense.save();
        // Répondre avec la dépense mise à jour
        res.status(200).json(depense);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour de la dépense", error });
    }
};

export const deleteDepense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        
        const depense = (req as any).document;

        if (!depense) {
            return res.status(404).json({ message: "Dépense non trouvée" });
        }

        await depense.remove();
        res.status(200).json({ message: "Dépense supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression de la dépense", error });
    }
};

export const getArchivedDepenses = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const archivedDepenses = await Depense.find({ user, isArchived: true });
        res.status(200).json(archivedDepenses);
    } catch (error) {
        console.error("Erreur lors de la récupération des dépenses archivées :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des dépenses archivées" });
    }
};

export const ArchiveDepense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        const depense = (req as any).document;
        if (!depense) {
            return res.status(404).json({ message: "Dépense non trouvée" });
        }
        depense.isArchived = true;
        await depense.save();
        res.status(200).json({message: "Dépense archivée avec succès", depense});
    } catch (error) {
        console.error("Erreur lors de l'archivage de la dépense :", error);
        res.status(500).json({ message: "Erreur lors de l'archivage de la dépense" });
    }
};

export const UnarchiveDepense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const password = req.body.password;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        const depense = (req as any).document;
        if (!depense) {
            return res.status(404).json({ message: "Dépense non trouvée" });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }
        depense.isArchived = false;
        await depense.save();
        res.status(200).json({message: "Dépense désarchivée avec succès", depense});
    } catch (error) {
        console.error("Erreur lors de la désarchivage de la dépense :", error);
        res.status(500).json({ message: "Erreur lors de la désarchivage de la dépense" });
    }
};

export const unarchiveAllDepenses = async (req: Request, res: Response) => {
    try {
        const user = req.user;  
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        const result = await Depense.updateMany(
            { user, isArchived: true },
            { $set: { isArchived: false } }
        );
        res.status(200).json({ message: `${result.modifiedCount} dépenses désarchivées avec succès` });
    } catch (error) {
        console.error("Erreur lors de la désarchivage des dépenses :", error);
        res.status(500).json({ message: "Erreur lors de la désarchivage des dépenses" });
    }
};

export const getDepensesByCategory = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
            const depenses = await Depense.aggregate([
                { $match: { user: (user as any)._id, isArchived: false } },
                { $group: { _id: "$categorie", totalMontant: { $sum: "$montant" }, count: { $sum: 1 } } },
                { $project: { categorie: "$_id", totalMontant: 1, count: 1, _id: 0 } },
            ]);
            res.status(200).json(depenses);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la récupération des dépenses par catégorie", error });
            console.error("Erreur lors de la récupération des dépenses par catégorie :", error);
        }
};
