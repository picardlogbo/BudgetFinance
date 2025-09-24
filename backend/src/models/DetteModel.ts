import { Schema, model, Document, Types } from "mongoose";

/**
 * Dette créée quand épargne insuffisante pour couvrir le dépassement.
 * - Unique par (user, mois, annee)
 * - On l'augmente si le dépassement du mois grandit.
 */
export interface Dette extends Document {
  user: Types.ObjectId;
  mois: number;     // 1..12
  annee: number;    // ex: 2025
  montant: number;  // dette du mois
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DetteSchema = new Schema<Dette>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mois: { type: Number, required: true, min: 1, max: 12 },
    annee: { type: Number, required: true },
    montant: { type: Number, required: true, min: 0 },
    reason: { type: String },
  },
  { timestamps: true }
);

DetteSchema.index({ user: 1, mois: 1, annee: 1 }, { unique: true });

export default model<Dette>("Dette", DetteSchema);