import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiClient from "../API/API-Depense";
import type{ depenseFormData } from "../API/API-Depense";
import { useAppContext } from "../Utils/AppContextUtils";

// ✅ Hook personnalisé pour récupérer les dépenses
export const useGetDepenses = () => {
    return useQuery({
        queryKey: ["depenses"],
        queryFn: ApiClient.getDepenses,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ✅ Hook personnalisé pour créer une dépense
export const useCreateDepense = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (newDepense: depenseFormData) => ApiClient.createDepense(newDepense),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Expense added successfully!' });
             console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["depenses"] });
        },
         onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

// ✅ Hook personnalisé pour mettre à jour une dépense
export const useUpdateDepense = (depenseId: string) => {

    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (updateData: Partial<depenseFormData>) => ApiClient.updateDepense(depenseId, updateData),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Hostel added successfully!' });
             console.log("Expense submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["depenses"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

// ✅ Hook personnalisé pour supprimer une dépense
export const useDeleteDepense = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (depenseId: string) => ApiClient.deleteDepense(depenseId),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Hostel added successfully!' });
             console.log("Expense deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["depenses"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error deleting expense' });
            console.log("Error deleting expense:", error);
        }
    });
};