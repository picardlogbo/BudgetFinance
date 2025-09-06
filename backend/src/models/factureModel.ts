import { model, Schema } from "mongoose";

export interface Facture {
    _id: string;
    title: string;
    dateEcheance: Date;
    montant: number;
    categorie: "Electricité" | "Téléphone" | "Internet" | "Eau"| "Canal +"| "Autre";
    user: Schema.Types.ObjectId; // Référence à l'utilisateur
    createdAt: Date; // Auto généré
    status: 'En_attente' | 'En_retard' | 'Payée';
    recurrent: boolean;
    isActive?: true;
}

export const FactureSchema = new Schema<Facture>({
    title: { type: String, required: true },
    dateEcheance: { type: Date, default: Date.now },
    montant: { type: Number, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    categorie: { type: String, enum: ["Electricité", "Téléphone", "Internet", "Eau", "Canal +", "Autre"], required: true },
    status: { type: String, enum: ['En_attente', 'En_retard', 'Payée'], default: 'En_attente' },
    recurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Facture = model<Facture>("Facture", FactureSchema);
export default Facture;
