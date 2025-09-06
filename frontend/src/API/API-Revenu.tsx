const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface RevenuFormData  {
    montant: number;
    title?: string;
     frequence: "Quotidien" | "Hebdomadaire" | "Mensuel" | "Annuel";
     categorie:
    "freelance" | 
    "salaire" | 
    "investissement" |
     "autre";
    date?: string;
    isActive: boolean;
}

export const createRevenu = async (revenueData: RevenuFormData) => {
    const response = await fetch(`${API_BASE_URL}/revenus`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(revenueData),
    });

    if (!response.ok) {
        throw new Error('Failed to create revenue: ' + response.statusText);
    }

    return await response.json();
};

export const getRevenus = async () => {
    const response = await fetch(`${API_BASE_URL}/revenus`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch revenues: ' + response.statusText);
    }

    return await response.json();
};

export const updateRevenu = async (revenueId: string, updateData: Partial<RevenuFormData>) => {
    const response = await fetch(`${API_BASE_URL}/revenus/${revenueId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new Error('Failed to update revenue: ' + response.statusText);
    }

    return await response.json();
};

export const deleteRevenu = async (revenueId: string) => {
    const response = await fetch(`${API_BASE_URL}/revenus/${revenueId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete revenue: ' + response.statusText);
    }

    return true;
};
