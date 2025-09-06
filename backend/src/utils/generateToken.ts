import jwt from 'jsonwebtoken';

// Génère un JWT pour un utilisateur
export const generateToken = (userId: string): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET manquant dans .env');
    }
    return jwt.sign({ id: userId }, secret, { expiresIn: '1d' });
};

export default generateToken;
