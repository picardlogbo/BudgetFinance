// Type côté frontend pour refléter le JSON renvoyé par l'API.
// Les dates arrivent en string (ISO) et pourront être converties côté UI si besoin.
export interface Facture {
  _id: string;
  user: string;
  categorie: "Téléphone" | "Internet" | "Électricité" | "Gaz" | "Eau" | "Canal +" | "Autre";
  title: string;
  status: "Payée" | "En_attente" | "En_retard";
  montant: number;
  dateEcheance: string;   // ISO string
  createdAt: string;      // ISO string
  updatedAt?: string;     // ISO string
  recurrent: boolean;
  paidAt?: string | null; // Présent si statut Payée
  statusHistory?: Array<{
    from?: string;
    to: string;
    changedAt: string; // ISO string
  }>;
};
