import { Request, Response } from "express";
import { Epargne, IEpargne } from "../models/EpargneModel.js";


// Créer une nouvelle épargne
export const createEpargne = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const userId = (user as any)._id ?? user;
    let { name ,category  , currentAmount, targetAmount, targetDate , } = req.body;

    const errors: string[] = [];
    if (!name) errors.push("nom requis");
    if (!category) errors.push("categorie requise");
    if (currentAmount === undefined) errors.push("montant actuel requis");
    if (targetAmount === undefined) errors.push("montant cible requis");
    if (targetDate === undefined) errors.push("date cible requise");
    if (typeof currentAmount !== "number" || currentAmount < 0) errors.push("montant actuel invalide");
    if (typeof targetAmount !== "number" || targetAmount < 0) errors.push("montant cible invalide");
    if (typeof targetDate !== "string") errors.push("date cible invalide");

    if (errors.length) {
      return res.status(400).json({ message: "Validation échouée", errors });
    }

    // ⚠️ Ne pas forcer en lowerCase
    name = name.trim();
    category = category.trim();
    currentAmount = currentAmount ?? 0;
    targetAmount = targetAmount ?? 0;
    targetDate = targetDate ?? new Date();

    // Vérifier les doublons
    const existing = await Epargne.findOne({ user: userId, name, category, currentAmount, targetAmount, targetDate });
    if (existing) {
      return res.status(409).json({ message: "cette épargne déjà existante pour cette période" });
    }

    // Créer
     const epargne = new Epargne({ user: userId, name, category, currentAmount, targetAmount, targetDate });
    await epargne.save();
    return res.status(201).json(epargne);

  } catch (err) {
    console.error("CreateEpargne error:", err);
    return res.status(500).json({ message: "Erreur lors de la création de l'épargne" });
  }
};

// Récupérer toutes les épargnes d'un utilisateur
export const getEpargnes = async (req: Request, res: Response) => {
  try {
     const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
    const epargnes = await Epargne.find({user});
    res.status(200).json(epargnes);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des épargnes", error });
  }
};

// Récupérer une épargne par son ID
export const getEpargneById = async (req: Request, res: Response) => {
  try {
    const epargneId = req.params.id;
    const epargne = await Epargne.findById(epargneId);
    if (!epargne) {
      return res.status(404).json({ message: "Épargne non trouvée" });
    }
    res.status(200).json(epargne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération de l'épargne", error });
  }
};

// Mettre à jour une épargne
export const updateEpargne = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    console.log("User from req:", user);
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const epargneId = req.params.id;
    const updatedData: Partial<IEpargne> = req.body;
    const updatedEpargne = await Epargne.findByIdAndUpdate(epargneId, updatedData, { new: true });
    if (!updatedEpargne) {
      return res.status(404).json({ message: "Épargne non trouvée" });
    }
    res.status(200).json(updatedEpargne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'épargne", error });
  }
};

// Contribuer à une épargne (ajouter un montant au currentAmount)
export const contributeToEpargne = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Non autorisé" });

    const epargneId = req.params.id;
    const contributionAmount = req.body.amount;

    // Vérifier si l'épargne existe
    const epargne = await Epargne.findById(epargneId);
    if (!epargne) {
      return res.status(404).json({ message: "Épargne non trouvée" });
    }

    // Mettre à jour le montant actuel
    epargne.currentAmount += contributionAmount;
    await epargne.save();

    res.status(200).json(epargne);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la contribution à l'épargne", error });
  }
};


// Supprimer une épargne
export const deleteEpargne = async (req: Request, res: Response) => {
  try {
    const epargneId = req.params.id;
    const deletedEpargne = await Epargne.findByIdAndDelete(epargneId);
    if (!deletedEpargne) {
      return res.status(404).json({ message: "Épargne non trouvée" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'épargne", error });
  }
};



// Mise à jour partielle d'une épargne (PATCH)
// export const updateEpargnePATCH = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const updatedEpargne = await Epargne.findByIdAndUpdate(
//       id,
//       { $set: req.body }, // applique seulement les champs envoyés
//       { new: true, runValidators: true }
//     );

//     if (!updatedEpargne) {
//       return res.status(404).json({ message: "Épargne non trouvée" });
//     }

//     res.json(updatedEpargne);
//   } catch (error: any) {
//     res.status(400).json({ message: "Erreur lors de la mise à jour partielle", error: error.message });
//   }
// };

// // Mise à jour complète d'une épargne (PUT) ou partielle (PATCH)
// export const updateEpargne = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     // Vérifier si l'épargne existe
//     const existing = await Epargne.findById(id);
//     if (!existing) {
//       return res.status(404).json({ message: "Épargne non trouvée" });
//     }

//     // Si c'est un PUT → vérifier que tous les champs nécessaires sont présents
//     if (req.method === "PUT") {
//       const { name, targetAmount, targetDate, category } = req.body;
//       if (!name || !targetAmount || !targetDate || !category) {
//         return res.status(400).json({ message: "Champs manquants pour une mise à jour complète" });
//       }
//     }

//     // Effectuer la mise à jour (PUT ou PATCH)
//     const updatedEpargne = await Epargne.findByIdAndUpdate(
//       id,
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     res.json(updatedEpargne);
//   } catch (error: any) {
//     res.status(400).json({
//       message: "Erreur lors de la mise à jour de l'épargne",
//       error: error.message,
//     });
//   }
// };
