import { useContext } from "react";
import AppContext from "../Context/AppContext";

// Types
export interface ToastMessageProps {
    type: 'SUCCESS' | 'ERROR';
    message: string;
    // onClose: () => void;
}

export interface UserInfo {
    id: string;
    email: string;
    lastname: string;
    firstname: string;
    telephone: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthContextType {
    showToast: (toast: ToastMessageProps) => void;
    user?: UserInfo | undefined;
    isLoggedIn: boolean;
    refreshUser: () => Promise<void>;
}

// Hook personnalisé pour utiliser le contexte de l'application
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppContextProvider");
    }
    return context;
};
