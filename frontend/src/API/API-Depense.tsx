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
export const getDepenses = async (options?: { includeArchived?: boolean }) => {
  const qs = options?.includeArchived ? '?includeArchived=1' : '';
  const response = await fetch(`${API_BASE_URL}/depenses${qs}`, {
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

// --- Archivage ---
export const getArchivedDepenses = async () => {
  const response = await fetch(`${API_BASE_URL}/depenses/archived`, {
    method: 'GET',
    credentials: 'include'
  });
  if(!response.ok) throw new Error('Erreur récupération archivées');
  return response.json();
};

export const getArchivedDepensesSecure = async (password: string) => {
  const response = await fetch(`${API_BASE_URL}/depenses/archived/secure`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if(!response.ok) throw new Error('Mot de passe invalide ou erreur serveur');
  return response.json();
};

export const archiveDepense = async (id: string) => {
  const response = await fetch(`${API_BASE_URL}/depenses/${id}/archive`, {
    method: 'POST',
    credentials: 'include'
  });
  if(!response.ok) throw new Error('Erreur archivage');
  return response.json();
};

export const unarchiveDepense = async (id: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/depenses/${id}/unarchive`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  if(!response.ok) throw new Error('Erreur désarchivage');
  return response.json();
};

export const unarchiveAllDepenses = async () => {
  const response = await fetch(`${API_BASE_URL}/depenses/unarchive-all`, {
    method: 'POST',
    credentials: 'include'
  });
  if(!response.ok) throw new Error('Erreur désarchivage global');
  return response.json();
};
