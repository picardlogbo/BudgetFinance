import { title } from "process";
import Revenu from "../models/revenuModel.js";
import { Request, Response } from "express";


export const CreateRevenu = async (req: Request, res: Response) => {
    try {
        const { montant, frequence, categorie, title } = req.body;

        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const newRevenu = new Revenu({ montant, frequence, categorie, title, user });
        await newRevenu.save();
        res.status(201).json(newRevenu);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du revenu" });
    }

};

export const GetRevenus = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const revenus = await Revenu.find({ user , isArchived: false }); // Récupérer uniquement les revenus non archivés
        res.status(200).json(revenus);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des revenus" });
    }
};  

export const GetRevenuById = async (req: Request, res: Response) => {
    try {
        // Récupérer l'ID du revenu depuis les paramètres de la requête
        const { id } = req.params;
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'authentification)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const revenu = (req as any).document;
        if (!revenu) {
            return res.status(404).json({ message: "Revenu non trouvé" });
        }

        res.status(200).json(revenu);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du revenu", error });
    }
};

export const UpdateRevenu = async (req: Request, res: Response) => {
    try {
        // Récupérer l'ID du revenu depuis les paramètres de la requête
        const { id } = req.params;
        // Récupérer les données mises à jour depuis le corps de la requête
        const { montant, frequence, categorie, title } = req.body || {};
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'IsOwner)
       const revenu = (req as any).document;

        // Mettre à jour les champs du revenu
        if(montant !== undefined) revenu.montant = montant;
        if(frequence !== undefined) revenu.frequence = frequence;
        if(categorie !== undefined) revenu.categorie = categorie;
        if(title !== undefined) revenu.title = title;

        // Sauvegarder les modifications
        await revenu.save();
        res.status(200).json({message: "Revenu mis à jour avec succès", revenu});
    } catch (error) {
        console.error("Erreur lors de la mise à jour du revenu :", error);
        res.status(500).json({ message: "Erreur lors de la mise à jour du revenu" });
    }
}   

export const deleteRevenu = async (req: Request, res: Response) => {
    try {
        // Récupérer l'ID du revenu depuis les paramètres de la requête
        const { id } = req.params;
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'authentification)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const revenu = (req as any).document;

        await revenu.deleteOne();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du revenu" });
    }
}

export const GetArchivedRevenus = async (req: Request, res: Response) => {
    try {
        const password = req.body.password; // Mot de passe envoyé dans le corps de la requête
        //= Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'authentification)
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }
        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Récupérer uniquement les revenus archivés
        const archivedRevenus = await Revenu.find({ user, isArchived: true });
        console.log("Revenus archivés :", archivedRevenus);
        res.status(200).json(archivedRevenus);
    } catch (error) {
        console.error("Erreur lors de la récupération des revenus archivés :", error);
        res.status(500).json({ message: "Erreur lors de la récupération des revenus archivés" });
    }
};

export const ArchiveRevenu = async (req: Request, res: Response) => {
    try {
        // Récupérer l'ID du revenu depuis les paramètres de la requête
        const { id } = req.params;
        const user = req.user;
        if (!user) {
           return res.status(401).json({ message: "Non Autorisé" });
       }
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'IsOwner)
       const revenu = (req as any).document;   
     

       if (!revenu) {
           return res.status(404).json({ message: "Revenu non trouvé" });
       }

       // await Revenu.find({ user, isArchived: true }); // Archiver le revenu
       revenu.isArchived = true;
       // Sauvegarder les modifications
       await revenu.save();
       res.status(200).json( {message: "Revenu archivé avec succès", revenu});
   } catch (error) {
       console.error("Erreur lors de l'archivage du revenu :", error);
       res.status(500).json({ message: "Erreur lors de l'archivage du revenu" });
   }
};

export const UnarchiveRevenu = async (req: Request, res: Response) => {
    try {
        // Récupérer l'ID du revenu depuis les paramètres de la requête
        const { id } = req.params;
        const password = req.body.password; // Mot de passe envoyé dans le corps de la requête

       const user = req.user;
       if (!user) {
           return res.status(401).json({ message: "Non Autorisé" });
       }
       // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'IsOwner)
       const revenu = (req as any).document;
       if (!revenu) {
           return res.status(404).json({ message: "Revenu non trouvé" });
       }

       // Vérifier le mot de passe
       const isPasswordValid = await user.comparePassword(password);
       if (!isPasswordValid) {
           return res.status(401).json({ message: "Mot de passe incorrect" });
       }

       // Désarchiver le revenu
       revenu.isArchived = false;
       await revenu.save();
       res.status(200).json({message: "Revenu désarchivé avec succès", revenu});
   } catch (error) {
         console.error("Erreur lors de la désarchivage du revenu :", error);
       res.status(500).json({ message: "Erreur lors de la désarchivage du revenu" });
   }
};

export const unarchiveAllRevenus = async (req: Request, res: Response) => {
    try {
        const password = req.body.password; // Mot de passe envoyé dans le corps de la requête

        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Désarchiver tous les revenus
        await Revenu.updateMany({ user, isArchived: true }, { isArchived: false });
        res.status(200).json({ message: "Tous les revenus ont été désarchivés avec succès" });
    } catch (error) {
        console.error("Erreur lors de la désarchivage des revenus :", error);
        res.status(500).json({ message: "Erreur lors de la désarchivage des revenus" });
    }
};
