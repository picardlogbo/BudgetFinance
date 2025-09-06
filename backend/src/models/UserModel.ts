import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface UserDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    avatar?: string;
    role: "user" | "admin";
    createdAt: Date;
    isVerified: boolean;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

//shema mongoose

const userSchema = new mongoose.Schema<UserDocument>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false }

},
{ timestamps: true }
);

// Middleware pour hasher le mot de passe
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


// Middleware pour comparer le mot de passe
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
