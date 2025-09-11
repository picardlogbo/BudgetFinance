// src/models/depenseModel.ts
import mongoose, { Schema, Document, Types, model } from "mongoose";

/**
 * DépenseDocument (backend) :
 * - user : ObjectId (référence au User propriétaire)
 * - budget : ObjectId (optionnel — référence au Budget si trouvé)
 * - categorie : même enum que Budget pour cohérence
 * - montant : montant de la dépense
 * - description : texte libre
 * - date : date de la dépense
 * - isActive : soft delete (true = actif)
 */
export interface Depense {
  user: Types.ObjectId;
  budget?: Types.ObjectId; // peut être null si aucun budget lié
    frequence: "Quotidienne" | "Qebdomadaire" | "Mensuelle" | "Annuelle";
  categorie:
    | "Transport"
    | "Factures"
    | "Loyer"
    | "Loisirs"
    | "Alimentation"
    | "Santé"
    | "Éducation"
    | "Factures"
    | "Autre";
  montant: number;
  title: string;
  date: Date;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepenseSchema = new Schema<Depense>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    budget: { type: Schema.Types.ObjectId, ref: "Budget", default: null }, // null si pas de budget
    frequence: { type: String, enum: ["Quotidienne", "Hebdomadaire" , "Mensuelle", "Annuelle"], default: "Quotidienne" },
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
    montant: { type: Number, required: true },
    title: { type: String  , required: true },
    date: { type: Date, default: Date.now }, // date de la dépense
    isActive: { type: Boolean, default: true },
    isArchived: { type: Boolean, default: false },
  },
  {
    timestamps: true, // ajoute createdAt et updatedAt
  }
);

const Depense = model<Depense>("Depense", DepenseSchema);
export default Depense;
