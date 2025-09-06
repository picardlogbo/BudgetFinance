// import { Depenses } from "../Types/depense";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export interface depenseFormData  {
    montant: number;
    title?: string;
     frequence: "Quotidien" | "Hebdomadaire" | "Mensuel" | "Annuel";
     categorie:
    | "Transport"
    | "Factures"
    | "Loyer"
    | "Loisirs"
    | "Alimentation"
    | "Santé"
    | "Éducation"
    | "Autre";
    date?: string;
    isActive: boolean;
}
/**
 * Créer une dépense
 */
export const createDepense = async ( depenseData:depenseFormData ) => {
  const response = await fetch(`${API_BASE_URL}/depenses`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(depenseData),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la création de la dépense: " + response.statusText);
  }

  return (await response.json()) ;
};

/**
 * Récupérer toutes les dépenses de l’utilisateur connecté
 */
export const getDepenses = async () => {
  const response = await fetch(`${API_BASE_URL}/depenses`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des dépenses: " + response.statusText);
  }

  return (await response.json());
};

/**
 * Mettre à jour une dépense
 */
export const updateDepense = async (depenseId: string, updateData: Partial<depenseFormData>) => {
  const response = await fetch(`${API_BASE_URL}/depenses/${depenseId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour de la dépense: " + response.statusText);
  }

  return (await response.json());
};

/**
 * Supprimer une dépense
 */
export const deleteDepense = async (depenseId: string) => {
  const response = await fetch(`${API_BASE_URL}/depenses/${depenseId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression de la dépense: " + response.statusText);
  }

  return true;
};
