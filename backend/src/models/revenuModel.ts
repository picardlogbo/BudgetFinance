import { model, Schema } from "mongoose";

export interface revenu {
    _id: string;
    title: string;
    date: Date;
    montant: number;
    frequence: "quotidienne" | "hebdomadaire" | "mensuelle" | "annuelle";
    categorie: "freelance" | "salaire" | "investissement" | "autre";
    user : Schema.Types.ObjectId;// Référence à l'utilisateur
    createdAt: Date;// Auto généré
    isActive?: true; 
}

const RevenuSchema = new Schema<revenu>({
    montant: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    frequence: { type: String, enum: ["quotidienne", "hebdomadaire", "mensuelle", "annuelle"], required: true },
    categorie: { type: String, enum: ["freelance", "salaire", "investissement", "autre"], required: true },
    title: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
}, 
    { timestamps: true }
);

const Revenu = model<revenu>("Revenu", RevenuSchema);
export default Revenu;