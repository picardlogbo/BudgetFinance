import type React from "react";
import type { Facture } from "../Types/facture";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, Calendar, CheckCircle, Clock, CreditCard, Plus, Tag } from "lucide-react";
import { useCreateFacture, useGetFactures, useUpdateFacture,  } from "../Hooks/useFacture";
import type { FactureFormData } from "../API/API-Facture";

// type factureFormValues = {
//   title: string;
//   montant: number;
//   categorie: "Telephone" | "Internet" | "Electricité" | "Gaz" | "Eau" | "Autre";
//   dateEcheance: Date;
//   recurrent: boolean;
//   statut: "Payée" | "En_attente" | "En_retard";
// };

const FactureManager: React.FC = () => {

  const {data: factures = [] } = useGetFactures();
  const createFacture = useCreateFacture();
  const updateFacture = useUpdateFacture();
  const [showForm, setShowForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Facture["status"] | null>(null);


    // const onAddFacture = (newFacture: Omit<Facture, "id" | "user" | "createdAt">) => {
    //     const facture: Facture = {
    //         ...newFacture,
    //         id: Date.now().toString(),
    //         user: "current-user-id",
    //         createdAt: new Date(),
    //     };
    //     setFactures(prev => [facture, ...prev]);
    // };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FactureFormData>({
        defaultValues: {
            title: "",
            montant: 0,
            dateEcheance: new Date(),
            recurrent: false,
            status: "En_attente",
            categorie: "Autre",
        },
    });

      const onSubmit = (data: FactureFormData) => {
               // envoi vers l’API
              createFacture.mutate(data);
              reset();
              setShowForm(false);
          };
    

    // const onSubmit = (data: factureFormValues) => {
    //     onAddFacture({
    //         ...data,
    //         dateEcheance: data.dateEcheance || new Date(),
    //         statut: data.statut || "En_attente", // Statut par défaut
    //     });
    //     reset();
    //     setShowForm(false);
    // };
    

    const categoryLabels: Record<Facture["categorie"], string> = {
        Telephone: "Téléphone",
        Internet: "Internet",
        Electricité: "Électricité",
        Gaz: "Gaz",
        Eau: "Eau",
        Autre: "Autre",
    };
    const statusLabels: Record<Facture["status"], string> = {
        "En_attente": "En attente",
        "Payée": "Payée",
        "En_retard": "En retard",
    };

     const getStatusIcon = (status: Facture['status']) => {
    switch (status) {
      case 'Payée':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'En_retard':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: Facture['status']) => {
    switch (status) {
      case 'Payée':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'En_retard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const totalPending = factures.filter((b: Facture) => b.status === 'En_attente').reduce((sum: number, b: Facture) => sum + b.montant, 0);
  const totalOverdue = factures.filter((b: Facture) => b.status === 'En_retard').reduce((sum: number, b: Facture) => sum + b.montant, 0);

   // 👉 Appliquer le filtre selon selectedStatus
  const filteredFactures = selectedStatus
  ? factures.filter((b: Facture) => b.status === selectedStatus)
  : factures;
  // Fonction pour mettre à jour le statut d'une facture
  // const onUpdateBillStatus = (id: string, newStatus: "Payée" | "En_attente" | "En_retard"): void => {
  //   setFactures(prev => prev.map((facture: Facture) => 
  //     facture.id === id 
  //       ? { ...facture, statut: newStatus }
  //       : facture
  //   ));
  // };

   const onUpdateBillStatus = (factureId: string, newStatus: "Payée" | "En_attente" | "En_retard") => {
    updateFacture.mutate({ factureId, updateData: { status: newStatus } });
  };

  
  return (
  <div className="space-y-6">
    {/* HEADER */}
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Factures</h2>
        <div className="flex gap-4 text-sm mt-1">
          <span className="text-orange-600">
            En attente: {totalPending.toLocaleString("fr-FR")} €
          </span>
          <span className="text-red-600">
            En retard: {totalOverdue.toLocaleString("fr-FR")} €
          </span>
        </div>
      </div>
      <button
      
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Ajouter une facture
      </button>
    </div>

    {/* STATUTS DES FACTURES */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(["En_attente", "En_retard", "Payée"] as Facture["status"][]).map((status) => {
        const statusBills = factures.filter((b: Facture) => b.status === status);
        const total = statusBills.reduce((sum: number, b: Facture) => sum + b.montant, 0);
        return (
          <div key={status} 
                        // 👉 Quand on clique : on sélectionne ce statut
          onClick={() => setSelectedStatus(status)} 
          className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition 
              ${selectedStatus === status ? "ring-2 ring-blue-500" : ""}`}>

            {/* className="bg-white rounded-xl shadow-sm border border-gray-100 p-4" */}
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div>
                <h4 className="font-medium text-gray-700">{statusLabels[status]}</h4>
                <p className="text-xl font-bold text-gray-900">
                  {total.toLocaleString("fr-FR")} €
                </p>
                <p className="text-sm text-gray-500">{statusBills.length} facture(s)</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>

     {/* Bouton pour réinitialiser le filtre */}
      {selectedStatus && (
        <button
          onClick={() => setSelectedStatus(null)}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm"
        >
          Tout afficher
        </button>
      )}

    {/* FORMULAIRE */}
    {showForm && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Facture</h3>
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
              placeholder="Ex: Electricité, Carburant..."
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
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
              <p className="text-red-500 text-sm mt-1">{errors.montant.message}</p>
            )}
          </div>

          {/* Date d'échéance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'échéance
            </label>
            <input
              type="date"
              {...register("dateEcheance", { required: "Date d'échéance requise" ,
              validate: (value) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0); // pour comparer uniquement la date
                const selected = new Date(value);
                return (
                  selected >= today || "La date d'échéance ne peut pas être antérieure à aujourd'hui"
                );
               },
            })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            {errors.dateEcheance && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dateEcheance.message}
              </p>
            )}
          </div>


          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              {...register("categorie", { required: "Catégorie requise" })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.categorie && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categorie.message}
              </p>
            )}
          </div>

          {/* Dépense récurrente */}
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("recurrent")}
              id="recurrent"
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="recurrent" className="ml-2 text-sm text-gray-700">
              Dépense récurrente
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

    {/* LISTE DES FACTURES */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Factures récentes</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {factures.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Aucune facture enregistrée</p>
            <p className="text-sm">Commencez par ajouter vos factures</p>
          </div>
        ) : (
          filteredFactures
            .sort(
              (a: Facture, b: Facture) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 10)
            .map((facture: Facture) => (
              <div
                key={facture._id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  {/* Gauche */}
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {facture.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {categoryLabels[facture.categorie]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(facture.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {new Date(facture.dateEcheance).toLocaleDateString("fr-FR")}
                        </span>
                        {facture.recurrent && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            Recurrent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Droite */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {facture.montant.toLocaleString("fr-FR")} €
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          facture.status
                        )}`}
                      >
                        {statusLabels[facture.status]}
                      </span>
                    </div>

                    {facture.status !== "Payée" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            onUpdateBillStatus(facture._id, "Payée")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Marquer payé
                        </button>
                        {facture.status !== "En_retard" && (
                          <button
                            onClick={() =>
                              onUpdateBillStatus(facture._id, "En_retard")
                            }
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            En retard
                          </button>
                        )}
                      </div>
                    )}
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
      

export default FactureManager;
