import type React from "react";
import { useDeleteDepense, useGetDepenses } from "../../Hooks/useDepense";
import type { Depenses } from "../../Types/depense";
import { Calendar, CreditCard, Tag, Trash } from "lucide-react";

const DepenseList :React.FC = () => {

    const {data : depenses, isLoading, isError} = useGetDepenses();


       // ✅ Mutation pour supprimer une dépense
  const deleteExpenseMutation = useDeleteDepense()

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

//   ✅ Fonction pour supprimer une dépense
  const handleDelete = (id: string) => {
    if (confirm("Supprimer cette dépense ?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  // Labels pour les fréquences
  const frequenceLabels: Record<Depenses["frequence"], string> = {
    quotidienne: "Quotidien",
    hebdomadaire: "Hebdomadaire", 
    mensuelle: "Mensuel",
    annuelle: "Annuel",
  };

  
//   // Résumé des dépenses du mois actuel
//   const totalMonthlyExpenses = depenses
//     .filter((e:Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
//     .reduce((sum:number, e:Depenses) => sum + e.montant, 0);

//   // Regroupement par catégorie pour le mois actuel
// //   const expensesByCategory = depenses
// //     .filter((e:Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
// //     .reduce((acc:Depenses, depense :Depenses) => {
// //       acc[depenses.categorie] = (acc[depenses.categorie] || 0) + depenses.montant;
// //       return acc;
// //     }, {} as Record<string, number>);

// const expensesByCategory:Record<string, number> = depenses
//   .filter((e:Depenses) => new Date(e.createdAt).getMonth() === new Date().getMonth())
//   .reduce((acc: Record<string, number>, depense: Depenses) => {
//     acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant;
//     return acc;
//   }, {});

    if (isLoading) return <div>Chargement...</div>;
    if (isError) return <div>Erreur lors du chargement des dépenses.</div>

    return (
    <div className="space-y-6">

        {/* HEADER */}
      {/* <div className="flex justify-between items-center">
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
      </div> */}

      {/* RÉSUMÉ PAR CATÉGORIE */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(expensesByCategory)
          .slice(0, 4)
          .map(([category, montant]) => (
            <div
              key={category}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
            >
              <h4 className="font-medium text-gray-700 mb-2">
                {categoryLabels[category as Depenses["categorie"]]}
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
      </div> */}


      {/* LISTE DES DÉPENSES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Dépenses récentes
          </h3>
        </div>
        <div className="divide-y divide-gray-100">
          {!depenses || depenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Aucune dépense enregistrée</p>
              <p className="text-sm">Commencez par ajouter vos dépenses</p>
            </div>
          ) : (
            depenses
            
            .slice()
            
              .sort(
                // Tri par date de création (plus récent en premier)
                (a:Depenses, b:Depenses) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )
              .slice(0, 10)
              .map((depense:Depenses) => (
                <div
                  key={depense._id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <CreditCard className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {depense.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            {categoryLabels[depense.categorie]}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(depense.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {frequenceLabels[depense.frequence]}
                          </span>
                          {depense.isActive && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Actif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        -{depense.montant.toLocaleString("fr-FR")} €
                      </p>
                      <button
                        onClick={() => handleDelete(depense._id)}
                        className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                        title="Supprimer"
                        >
                        <Trash className="w-5 h-5" />
                        </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
export default DepenseList;