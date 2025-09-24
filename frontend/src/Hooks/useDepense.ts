import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiClient from "../API/API-Depense";
import type{ depenseFormData } from "../API/API-Depense";
import { useAppContext } from "../Utils/AppContextUtils";

// ✅ Hook personnalisé pour récupérer les dépenses (exclut archivées par défaut)
export const useGetDepenses = (options?: { includeArchived?: boolean }) => {
    const includeArchived = !!options?.includeArchived;
    return useQuery({
        queryKey: ["depenses", includeArchived ? "withArchived" : "active"],
        queryFn: () => ApiClient.getDepenses({ includeArchived }),
        staleTime: 5 * 60 * 1000,
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
            // Après ajout, on rafraîchit à la fois les dépenses (liste) et les budgets (totaux)
            queryClient.invalidateQueries({ queryKey: ["depenses"] });
            queryClient.invalidateQueries({ queryKey: ["budgets"] });
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

// --- Archivage ---
export const useGetArchivedDepenses = () => {
    return useQuery({
        queryKey: ['depenses','archived'],
        queryFn: ApiClient.getArchivedDepenses,
        staleTime: 60_000
    });
};

export const useGetArchivedDepensesSecure = (password: string) => {
    return useQuery({
        queryKey: ['depenses','archived','secure', Boolean(password)],
        enabled: !!password,
        queryFn: () => ApiClient.getArchivedDepensesSecure(password),
        staleTime: 0
    });
};

export const useArchiveDepense = () => {
    const qc = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: (id: string) => ApiClient.archiveDepense(id),
        onSuccess: () => {
            showToast({ type:'SUCCESS', message:'Dépense archivée'});
            // Ne plus afficher l'élément dans la liste (depenses) mais les budgets doivent se mettre à jour
            qc.invalidateQueries({ queryKey:['depenses'] });
            qc.invalidateQueries({ queryKey:['budgets'] });
            qc.invalidateQueries({ queryKey:['depenses','archived'] });
        },
            onError: (e: unknown) => {
                const msg = e instanceof Error ? e.message : 'Erreur archivage';
                showToast({ type:'ERROR', message: msg });
            }
    });
};

export const useUnarchiveDepense = () => {
    const qc = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: ({id,password}:{id:string;password:string}) => ApiClient.unarchiveDepense(id,password),
        onSuccess: () => {
            showToast({ type:'SUCCESS', message:'Dépense désarchivée'});
            // La dépense redevient visible côté liste; budgets inchangés mais on rafraîchit pour consistance
            qc.invalidateQueries({ queryKey:['depenses'] });
            qc.invalidateQueries({ queryKey:['budgets'] });
            qc.invalidateQueries({ queryKey:['depenses','archived'] });
        },
            onError: (e: unknown) => {
                const msg = e instanceof Error ? e.message : 'Erreur désarchivage';
                showToast({ type:'ERROR', message: msg });
            }
    });
};

export const useUnarchiveAllDepenses = () => {
    const qc = useQueryClient();
    const { showToast } = useAppContext();
    return useMutation({
        mutationFn: () => ApiClient.unarchiveAllDepenses(),
        onSuccess: () => {
            showToast({ type:'SUCCESS', message:'Toutes désarchivées'});
            qc.invalidateQueries({ queryKey:['depenses'] });
            qc.invalidateQueries({ queryKey:['depenses','archived'] });
        },
            onError: (e: unknown) => {
                const msg = e instanceof Error ? e.message : 'Erreur désarchivage global';
                showToast({ type:'ERROR', message: msg });
            }
    });
};