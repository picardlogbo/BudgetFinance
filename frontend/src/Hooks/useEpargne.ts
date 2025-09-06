import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as ApiEpargne from "../API/API-Epargne";
import { useAppContext } from "../Utils/AppContextUtils";

export const useGetEpargne = () => {
  // Hook logic here (e.g., state management, API calls)
  return useQuery({
    queryKey: ["epargne"],
    queryFn: () => ApiEpargne.getEpargnes(),
    // staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
export const useCreateEpargne = () => {
  const queryClient = useQueryClient();
  const { showToast } = useAppContext();
  return useMutation({
    mutationFn: (newEpargneData: ApiEpargne.EpargneFormValues) => ApiEpargne.createEpargne(newEpargneData),
    onSuccess: () => {
      showToast({ type: 'SUCCESS', message: 'Épargne ajoutée avec succès!' });
      console.log("Form submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["epargne"] });
    },
    onError: (error: Error) => {
      showToast({ type: 'ERROR', message: error.message || 'Erreur lors de l\'envoi du formulaire' });
            console.log("Error submitting form:", error);
        }
  });
};

export const useUpdateEpargne = () => {

    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    return useMutation({
        mutationFn: ({epargneId, updateData}: {epargneId: string, updateData: Partial<ApiEpargne.EpargneFormValues>}) => ApiEpargne.updateEpargne(epargneId, updateData),
        onSuccess: () => {
            showToast({ type: 'SUCCESS', message: 'Épargne mise à jour avec succès!' });
            console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["epargne"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Erreur lors de l\'envoi du formulaire' });
            console.log("Error submitting form:", error);
        }
    });
};

export const useContributeToEpargne = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    return useMutation({
        mutationFn: ({ epargneId, amount }: { epargneId: string, amount: number }) => ApiEpargne.contributeToEpargne(epargneId, amount),
        onSuccess: () => {
            showToast({ type: 'SUCCESS', message: 'Contribution à l\'épargne réussie!' });
            console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["epargne"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Erreur lors de l\'envoi du formulaire' });
            console.log("Error submitting form:", error);
        }
    });
};

export const useDeleteEpargne = () => {
    const queryClient = useQueryClient();
    const { showToast } = useAppContext();

    return useMutation({
        mutationFn: (epargneId: string) => ApiEpargne.deleteEpargne(epargneId),
        onSuccess: () => {
            showToast({ type: 'SUCCESS', message: 'Épargne supprimée avec succès!' });
            console.log("Form submitted successfully");
            queryClient.invalidateQueries({ queryKey: ["epargne"] });
        },
        onError: (error: Error) => {
            showToast({ type: 'ERROR', message: error.message || 'Erreur lors de l\'envoi du formulaire' });
            console.log("Error submitting form:", error);
        }
    });
};

export const useGetEpargneById = (epargneId: string) => {
    return useQuery({
        queryKey: ["epargne", epargneId],
        queryFn: () => ApiEpargne.getEpargneById(epargneId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
