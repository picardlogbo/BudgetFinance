import React from "react";
import type { AuthContextType, ToastMessageProps } from "../Utils/AppContextUtils";
import Toast from "../Components/Layouts/Toast";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as ApiClient from "../API/API-Clients";

const AppContext = React.createContext<AuthContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [toast, setToast] = React.useState<ToastMessageProps | undefined>(undefined);
    const queryClient = useQueryClient();

    // Utilise useQuery pour récupérer l'utilisateur connecté
    const { data: user, isError } = useQuery({
        queryKey: ["validateToken"],
        queryFn: ApiClient.validateToken,
        retry: false,
    });

    // Fonction à appeler après login pour rafraîchir l'utilisateur
    const refreshUser = async () => {
        await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
    };

        const isLoggedIn = !!user && !isError;

        return (
            <AppContext.Provider value={{
                showToast: (toastMessage: ToastMessageProps) => {
                    setToast(toastMessage);
                },
                isLoggedIn,
                user,
                refreshUser,
            }}>
                {toast && <Toast toast={{ ...toast, onClose: () => setToast(undefined) }} />}
                {children}
            </AppContext.Provider>
        );
};

export default AppContext;