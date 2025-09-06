// Interface frontend pour les dépenses - alignée sur le modèle backend


type Frequence = "Mensuelle" | "Annuelle" | "Quotidienne" | "Hebdomadaire"|string;
type Categorie = "Alimentation" | "Transport" | "Santé" | "Loisirs" | "Loyer" | "Factures" | "Éducation" | "Autre" | string;


export interface Depenses {
    _id: string;                    // _id du document MongoDB (converti en string côté frontend)
    title: string;                 // Description de la dépense
    montant: number;               // Montant en euros
    frequence: Frequence// Fréquence de la dépense
    categorie:  Categorie // Catégorie
    user: string;                  // ID de l'utilisateur propriétaire (référence)
    createdAt: Date;               // Date de création (auto-générée par MongoDB)
    isActive: boolean;             // Statut actif/inactif de la dépense
}

