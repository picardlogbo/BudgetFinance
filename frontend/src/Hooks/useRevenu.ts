import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiRevenu from "../API/API-Revenu";
import { useAppContext } from "../Utils/AppContextUtils";

// ✅ Hook personnalisé pour récupérer les revenus
export const useGetRevenus = () => {
    return useQuery({
        queryKey: ["revenus"],
        queryFn: ApiRevenu.getRevenus,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ✅ Hook personnalisé pour créer un revenu
export const useCreateRevenu = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (newRevenu: ApiRevenu.RevenuFormData) => ApiRevenu.createRevenu(newRevenu),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Revenue added successfully!' });
             console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["revenus"] });
        },
         onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

// ✅ Hook personnalisé pour mettre à jour un revenu
export const useUpdateRevenu = (revenuId: string) => {

    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (updateData: Partial<ApiRevenu.RevenuFormData>) => ApiRevenu.updateRevenu(revenuId, updateData),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Revenue updated successfully!' });
             console.log("Revenue updated successfully");
            queryClient.invalidateQueries({ queryKey: ["revenus"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

// ✅ Hook personnalisé pour supprimer une dépense
export const useDeleteRevenu = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (revenuId: string) => ApiRevenu.deleteRevenu(revenuId),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Revenue deleted successfully!' });
             console.log("Revenue deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["revenus"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error deleting revenue' });
            console.log("Error deleting revenue:", error);
        }
    });
};