import { useState } from "react";
import { useGetDepenses } from "../../Hooks/useDepense";
import type { Depenses } from "../../Types/depense";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderDepense: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();


  // ✅ On donne [] par défaut pour éviter le undefined
  const { data: depenses = [], isLoading, isError } = useGetDepenses();

  // ✅ Labels des catégories
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

  // ✅ Gestion des états
  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement des dépenses</div>;

  // ✅ Résumé des dépenses du mois actuel
  const totalMonthlyExpenses = depenses
    .filter((e: Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum: number, e: Depenses) => sum + e.montant, 0);

  // ✅ Regroupement par catégorie
  const expensesByCategory: Record<string, number> = depenses
    .filter((e: Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
    .reduce((acc: Record<string, number>, depense: Depenses) => {
      acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant;
      return acc;
    }, {});

    // regroupement par date (aujourd'hui,  semaine,  mois et annees
    // const expensesByDate: Record<string, number> = depenses
    //   .filter((e: Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
    //   .reduce((acc: Record<string, number>, depense: Depenses) => {
    //     const date = new Date(depense.createdAt);
    //     const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    //     acc[key] = (acc[key] || 0) + depense.montant;
    //     return acc;
    //   }, {});

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Gestion des Dépenses
          </h2>
          <p className="text-gray-600 mt-1">
            Total ce mois :{" "}
            <span className="font-semibold text-red-600">
              {totalMonthlyExpenses.toLocaleString("fr-FR")} €
            </span>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une dépense
        </button>

         <button
          onClick={() => navigate("/analyse-depense")}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter une dépense
        </button>
      </div>

      {/* RÉSUMÉ PAR CATÉGORIE */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(expensesByCategory)
          .slice(0, 4) // On limite aux 4 premières catégories
          .map(([category, montant]) => (
            <div
              key={category}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <h4 className="font-medium text-gray-700 mb-2">
                {categoryLabels[category as Depenses["categorie"]] || category}
              </h4>
              <p className="text-xl font-bold text-red-600">
                {montant.toLocaleString("fr-FR")} €
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {totalMonthlyExpenses > 0
                  ? ((montant / totalMonthlyExpenses) * 100).toFixed(1)
                  : 0}
                % du total
              </p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default HeaderDepense;
