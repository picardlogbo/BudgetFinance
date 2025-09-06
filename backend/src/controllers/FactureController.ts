import {Request , Response} from "express"
import Facture from "../models/factureModel.js";


export const createFacture = async (req:Request , res:Response) => {

    try {
         const {title , dateEcheance , montant , categorie , status , recurrent } = req.body ;

    const user = req.user ; 
    if(!user){
        return res.status(401).json({message : " non autorisé "});
    }

    const facture = new Facture({
        title,
        dateEcheance,
        montant,
        categorie,
        recurrent: req.body.recurrent || false,
        status: status || 'En_attente',
        user
    });
    await facture.save();

    res.status(201).json(facture)
    } catch (error) {
        console.error("Erreur createFacture:", error);
        res.status(500).json({message : "Erreur lors de la creation de la facture"})
    }
}

export const GetFacture = async (req:Request , res:Response) =>{

    try {
        const user = req.user ;
        if(!user){
        return res.status(401).json({message : " non autorisé "});
    }
        const facture = await Facture.find({user}) 
        res.status(201).json(facture);
    } catch (error) {
        console.error("Erreur GetFacture:", error);
        res.status(500).json({message : "Erreur lors de la recuperation de la facture"});

    }
   
}

export const GetFactureById = async (req:Request , res:Response) => {

    try {
         const {id} = req.params ;
         const user = req.user ; 

         if(!user){
            return res.status(401).json({message : "non autorise"});
        }
        const facture = (req as any).document ;
        if(!facture){
            return res.status(404).json({message : "facture non trouve"})
        }
        res.status(201).json(facture);
    } catch (error) {
        console.error("Erreur GetFactureById:", error);
        return res.status(500).json({message : "Erreur lors de la recuperation de la facture"})
    }
}

export const UpdateFacture = async (req:Request , res:Response) => {

    try {
         const {title ,montant , dateEcheance , categorie , status } = req.body;
         const {id} = req.params ; 
         const user = req.user; 
         if(!user){
            return res.status(401).json({message : "non autorise"});
        }
        const facture = (req as any).document;
    
        if( montant !== undefined ) facture.montant = montant;
        if(title !== undefined) facture.title = title; 
        if(dateEcheance !== undefined) facture.dateEcheance = dateEcheance;
        if(categorie !== undefined) facture.categorie = categorie;
        if(status !== undefined) facture.status = status;

        await facture.save();
        res.status(201).json(facture)

    } catch (error) {
        console.error("Erreur UpdateFacture:", error);
        return res.status(500).json({message : "Erreur lors de la recuperation de la facture" })
    }
}

export const deleteFacture = async (req:Request , res:Response) => {

    try {
        const {id} = req.params ; 
        const user = req.user ;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        const facture = (req as any).document; 
        if (!facture) {
            return res.status(404).json({ message: "Facture non trouvée" });
        }

        await facture.deleteOne();
        res.status(204).send();
    } catch (error) {
        console.error("Erreur deleteFacture:", error);
        return res.status(500).json({ message: "Erreur lors de la suppression de la facture" });
    }
    
}
