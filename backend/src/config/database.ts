import mongoose from "mongoose";
import dotenv from "dotenv";

// Fonction de connexion à MongoDB
const ConnectDB  = async():Promise<void> =>{

        const mongoURI = process.env.MONGO_URI;


     // mongoose.connect permet d'établir la connexion
    // On utilise la variable d'environnement MONGO_URI définie dans .env
    try {
        await mongoose.connect(mongoURI as string);
        console.log("MongoDB connected");
    } catch (error: any) {
        // Si la connexion échoue, on affiche l'erreur
    console.error("❌ Erreur de connexion MongoDB:", error.message);
    process.exit(1); // On arrête le serveur si DB inaccessible
    }
}

export default ConnectDB;