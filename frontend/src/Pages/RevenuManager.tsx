import React, {  useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar, CreditCard, Plus, Tag } from "lucide-react";
import type { Revenu } from "../Types/revenus";
import type { RevenuFormData } from "../API/API-Revenu";
import { useCreateRevenu, useGetRevenus } from "../Hooks/useRevenu";
import { useNavigate } from "react-router-dom";



const RevenuManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

    const { data: revenus = [] } = useGetRevenus();
    const createRevenu = useCreateRevenu();

//   const onAddRevenu = (newRevenu: Omit<Revenu, "id" | "user" | "createdAt">) => {
//     createRevenu.mutate(newRevenu);
//   };



  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RevenuFormData>({
    defaultValues: {
      title: "",
      montant: 0,
      categorie: "autre",
      frequence: "Quotidien",
      isActive: true,
    },
  });

   const onSubmit = (data: RevenuFormData) => {
             // envoi vers l’API
            createRevenu.mutate(data);
            reset();
            setShowForm(false);
        };

//   const onSubmit = (data: RevenuFormData) => {
//     onAddRevenu({
//       ...data,
//       // Assurer que date est toujours définie
//       date: data.date || new Date(),
//     });
//     reset();
//     setShowForm(false);
//   };

  const categoryLabels: Record<Revenu["categorie"], string> = {
    salaire: "Salaire",
    freelance: "Freelance",
    investissement: "Investissement",
    autre: "Autre",
  };

  const frequencyLabels: Record<Revenu["frequence"], string> = {
    quotidienne: "Quotidien",
    mensuelle: "Mensuel",
    hebdomadaire: "Hebdomadaire",
    annuelle: "Annuel",
  };

  // const totalMonthlyRevenue = revenus
  //   .filter((r: Revenu) => new Date(r.date).getMonth() === new Date().getMonth())
  //   .reduce((sum: number, r: Revenu) => sum + r.montant, 0);

  // 1. Mois actuel (0 = janvier, 1 = février, etc.)
const moisActuel = new Date().getMonth();

// 2. On filtre les revenus qui appartiennent au mois en cours
const revenusCeMois = revenus.filter((revenu: Revenu) => {
  const moisDuRevenu = new Date(revenu.date).getMonth();
  return moisDuRevenu === moisActuel;
});

// 3. On calcule la somme des montants de ces revenus
const totalMonthlyRevenue = revenusCeMois.reduce(
  (total: number, revenu: Revenu) => total + revenu.montant,
  0
);

    const revenusByCategory = revenus.reduce((acc: Record<Revenu["categorie"], number>, r: Revenu) => {
      acc[r.categorie] = (acc[r.categorie] || 0) + r.montant;
      return acc;
    }, {} as Record<Revenu["categorie"], number>);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Revenus
          </h2>
          <p className="text-gray-600 mt-1">
            Total ce mois :{" "}
            <span className="font-semibold text-blue-600">
              {totalMonthlyRevenue.toLocaleString("fr-FR")} €
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
          onClick={() => navigate("/analyse-revenus")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Analyse des Revenus
        </button>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Revenu
        </button>
        </div>
        
      </div>

      {/* RÉSUMÉ PAR CATÉGORIE */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(Object.entries(revenusByCategory) as [Revenu["categorie"], number][]).slice(0, 4).map(([category, montant]) => (
            <div
              key={category}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <h4 className="font-medium text-gray-700 mb-2">
                {categoryLabels[category as Revenu["categorie"]]}
              </h4>
              <p className="text-xl font-bold text-blue-600">
                {montant.toLocaleString("fr-FR")} €
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalMonthlyRevenue > 0
                  ? ((montant / totalMonthlyRevenue) * 100).toFixed(1)
                  : 0}
                % du total
              </p>
            </div>
          ))}
      </div>

      {/* FORMULAIRE */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nouveau Revenu
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
                {Object.entries(frequencyLabels).map(([key, label]) => (
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
                Revenu actif
              </label>
            </div>

            {/* Boutons */}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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

      {/* LISTE DES DÉPENSES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Revenus récents
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {revenus.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Aucun revenu enregistré</p>
              <p className="text-sm">Commencez par ajouter vos revenus</p>
            </div>
          ) : (
            revenus
              .sort(
                // Tri par date de création (plus récent en premier)
                (a: Revenu, b: Revenu) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 10)
              .map((revenu: Revenu) => (
                <div
                  key={revenu._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {revenu.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {categoryLabels[revenu.categorie]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(revenu.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {frequencyLabels[revenu.frequence]}
                          </span>
                          {revenu.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Actif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {revenu.montant.toLocaleString("fr-FR")} €
                      </p>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuManager;
