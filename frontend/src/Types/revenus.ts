// Interface frontend pour les revenus - alignée sur le modèle backend
export interface Revenu {
    _id: string;                    // _id du document MongoDB (converti en string côté frontend)
    title: string;                 // Titre/description du revenu
    montant: number;               // Montant en euros
    date: Date;                    // Date du revenu (peut être différente de createdAt)
    frequence: 'quotidienne' | 'hebdomadaire' | 'mensuelle' | 'annuelle'; // Fréquence du revenu
    categorie: "salaire" | "freelance" | "investissement" | "autre"; // Catégorie du revenu
    user: string;                  // ID de l'utilisateur propriétaire (référence)
    createdAt: Date;               // Date de création (auto-générée par MongoDB)
    isActive: boolean;             // Statut actif/inactif du revenu
    description?: string;          // Description optionnelle
}
    