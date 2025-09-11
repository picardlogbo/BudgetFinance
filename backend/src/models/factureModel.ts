import { model, Schema } from "mongoose";

// Modèle Facture (backend)
// Catégories alignées avec le frontend, avec accents corrects
export interface Facture {
    _id: string;
    title: string;
    dateEcheance: Date;
    montant: number;
    // Inclus: "Canal +" (demande utilisateur), "Gaz" et accents
    categorie: "Électricité" | "Téléphone" | "Internet" | "Eau" | "Gaz" | "Canal +" | "Autre";
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
    // Catégories autorisées (avec accents) – inclus "Gaz" et "Canal +"
    categorie: { type: String, enum: ["Électricité", "Téléphone", "Internet", "Eau", "Gaz", "Canal +", "Autre"], required: true },
    status: { type: String, enum: ['En_attente', 'En_retard', 'Payée'], default: 'En_attente' },
    recurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Facture = model<Facture>("Facture", FactureSchema);
// Index pour accélérer les requêtes du cron (filtre sur status + dateEcheance)
FactureSchema.index({ status: 1, dateEcheance: 1 });
export default Facture;
