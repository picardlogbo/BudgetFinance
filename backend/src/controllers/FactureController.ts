import {Request , Response} from "express";
import Facture from "../models/factureModel.js";
import Depense from "../models/depensesModel.js";
import Budget from "../models/BudgetModel.js";

// (Optionnel) service de notification – à implémenter (email / sms)
// import { sendNotification } from '../services/notificationService';


export const createFacture = async (req:Request , res:Response) => {
  try {
    const { title, dateEcheance, montant, categorie, status, recurrent } = req.body;
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: " non autorisé " });
    }

    // Validation manuelle de base (défense en profondeur)
    if (!title || !dateEcheance || montant === undefined || !categorie) {
      return res.status(400).json({ message: 'Champs requis manquants' });
    }

    const initialStatus = status || 'En_attente';
    const facture = new Facture({
      title,
      dateEcheance,
      montant,
      categorie,
      recurrent: recurrent || false,
      status: initialStatus,
      user,
      // Historique initial du statut
      statusHistory: [{ to: initialStatus, changedAt: new Date() }],
      paidAt: initialStatus === 'Payée' ? new Date() : null
    });
    await facture.save();

    // Placeholder notification (ex: confirmation création)
    // await sendNotification(user, `Facture créée: ${title}`);

    res.status(201).json(facture);
  } catch (error) {
    console.error("Erreur createFacture:", error);
    res.status(500).json({ message: "Erreur lors de la creation de la facture" });
  }
};

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
    const { title, montant, dateEcheance, categorie, status } = req.body;        
    const user = req.user; 
    if (!user) {
      return res.status(401).json({ message: "non autorise" });
    }
    const facture = (req as any).document;
    if (!facture) {
      return res.status(404).json({ message: "facture non trouve" });
    }

    const previousStatus = facture.status;

    if (montant !== undefined) facture.montant = montant;
    if (title !== undefined) facture.title = title; 
    if (dateEcheance !== undefined) facture.dateEcheance = dateEcheance;
    if (categorie !== undefined) facture.categorie = categorie;
    if (req.body.recurrent !== undefined) facture.recurrent = req.body.recurrent;
    if (status !== undefined && status !== previousStatus) {
      facture.status = status;
      // Ajout historique statut
      facture.statusHistory.push({ from: previousStatus, to: status, changedAt: new Date() });
      // Gestion paidAt
      if (status === 'Payée' && !facture.paidAt) {
        facture.paidAt = new Date();
      }
      if (status !== 'Payée') {
        facture.paidAt = null; // Si on reviens en arrière (ex: erreur)
      }
    }

    await facture.validate();
    await facture.save();

    // Si la facture vient d'être payée → enregistrer comme dépense + MAJ budget
    if (status === 'Payée' && previousStatus !== 'Payée') {
      const depense = new Depense({
        user: user,
        title: `Facture ${facture.categorie}`,
        montant: facture.montant,
        categorie: "Factures",
        frequence: "Mensuelle",
        date: new Date(),
        isActive: true,
      });
      await depense.save();

      const maintenant = new Date();
      const mois = maintenant.getMonth() + 1;
      const annee = maintenant.getFullYear();
      let budget = await Budget.findOne({ user: user, categorie: 'Factures', mois, annee });
      if (budget) {
        budget.montantDepense += facture.montant;
        await budget.save();
      } else {
        budget = new Budget({
          user: user,
          categorie: 'Factures',
          montantAlloue: 0,
          montantDepense: facture.montant,
          mois,
          annee,
          isActive: true
        });
        await budget.save();
      }
      // Placeholder notification paiement
      // await sendNotification(user, `Facture payée: ${facture.title}`);
    }

    res.status(200).json(facture);
  } catch (error) {
    console.error("Erreur UpdateFacture:", error);
    return res.status(500).json({ message: "Erreur lors de la mise à jour de la facture" });
  }
};

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
