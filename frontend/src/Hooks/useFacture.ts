import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppContext } from "../Utils/AppContextUtils";
import * as ApiFacture from "../API/API-Facture";


// ✅ Hook personnalisé pour récupérer les factures
export const useGetFactures = () => {
    return useQuery({
        queryKey: ["factures"],
        queryFn: ApiFacture.getFactures,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// ✅ Hook personnalisé pour créer une facture
export const useCreateFacture = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (newFacture: ApiFacture.FactureFormData) => ApiFacture.createFacture(newFacture),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Facture ajoutée avec succès!' });
             console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["factures"] });
        },
         onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
            console.log("Error submitting form:", error);
        }
    });
};

// ✅ Hook personnalisé pour mettre à jour une facture
// export const useUpdateFacture = (factureId: string) => {

//     const queryClient = useQueryClient();
//     const { showToast } = useAppContext();
//     return useMutation({
//         mutationFn: (updateData: Partial<ApiFacture.FactureFormData>) => ApiFacture.updateFacture(factureId, updateData),
//         onSuccess: () => {
//              showToast({ type: 'SUCCESS', message: 'Facture mise à jour avec succès!' });
//              console.log("Facture mise à jour avec succès");
//             queryClient.invalidateQueries({ queryKey: ["factures"] });
//         },
//         onError: (error: Error) => {
//             showToast({ type: 'ERROR', message: error.message || 'Error submitting form' });
//             console.log("Error submitting form:", error);
//         }
//     });
// };

// ✅ Hook personnalisé pour mettre à jour une facture (sans passer factureId au moment du hook)
export const useUpdateFacture = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();

  return useMutation({
    mutationFn: ({ factureId, updateData }: { factureId: string; updateData: Partial<ApiFacture.FactureFormData> }) =>
      ApiFacture.updateFacture(factureId, updateData),

    onSuccess: () => {
      showToast({ type: "SUCCESS", message: "Facture mise à jour avec succès!" });
      console.log("Facture mise à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["factures"] });
    },

    onError: (error: Error) => {
      showToast({ type: "ERROR", message: error.message || "Erreur lors de la mise à jour" });
      console.log("Error submitting form:", error);
    },
  });
};


// ✅ Hook personnalisé pour supprimer une facture
export const useDeleteFacture = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (factureId: string) => ApiFacture.deleteFacture(factureId),
        onSuccess: () => {
             showToast({ type: 'SUCCESS', message: 'Facture supprimée avec succès!' });
             console.log("Facture supprimée avec succès");
            queryClient.invalidateQueries({ queryKey: ["factures"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Error deleting facture' });
            console.log("Error deleting facture:", error);
        }
    });
};