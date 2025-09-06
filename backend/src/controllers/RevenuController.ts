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

        const revenus = await Revenu.find({ user });
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
        const { montant, frequence, categorie, title } = req.body;
        // Récupérer l'utilisateur depuis la requête (ajouté par le middleware d'IsOwner)
       const revenu = (req as any).document;

        // Mettre à jour les champs du revenu
        if(montant !== undefined) revenu.montant = montant;
        if(frequence !== undefined) revenu.frequence = frequence;
        if(categorie !== undefined) revenu.categorie = categorie;
        if(title !== undefined) revenu.title = title;

        // Sauvegarder les modifications
        await revenu.save();
        res.status(200).json(revenu);
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