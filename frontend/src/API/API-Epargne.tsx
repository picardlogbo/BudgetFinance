const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export interface EpargneFormValues {
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string; // ISO date string
    category: "Urgence" | 'Hopital' | 'Vacances' | 'Maison' | 'Voiture' | 'Éducation' | 'Retraite' | 'Général' | 'Autre' | string;
}

// Crée une nouvelle épargne
export const createEpargne = async (epargneData: EpargneFormValues) => {
    console.log("[CREATE_EPARGNE] Payload envoyé:", epargneData);
    const response = await fetch(`${API_BASE_URL}/epargnes`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(epargneData),
    });
    if (!response.ok) {
        console.error("[CREATE_EPARGNE] Erreur lors de la création de l'épargne:", response.statusText);
        throw new Error("Erreur lors de la création de l'épargne");
    }
    const createdEpargne = await response.json();
    console.log("[CREATE_EPARGNE] Épargne créée avec succès:", createdEpargne);
    return createdEpargne;
};

// Récupère toutes les épargnes
export const getEpargnes = async () => {
    const response = await fetch(`${API_BASE_URL}/epargnes`, {
        method: "GET",
        credentials: 'include',
    });
    if (!response.ok) {
        console.error("[GET_EPARGNES] Erreur lors de la récupération des épargnes:", response.statusText);
        throw new Error("Erreur lors de la récupération des épargnes");
    }
    const epargnes = await response.json();
    console.log("[GET_EPARGNES] Épargnes récupérées avec succès:", epargnes);
    return epargnes;
};


// Récupère une épargne par ID
export const getEpargneById = async (epargneId: string) => {
    const response = await fetch(`${API_BASE_URL}/epargnes/${epargneId}`, {
        method: "GET",
        credentials: 'include',
    });
    if (!response.ok) {
        console.error("[GET_EPARGNE_BY_ID] Erreur lors de la récupération de l'épargne:", response.statusText);
        throw new Error("Erreur lors de la récupération de l'épargne");
    }
    const epargne = await response.json();
    console.log("[GET_EPARGNE_BY_ID] Épargne récupérée avec succès:", epargne);
    return epargne;
};

// Met à jour une épargne par ID
export const updateEpargne = async (epargneId: string, updateData: Partial<EpargneFormValues>) => {
    console.log(`[UPDATE_EPARGNE] Mise à jour de l'épargne ${epargneId} avec les données:`, updateData);
    const response = await fetch(`${API_BASE_URL}/epargnes/${epargneId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
    });
    if (!response.ok) {
        console.error("[UPDATE_EPARGNE] Erreur lors de la mise à jour de l'épargne:", response.statusText);
        throw new Error("Erreur lors de la mise à jour de l'épargne");
    }
    const updatedEpargne = await response.json();
    console.log("[UPDATE_EPARGNE] Épargne mise à jour avec succès:", updatedEpargne);
    return updatedEpargne;
};

//export const contributeToEpargne = async (epargneId: string, amount: number) => {
export const contributeToEpargne = async (epargneId: string, amount: number) => {
    console.log(`[CONTRIBUTE_EPARGNE] Contribution de ${amount} à l'épargne ${epargneId}`);
    const response = await fetch(`${API_BASE_URL}/epargnes/${epargneId}/contribute`, {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
    });
    if (!response.ok) {
        console.error("[CONTRIBUTE_EPARGNE] Erreur lors de la contribution à l'épargne:", response.statusText);
        throw new Error("Erreur lors de la contribution à l'épargne");
    }
    const updatedEpargne = await response.json();
    console.log("[CONTRIBUTE_EPARGNE] Épargne mise à jour avec succès:", updatedEpargne);
    return updatedEpargne;
};

// Supprime une épargne par ID
export const deleteEpargne = async (epargneId: string) => {
    console.log(`[DELETE_EPARGNE] Suppression de l'épargne ${epargneId}`);
    const response = await fetch(`${API_BASE_URL}/epargnes/${epargneId}`, {
        method: "DELETE",
        credentials: 'include',
    });
    if (!response.ok) {
        console.error("[DELETE_EPARGNE] Erreur lors de la suppression de l'épargne:", response.statusText);
        throw new Error("Erreur lors de la suppression de l'épargne");
    }
    console.log("[DELETE_EPARGNE] Épargne supprimée avec succès");
};
