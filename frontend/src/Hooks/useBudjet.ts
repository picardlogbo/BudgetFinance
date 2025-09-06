import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiBudjet from "../API/API-Budgets";
import { useAppContext } from "../Utils/AppContextUtils";

export const useGetBudget = () => {
  // Custom hook logic for budget management
   return useQuery({
        queryKey: ["budgets"],
        queryFn: ApiBudjet.getBudgets,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ✅ Hook personnalisé pour créer un Budget
export const useCreateBudget = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (newBudget: ApiBudjet.BudgetFormValues) => ApiBudjet.createBudget(newBudget),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Budget added successfully!' });
             console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
         onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

export const useUpdateBudget = (budgetId: string) => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (updatedBudget: ApiBudjet.BudgetFormValues) => ApiBudjet.updateBudget(budgetId, updatedBudget),
        onSuccess: () => {
            showToast({ type: 'SUCCESS', message: 'Budget updated successfully!' });
            console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

export const useDeleteBudget = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (budgetId: string) => ApiBudjet.deleteBudget(budgetId),
        onSuccess: () => {
            showToast({ type: 'SUCCESS', message: 'Budget deleted successfully!' });
            console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};
