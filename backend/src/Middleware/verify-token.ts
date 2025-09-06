
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

/**
 * Middleware pour vérifier le token JWT dans les cookies.
 * Si le token est valide, l'ID de l'utilisateur est ajouté à la requête.
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    // Vérification de la présence du cookie auth_token
     if (!req.cookies || !req.cookies['auth_token']) {
    return res.status(401).json({ message: "Unauthorized" });
  }
    // Vérification de la présence du cookie auth_token
  const token = req.cookies['auth_token'];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.userId = (decoded as JwtPayload).id;
    next(); // Passe au middleware suivant
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default verifyToken;
