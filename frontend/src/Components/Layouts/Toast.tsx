import { useEffect } from "react";

// ✅ Définition du type pour les props d'un message Toast
// - type : soit "SUCCESS" soit "ERROR"
// - message : texte du toast
// - onClose : fonction pour fermer/retirer le toast (souvent gérée par un parent)
type ToastMessageProps  = {
    type: 'SUCCESS' | 'ERROR';
    message: string;
    onClose: () => void;
};

// ✅ Le composant Toast reçoit une seule prop "toast" de type ToastMessageProps
// Exemple de donnée :
// {
//   type: "SUCCESS",
//   message: "Inscription réussie !",
//   onClose: () => {...}
// }
const Toast = ({ toast }: { toast: ToastMessageProps }) => {

    // ✅ useEffect sert à faire disparaître automatiquement le toast après 10 secondes
    useEffect(() => {
        // Timer pour appeler toast.onClose() après 10 secondes
        const timer = setTimeout(() => {
            toast.onClose();
        }, 10000);

        // Log utile pour le débogage (affiche le toast actuel dans la console)
        console.log("Toast displayed:", toast);

        // Nettoyage : si le composant se démonte avant la fin du timer → on annule le setTimeout
        return () => clearTimeout(timer);

        // Dépendance : si le toast change, on relance l'effet
    }, [toast]);

    // ✅ Sécurité : si pas de toast ou pas de message → rien à afficher
    if (!toast || !toast.message) {
        return null;
    }

    // ✅ Styles différents selon le type du toast
    // SUCCESS → fond vert
    // ERROR   → fond rouge
    const toastStyles = toast.type === 'SUCCESS'
      ? "fixed top-0 right-4 bg-green-700 z-50 text-white px-4 py-2 rounded-md shadow-lg max-w-md"
      : "fixed top-0 right-4 bg-red-700 z-50 text-white px-4 py-2 rounded-md shadow-lg max-w-md";

    // ✅ Rendu du toast : div positionnée en haut à droite de l'écran
    return (
        <div className={toastStyles}>
            <span className="ml-2">{toast.message}</span>
        </div>
    );
};

export default Toast;
