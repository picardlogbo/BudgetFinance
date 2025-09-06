export interface Facture {
  _id: string;
  user: string;
  categorie: "Telephone" | "Internet" | "Electricité" | "Gaz" | "Eau" | "Autre";
  createdAt: Date;
  title: string;
  status: "Payée" | "En_attente" | "En_retard";
  montant: number;
  dateEcheance: Date;
  recurrent: boolean;
};
