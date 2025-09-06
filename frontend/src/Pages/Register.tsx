import { useState } from "react";
import { User, UserPlus, Mail, EyeOff, Eye , Lock, Phone } from 'lucide-react';
import { useAppContext } from "../Utils/AppContextUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as APIclient from "../API/API-Clients";
import { useForm, type SubmitHandler } from "react-hook-form";

export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
    confirmPassword: string;
}

const Register = () => {

    const [showPassword , setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {showToast} = useAppContext();
     const queryClient = useQueryClient(); 
    const navigate = useNavigate();  

    const {register , watch , handleSubmit , formState: { errors }} = useForm<RegisterData>();

    //mutation for user registration
const mutation = useMutation({
    mutationFn: async (data: RegisterData) => APIclient.register(data),
    onSuccess: async () => {
        showToast({ type: "SUCCESS", message: "Inscription réussie! Veuillez vérifier votre email." });
        await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
        console.log('User registered successfully');
        navigate("/login");
    },
    onError: (error) => {
        showToast({ type: "ERROR", message: error.message });
    },
});

// Function to handle form submission
  const onSubmit: SubmitHandler<RegisterData> = (data) => {
    console.log("Form submitted:", data);
    mutation.mutate(data);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
            <p className="text-gray-600">Rejoignez-nous et découvrez toutes nos fonctionnalités</p>
        </div>

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/20"
          noValidate
        >
          {/* Noms (grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Prénom
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("firstName", { required: "Prénom requis", minLength: { value: 2, message: "Min 2 caractères" } })}
                  className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                             focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                             transition-all duration-200 placeholder-gray-400"
                  placeholder="Jean"
                />
              </div>
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
            </div>

            <div className="group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <User className="w-4 h-4 mr-2 text-gray-500" />
                Nom
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("lastName", { required: "Nom requis" })}
                  className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                             focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                             transition-all duration-200 placeholder-gray-400"
                  placeholder="Dupont"
                />
              </div>
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Mail className="w-4 h-4 mr-2 text-gray-500" />
              Adresse email
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email", {
                  required: "Email requis",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Format d'email invalide"
                  }
                })}
                className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                           focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                           transition-all duration-200 placeholder-gray-400"
                placeholder="nom@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Téléphone */}
            <div className="mb-6">
            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
              <Phone className="w-4 h-4 mr-2 text-gray-500" />
              Numéro de téléphone
            </label>
            <div className="relative">
              <input
                type="tel"
                {...register("telephone", {
                  required: "Téléphone requis",
                  pattern: {
                    value: /^\+?[0-9]{9,15}$/,
                    message: "Format invalide"
                  }
                })}
                className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                           focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                           transition-all duration-200 placeholder-gray-400"
                placeholder="+22507XXXXXXX"
              />
            </div>
            {errors.telephone && <p className="text-xs text-red-500 mt-1">{errors.telephone.message}</p>}
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Mot de passe requis",
                    minLength: { value: 6, message: "Min 6 caractères" }
                  })}
                  className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                             focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                             transition-all duration-200 placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div className="group">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 mr-2 text-gray-500" />
                Confirmation
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    validate: (val) =>
                      val
                        ? val === watch("password") || "Les mots de passe diffèrent"
                        : "Confirmation requise"
                  })}
                  className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 rounded-xl bg-gray-50/50 
                             focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10
                             transition-all duration-200 placeholder-gray-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Méthode vérification */}
          {/* <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Méthode de vérification préférée
            </label>
            <div className="flex gap-4">
              <label className="flex-1 cursor-pointer">
                <div
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    watch("verifyMethod") === "email"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value="email"
                      {...register("verifyMethod")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="ml-3 flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      <span className="text-sm font-medium">Par email</span>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex-1 cursor-pointer">
                <div
                  className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                    watch("verifyMethod") === "sms"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      value="sms"
                      {...register("verifyMethod")}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <div className="ml-3 flex items-center gap-2">
                      <Phone className="w-5 h-5" />
                      <span className="text-sm font-medium">Par SMS</span>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </div> */}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className={`w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                       text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] 
                       hover:shadow-lg focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed 
                       disabled:transform-none flex items-center justify-center gap-3`}
          >
            {mutation.isPending ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Créer mon compte
              </>
            )}
          </button>

          {/* Erreur backend */}
          {mutation.isError && (
            <p className="text-center text-sm text-red-600 mt-4">
              {/* {(mutation.error as any)?.response?.data?.message || "Erreur d'inscription"} */}
            </p>
          )}

          {/* Lien login */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Vous avez déjà un compte ?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 font-semibold hover:text-blue-700 transition-colors hover:underline"
              >
                Se connecter
              </button>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a href="#" className="text-blue-600 hover:underline">
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

