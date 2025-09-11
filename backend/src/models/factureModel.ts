import { model, Schema, Document, Types } from "mongoose";

// =============================
// Modèle Facture (backend)
// =============================
// Améliorations apportées :
// - paidAt : date effective de paiement (analytics / audit)
// - statusHistory : trace des changements de statut
// - index (status + dateEcheance) pour cron + filtrage
// - hooks pré-update pour enrichir automatiquement paidAt & statusHistory

export interface IFacture extends Document {
    title: string;
    dateEcheance: Date;
    montant: number;
    categorie: "Électricité" | "Téléphone" | "Internet" | "Eau" | "Gaz" | "Canal +" | "Autre";
    user: Types.ObjectId;
    status: 'En_attente' | 'En_retard' | 'Payée';
    recurrent: boolean;
    isActive: boolean;
    paidAt?: Date | null;               // Renseigné quand statut devient Payée
    statusHistory: Array<{
        from?: string;                     // Ancien statut (optionnel si initial)
        to: string;                        // Nouveau statut
        changedAt: Date;                   // Horodatage du changement
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export const FactureSchema = new Schema<IFacture>({
    title: { type: String, required: true, trim: true },
    dateEcheance: { type: Date, required: true },
    montant: { type: Number, required: true, min: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    categorie: { type: String, enum: ["Électricité", "Téléphone", "Internet", "Eau", "Gaz", "Canal +", "Autre"], required: true },
    status: { type: String, enum: ['En_attente', 'En_retard', 'Payée'], default: 'En_attente', index: true },
    recurrent: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    paidAt: { type: Date, default: null },
    statusHistory: [{
        from: { type: String },
        to: { type: String, required: true },
        changedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Index combiné utilisé par la tâche cron et les filtres UI
FactureSchema.index({ status: 1, dateEcheance: 1 });

// Hook : enregistrement des changements de statut & paidAt automatique
FactureSchema.pre('findOneAndUpdate', function (next) {
    const update: any = this.getUpdate();
    if (!update) return next();
    const newStatus = update.$set?.status;
    if (newStatus) {
        // Ajout historique du statut
        const historyEntry = { to: newStatus, changedAt: new Date() };
        if (!update.$push) update.$push = {};
        if (!update.$push.statusHistory) update.$push.statusHistory = historyEntry;
        // Si Payée et paidAt absent → on fixe paidAt
        if (newStatus === 'Payée' && !update.$set.paidAt) {
            update.$set.paidAt = new Date();
        }
    }
    next();
});

const Facture = model<IFacture>('Facture', FactureSchema);
export default Facture;
