export interface Facture {
  _id: string;
  user: string;
  // Catégories alignées avec le backend (accents)
  categorie: "Téléphone" | "Internet" | "Électricité" | "Gaz" | "Eau" | "Canal +" | "Autre";
  createdAt: Date;
  title: string;
  status: "Payée" | "En_attente" | "En_retard";
  montant: number;
  dateEcheance: Date;
  recurrent: boolean;
};
