import React, { useState } from 'react';
import { Plus, Target, TrendingUp } from 'lucide-react';
import type { Epargne } from '../Types/Epargne';
import { useContributeToEpargne, useCreateEpargne, useGetEpargne } from '../Hooks/useEpargne';
import { useForm } from 'react-hook-form';
import type { EpargneFormValues } from '../API/API-Epargne';

// export interface EpargneManagerProps {
//   savings: Epargne[];
//   onAddSavingGoal: (goal: Omit<Epargne, 'id'>) => void;
//   onUpdateSavingAmount: (goalId: string, amount: number) => void;
// }
 const EpargneManager: React.FC = () => {

    const {data: epargne = []} = useGetEpargne();
    const createEpargne = useCreateEpargne();
    // const updateEpargne = useUpdateEpargne();
    const contributeToEpargne = useContributeToEpargne();
    // const deleteEpargne = useDeleteEpargne();
    
  const [showForm, setShowForm] = useState(false);
  const [showContribution, setShowContribution] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

    // Hooks pour gestion du formulaire avec react-hook-form
  const {register,handleSubmit,reset,formState: { errors },} = useForm<EpargneFormValues>({
     defaultValues: {
       name: "",
       targetAmount: 0,
       currentAmount: 0,
       targetDate: "",
       category: "autre",
     },
   });

   const onSubmit = (data: EpargneFormValues) => {
                // envoi vers l’API
               createEpargne.mutate(data);
               reset();
               setShowForm(false);
           };
//    const [formData, setFormData] = useState({
//      title: '',
//      targetAmount: '',
//      currentAmount: '',
//      targetDate: '',
//      category: 'other' as Epargne['category'],
//    });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (formData.name && formData.targetAmount && formData.targetDate) {
//       onAddSavingGoal({
//         name: formData.name,
//         targetAmount: parseFloat(formData.targetAmount),
//         currentAmount: parseFloat(formData.currentAmount) || 0,
//         targetDate: formData.targetDate,
//         category: formData.category,
//       });
//       setFormData({
//         name: '',
//         targetAmount: '',
//         currentAmount: '',
//         targetDate: '',
//         category: 'other',
//       });
//       setShowForm(false);
//     }
//   };

  const handleContribution = (goalId: string) => {
    if (contributionAmount) {
      const goal = epargne.find((g: Epargne) => g._id === goalId);
      if (goal) {
        const newAmount = goal.currentAmount + parseFloat(contributionAmount);
        contributeToEpargne.mutate({ epargneId: goal._id, amount: newAmount });
        setContributionAmount('');
        setShowContribution(null);
      }
    }
  };

  const categoryLabels: Record<Epargne['category'], string> = {
    Urgence: 'Fonds d\'urgence',
    Hopital: 'Hôpital',
    Vacances: 'Vacances',
    Maison: 'Maison',
    Voiture: 'Voiture',
    Éducation: 'Éducation',
    Retraite: 'Retraite',
    Général: 'Général',
    Autre: 'Autre',
  };

  const totalSavings = epargne.reduce((sum: number, s: Epargne) => sum + s.currentAmount, 0);
  const totalGoals = epargne.reduce((sum: number, s: Epargne) => sum + s.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de l'Épargne</h2>
          <p className="text-gray-600 mt-1">
            Total épargné: <span className="font-semibold text-blue-600">
              {totalSavings.toLocaleString('fr-FR')} €
            </span> / {totalGoals.toLocaleString('fr-FR')} €
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel objectif
        </button>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progression Globale</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div 
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${totalGoals > 0 ? Math.min((totalSavings / totalGoals) * 100, 100) : 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{totalSavings.toLocaleString('fr-FR')} € épargné</span>
          <span>{totalGoals > 0 ? ((totalSavings / totalGoals) * 100).toFixed(1) : 0}% de l'objectif total</span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvel Objectif d'Épargne</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Titre/Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'objectif
              </label>
              <input
                type="text"
                {...register("name", { required: "Titre requis" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ex: Courses, Essence..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant cible (€)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("targetAmount", {
                  required: "Montant requis",
                  min: { value: 0.01, message: "Doit être positif" },
                  valueAsNumber: true,
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.targetAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetAmount.message}
                </p>
              )}
            </div>

            {/* Montant Actuel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Montant actuel (€)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("currentAmount", {
                  required: "Montant requis",
                  min: { value: 0.01, message: "Doit être positif" },
                  valueAsNumber: true,
                })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.currentAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.currentAmount.message}
                </p>
              )}
            </div>
           
           
            {/* Date Cible */}

            


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date cible
              </label>
              <input
                type="date"
                {...register("targetDate", { required: "Date requise" })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {errors.targetDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.targetDate.message}
                </p>
              )}
            </div>

            {/* Catégorie */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                {...register("category")}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Créer l'objectif
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

      {/* Savings Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {epargne.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
            <Target className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>Aucun objectif d'épargne défini</p>
            <p className="text-sm">Commencez par créer vos objectifs financiers</p>
          </div>
        ) : (
          epargne.map((goal: Epargne) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={goal._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                      <p className="text-sm text-gray-500">{categoryLabels[goal.category]}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <span className="text-sm text-gray-500">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{goal.currentAmount.toLocaleString('fr-FR')} €</span>
                    <span>{goal.targetAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between">
                    <span>Restant:</span>
                    <span className="font-medium">{remaining.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date cible:</span>
                    <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jours restants:</span>
                    <span className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {daysRemaining < 0 ? 'Dépassé' : `${daysRemaining} jours`}
                    </span>
                  </div>
                </div>

                {showContribution === goal._id ? (
                  <div className="space-y-3">
                    <input
                      type="number"
                      step="0.01"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Montant à ajouter"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleContribution(goal._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Ajouter
                      </button>
                      <button
                        onClick={() => setShowContribution(null)}
                        className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-3 py-2 rounded-lg text-sm transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowContribution(goal._id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Contribuer
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default EpargneManager;