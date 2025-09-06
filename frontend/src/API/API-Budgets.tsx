const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface BudgetFormValues {
    categorie: string;
    montantAlloue: number;
    montantDepense: number;
    mois: number;
    annee: number;
}

export const createBudget = async (budgetData: BudgetFormValues) => {
    console.log("[CREATE_BUDGET] Payload envoyé:", budgetData);
    const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(budgetData),
    });
    
    const data = await response.json();
    console.log("[CREATE_BUDGET] Réponse serveur:", data);

    if (!response.ok) {
        throw new Error('Failed to create budget: ' + response.statusText);
    }

    return data;
};

export const getBudgets = async () => {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch budgets: ' + response.statusText);
    }

    return await response.json();
};

export const updateBudget = async (budgetId: string, updateData: Partial<BudgetFormValues>) => {
    const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new Error('Failed to update budget: ' + response.statusText);
    }

    return await response.json();
};

export const deleteBudget = async (budgetId: string) => {
    const response = await fetch(`${API_BASE_URL}/budgets/${budgetId}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to delete budget: ' + response.statusText);
    }

    return true;
};
