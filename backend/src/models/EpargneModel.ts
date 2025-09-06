import mongoose, { Schema } from "mongoose";

export interface IEpargne extends Document {
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  category: "Hopital" | "Vacances" | "Maison" | "Voiture" | "Éducation" | "Retraite" | "General" | string;
  user: mongoose.Types.ObjectId; // lien avec l'utilisateur
}



const EpargneSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    targetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    category: {
      type: String,
      enum: ["Urgence", "Hopital", "Vacances", "Maison", "Voiture", "Éducation", "Retraite", "Général", "Autre"],
      default: "Général",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // chaque épargne appartient à un utilisateur
    },
  },
  {
    timestamps: true, // ajoute createdAt & updatedAt automatiquement
  }
);

export const Epargne = mongoose.model<IEpargne>("Epargne", EpargneSchema);