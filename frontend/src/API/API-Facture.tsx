const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface FactureFormData  {
    // Catégories alignées avec le backend (accents + Canal +)
    categorie: "Téléphone" | "Internet" | "Électricité" | "Gaz" | "Eau" | "Canal +" | "Autre";
  title: string;
  montant: number;
  dateEcheance: Date;
  recurrent: boolean;
  status: "Payée" | "En_attente" | "En_retard";
}

export const createFacture = async (factureData: FactureFormData) => {
    const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(factureData),
    });

    if (!response.ok) {
        throw new Error('Failed to create facture: ' + response.statusText);
    }

    return await response.json();
};

export const getFactures = async () => {
    const response = await fetch(`${API_BASE_URL}/factures`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch invoices: ' + response.statusText);
    }

    return await response.json();
};

export const updateFacture = async (factureId: string, updateData: Partial<FactureFormData>) => {
    const response = await fetch(`${API_BASE_URL}/factures/${factureId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new Error('Failed to update facture: ' + response.statusText);
    }

    return await response.json();
};

export const deleteFacture = async (factureId: string) => {
    const response = await fetch(`${API_BASE_URL}/factures/${factureId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete facture: ' + response.statusText);
    }

    return true;
};
