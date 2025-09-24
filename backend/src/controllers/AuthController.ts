import { Request, Response } from "express";
import UserModel from "../models/UserModel.js";
import { generateToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
    try {
        // Le frontend envoie "telephone" (RegisterData) → on l'accepte aussi
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;
        const normalizedPhone = phone; // compatibilité

        // Validations basiques
        if (!firstName || !lastName || !email || !normalizedPhone || !password) {
            return res.status(400).json({ message: "Champs requis manquants" });
        }
        if (confirmPassword !== undefined && password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
        }

        // Email déjà utilisé ?
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "L'email existe déjà" });
        }

        const user = new UserModel({ firstName, lastName, email, phone: normalizedPhone, password });

        await user.save();
        // Génération token après save (id garanti)
          const token = generateToken(user._id.toString());
          // Cookie JWT HTTP-Only
          const cookieSecure = (process.env.JWT_COOKIE_SECURE_IN_PROD === 'true' && process.env.NODE_ENV === 'production') || process.env.JWT_COOKIE_SECURE === 'true';
          res.cookie('token', token, {
             httpOnly: process.env.JWT_COOKIE_HTTP_ONLY !== 'false',
             secure: cookieSecure,
             sameSite: (process.env.JWT_COOKIE_SAME_SITE as any) || 'lax',
             maxAge: 24 * 60 * 60 * 1000,
             path: '/',
            });
            // On évite de renvoyer le hash du mot de passe
            const userSafe = {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            };
                
            return res.status(201).json({ message: "Inscription réussie", user: userSafe, token });
        } catch (error: any) {
            console.error("❌ Erreur Register:", error);
        // Erreurs de validation Mongoose → 400
         if (error?.name === "ValidationError") {
            return res.status(400).json({ message: "Validation échouée", details: error.errors });
        }
        return res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
};

// Note: Pour la gestion des mots de passe (changement, réinitialisation), il est recommandé d'implémenter des fonctionnalités supplémentaires avec des validations appropriées.
export const Login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

                // Générer le token
                const token = generateToken(user._id.toString());

                // Cookie JWT HTTP-Only
                const cookieSecure = (process.env.JWT_COOKIE_SECURE_IN_PROD === 'true' && process.env.NODE_ENV === 'production')
                    || process.env.JWT_COOKIE_SECURE === 'true';
                res.cookie('token', token, {
                    httpOnly: process.env.JWT_COOKIE_HTTP_ONLY !== 'false',
                    secure: cookieSecure,
                    sameSite: (process.env.JWT_COOKIE_SAME_SITE as any) || 'lax',
                    maxAge: 24 * 60 * 60 * 1000,
                    path: '/',
                });

                // On évite de renvoyer le hash du mot de passe
                const userSafe = {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt,
                };
                res.status(200).json({ message: "Connexion réussie", user: userSafe, token });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la connexion" });
    }
};

export const ValidateToken = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
        const token = req.cookies?.token || bearerToken;
        if (!token) return res.status(401).json({ valid: false, message: 'Token manquant' });
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ valid: false, message: 'JWT_SECRET absent' });
        const decoded = jwt.verify(token, secret) as any;
        const user = await UserModel.findById(decoded.id).select('-password');
        if (!user) return res.status(401).json({ valid: false, message: 'Utilisateur inexistant' });
        return res.json({ valid: true, user });
    } catch (e) {
        return res.status(401).json({ valid: false, message: 'Token invalide' });
    }
};
export const Logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('token', {
            httpOnly: process.env.JWT_COOKIE_HTTP_ONLY !== 'false',
            secure: (process.env.JWT_COOKIE_SECURE_IN_PROD === 'true' && process.env.NODE_ENV === 'production')
                || process.env.JWT_COOKIE_SECURE === 'true',
            sameSite: (process.env.JWT_COOKIE_SAME_SITE as any) || 'lax',
            path: '/',
        });
        res.status(200).json({ message: "Déconnexion réussie" });
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        res.status(500).json({ message: "Erreur lors de la déconnexion" });
    }
};

export const GetProfile = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: "Non Autorisé" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({ message: "Erreur lors de la récupération du profil" });
    }
};

// export const UpdateProfile = async (req: Request, res: Response) => {
//     try {
//         const user = req.user;
//         if (!user) {
//             return res.status(401).json({ message: "Non Autorisé" });
//         }

//         // Mettre à jour les informations du profil
//         const { firstName, lastName, email, phone } = req.body;
//         user.firstName = firstName || user.firstName;
//         user.lastName = lastName || user.lastName;
//         user.email = email || user.email;
//         user.phone = phone || user.phone;

//         await user.save();
//         res.status(200).json({ message: "Profil mis à jour avec succès", user });
//     } catch (error) {
//         console.error("Erreur lors de la mise à jour du profil :", error);
//         res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
//     }
// };
// Note: Pour la gestion des mots de passe (changement, réinitialisation), il est recommandé d'implémenter des fonctionnalités supplémentaires avec des validations appropriées.

//  export const ChangePassword = async (req: Request, res: Response) => {
//     try {
//         const user = req.user;
//         if (!user) {
//             return res.status(401).json({ message: "Non Autorisé" });
//         }
//         const { currentPassword, newPassword, confirmNewPassword } = req.body;
//         if (!currentPassword || !newPassword || !confirmNewPassword) {
//             return res.status(400).json({ message: "Champs requis manquants" });
//         }
//         if (newPassword !== confirmNewPassword) {
//             return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas" });
//         }
//         const isMatch = await user.comparePassword(currentPassword);
//         if (!isMatch) {
//             return res.status(401).json({ message: "Mot de passe actuel incorrect" });
//         }
//         user.password = newPassword;
//         await user.save();
//         res.status(200).json({ message: "Mot de passe changé avec succès" });
//     } catch (error) {
//         console.error("Erreur lors du changement de mot de passe :", error);
//         res.status(500).json({ message: "Erreur lors du changement de mot de passe" });
//     }
// };

// Pour la réinitialisation du mot de passe, il est recommandé d'implémenter une fonctionnalité avec envoi d'email et token sécurisé.

     export const ResetPassword = async (req: Request, res: Response) => {
    try {
        const { email, newPassword, confirmNewPassword } = req.body;
        if (!email || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: "Champs requis manquants" });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Les nouveaux mots de passe ne correspondent pas" });
        }
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la réinitialisation du mot de passe :", error);
        res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe" });
    }
};

// Note: Pour la réinitialisation du mot de passe, il est fortement recommandé d'implémenter une fonctionnalité avec envoi d'email et token sécurisé.
// Ceci est une version simplifiée sans sécurité avancée.

export const EmailVerification = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        // Vérifier le token et activer l'utilisateur
        if (!token) {
            return res.status(400).json({ message: "Token manquant" });
        }
        const secret = process.env.EMAIL_VERIFICATION_SECRET;
        if (!secret) {
            return res.status(500).json({ message: "Configuration serveur manquante" });
        }
        let decoded: any;
        try {
            decoded = jwt.verify(token, secret);
        } catch (err) {
            return res.status(400).json({ message: "Token invalide ou expiré" });
        }
        const userId = decoded?.id || decoded?._id || decoded?.sub;
        if (!userId) return res.status(400).json({ message: "Token invalide" });
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
        if (user.isVerified) {
            return res.status(400).json({ message: "Email déjà vérifié" });
        }
        user.isVerified = true;
        await user.save();
        res.status(200).json({ message: "Email vérifié avec succès" });
    } catch (error) {
        console.error("Erreur lors de la vérification de l'email :", error);
        res.status(500).json({ message: "Erreur lors de la vérification de l'email" });
    }
};

export const verifyOtp = (otp: string, userOtp: string) => {
    return otp === userOtp;

}