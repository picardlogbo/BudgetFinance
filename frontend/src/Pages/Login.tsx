import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as APIclient from "../API/API-Clients";
import { useAppContext } from "../Utils/AppContextUtils";

export interface LoginData {
    email: string;
    password: string;
}

const Login = () => {
    const { showToast } = useAppContext();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        defaultValues: {
            email: '',
            password: '',
        }
    });

        //mutation for user login
const mutation = useMutation({
    mutationFn: async (data: LoginData) => APIclient.login(data),
    onSuccess: async () => {
        showToast({ type: "SUCCESS", message: "Login successful!" });
        await queryClient.invalidateQueries({ queryKey: ["validateToken"] });
        console.log('User logged in successfully');
        navigate("/dashboard");
    },
    onError: (error) => {
        showToast({ type: "ERROR", message: error.message });
    },
});
 const onSubmit = handleSubmit((data: LoginData) => {
      console.log("Form submitted:", data);
      console.log("Submitting login data:", data);
      mutation.mutate(data);
    });
  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>

        <form onSubmit={onSubmit} className="space-y-4">
         <div className="mb-4">
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            {...register("email", { 
              required: "Email est requis",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Format d'email invalide"
              }
            })}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="ex: nom@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Mot de passe</label>
            <input
              type="password"
              {...register("password", { 
                required: "Mot de passe est requis",
                minLength: {
                  value: 6,
                  message: "Le mot de passe doit contenir au moins 6 caractères"
                }
              })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Mot de passe"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Se connecter
          </button>

          <p className="text-center text-sm mt-4">
            Pas encore de compte ?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              S’inscrire
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;



