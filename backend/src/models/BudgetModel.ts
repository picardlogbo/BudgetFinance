// src/models/budgetModel.ts
import mongoose, { Schema, Document, Types, model } from "mongoose";

/**
 * BudgetDocument (backend) :
 * - user : ObjectId (référence à l'utilisateur)
 * - categorie : catégorie du budget (enum)
 * - montantAlloue : montant que l'utilisateur prévoit (optionnel)
 * - montantDepense : total dépensé sur ce budget (se met à jour automatiquement)
 * - mois, annee : période du budget (ex: mois=8, annee=2025)
 * - isActive : soft delete (true = actif)
 */
export interface Budget extends Document {
  user: Types.ObjectId;
  categorie:
    | "Transport"
    | "Factures"
    | "Loyer"
    | "Loisirs"
    | "Alimentation"
    | "Santé"
    | "Éducation"
    | "Autre";
  montantAlloue: number; // 0 si pas alloué
  montantDepense: number; // démarre à 0
  mois: number; // 1-12
  annee: number; // ex: 2025
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<Budget>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // proprio du budget
    categorie: {
      type: String,
      enum: [
        "Transport",
        "Factures",
        "Loyer",
        "Loisirs",
        "Alimentation",
        "Santé",
        "Éducation",
        "Autre",
      ],
      required: true,
    },
    // montant alloué (prévisionnel). 0 signifie "pas d'allocation", on fera du suivi simplement.
    montantAlloue: { type: Number, default: 0 },

    // montant réellement dépensé sur ce budget -> on incrémente à chaque dépense associée
    montantDepense: { type: Number, default: 0 },

    // période du budget (par mois + année, plus simple pour regrouper par mois)
    mois: { type: Number, required: true }, // 1..12
    annee: { type: Number, required: true }, // ex 2025

    // soft delete
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt automatiquement
  }
);

const Budget = model<Budget>("Budget", BudgetSchema);
export default Budget;
