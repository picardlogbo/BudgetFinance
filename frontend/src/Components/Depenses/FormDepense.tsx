import { useState } from "react";
import type { depenseFormData } from "../../API/API-Depense";
import type { Depenses } from "../../Types/depense";
import { useForm } from "react-hook-form";
import { useCreateDepense } from "../../Hooks/useDepense";



const DepenseForm : React.FC = ()=> {

    const [showForm, setShowForm] = useState(true);
    const createDdepense =  useCreateDepense();

    // Hooks pour gestion du formulaire avec react-hook-form
      const {register ,handleSubmit,formState: { errors },} = useForm<depenseFormData>({
        defaultValues: {
          title: "",
          montant: 0,
          categorie: "Autre",
          frequence: "Mensuel",
          isActive: true,
        },
      });

      // Labels pour affichage des catégories (aligné sur le backend)
  const categoryLabels: Record<Depenses["categorie"], string> = {
    Alimentation: "Alimentation",
    Transport: "Transport",
    Santé: "Santé",
    Loisirs: "Loisirs",
    Loyer: "Logement",
    Factures: "Factures",
    Éducation: "Éducation",
    Autre: "Autre",
  };

  // Labels pour les fréquences
  const frequenceLabels: Record<Depenses["frequence"], string> = {
    quotidienne: "Quotidienne",
    hebdomadaire: "Hebdomadaire", 
    mensuelle: "Mensuelle",
    annuelle: "Annuelle",
  };

    const onSubmit = (data: depenseFormData) => {
         // envoi vers l’API
        createDdepense.mutate(data);
        setShowForm(false);
    };

    return (
      <div className="space-y-6">

      {/* FORMULAIRE */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nouvelle Dépense
          </h3>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Titre/Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                {...register("title", { required: "Description requise" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Courses, Essence..."
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant (€)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("montant", {
                  required: "Montant requis",
                  min: { value: 0.01, message: "Doit être positif" },
                  valueAsNumber: true,
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.montant && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.montant.message}
                </p>
              )}
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                {...register("categorie")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fréquence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence
              </label>
              <select
                {...register("frequence")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.entries(frequenceLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Statut actif */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isActive")}
                id="isActive"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Dépense active
              </label>
            </div>

            {/* Boutons */}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Ajouter
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    );
}
export default DepenseForm;
  

    