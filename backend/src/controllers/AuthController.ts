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


