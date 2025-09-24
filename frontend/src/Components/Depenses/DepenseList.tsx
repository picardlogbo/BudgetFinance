import React, { useState } from "react";
import { useGetDepenses, useArchiveDepense } from "../../Hooks/useDepense";
import type { Depenses } from "../../Types/depense";
import { Calendar, CreditCard, Tag, Archive, RefreshCw } from "lucide-react";

const DepenseList :React.FC = () => {

  const {data : depenses, isLoading, isError} = useGetDepenses();
  const archiveMut = useArchiveDepense();

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

  const [toArchive, setToArchive] = useState<Depenses | null>(null);
  const openArchiveModal = (depense: Depenses) => setToArchive(depense);
  const closeArchiveModal = () => { if(!archiveMut.isPending) setToArchive(null); };
  const confirmArchive = () => {
    if(!toArchive) return;
    archiveMut.mutate(toArchive._id, {
      onSuccess: () => setToArchive(null),
      onError: () => {/* toast déjà géré dans le hook */},
      onSettled: () => {/* noop */}
    });
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Dépenses récentes</h3>
            <p className="text-xs text-gray-500 mt-0.5">Dernières opérations actives (10 plus récentes)</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {archiveMut.isPending && <span className="animate-pulse text-red-600 flex items-center gap-1"><RefreshCw className="w-3 h-3"/>Archivage...</span>}
          </div>
        </div>
        <div className="divide-y divide-gray-100 max-h-[600px] overflow-auto scrollbar-thin">
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
                <div key={depense._id} className="group flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="p-2 bg-red-100 rounded-lg group-hover:scale-105 transition-transform">
                      <CreditCard className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate max-w-xs">{depense.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{categoryLabels[depense.categorie]}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(depense.createdAt).toLocaleDateString('fr-FR')}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{frequenceLabels[depense.frequence]}</span>
                        {depense.isActive && <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full">Actif</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-sm font-semibold text-red-600">-{depense.montant.toLocaleString('fr-FR')} €</p>
                    <button
                      onClick={() => openArchiveModal(depense)}
                      disabled={archiveMut.isPending}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-600 text-white text-[11px] hover:bg-red-700 disabled:opacity-40 transition"
                      title="Archiver"
                    >
                      <Archive className="w-3 h-3" />
                      Archiver
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      {toArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-5 space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2"><Archive className="w-4 h-4 text-red-600"/> Confirmer l'archivage</h4>
              <button onClick={closeArchiveModal} className="text-gray-400 hover:text-gray-600 text-sm" aria-label="Fermer">✕</button>
            </div>
            <div className="text-xs text-gray-600 space-y-2">
              <p>Voulez-vous vraiment archiver cette dépense ? Elle ne sera pas supprimée et pourra être restaurée plus tard.</p>
              <div className="bg-gray-50 rounded-lg p-3 text-[11px] space-y-1">
                <p><span className="text-gray-500">Titre :</span> {toArchive.title || '(Sans titre)'}</p>
                <p><span className="text-gray-500">Catégorie :</span> {categoryLabels[toArchive.categorie]}</p>
                <p><span className="text-gray-500">Montant :</span> -{toArchive.montant.toLocaleString('fr-FR')} €</p>
                <p><span className="text-gray-500">Date :</span> {new Date(toArchive.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={closeArchiveModal} disabled={archiveMut.isPending} className="px-3 py-1.5 rounded-md text-xs bg-gray-200 hover:bg-gray-300 disabled:opacity-40">Annuler</button>
              <button
                onClick={confirmArchive}
                disabled={archiveMut.isPending}
                className="px-3 py-1.5 rounded-md text-xs bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 flex items-center gap-1"
              >
                {archiveMut.isPending && <span className="w-3 h-3 border border-white/40 border-t-transparent rounded-full animate-spin" />}
                Oui, archiver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default DepenseList;