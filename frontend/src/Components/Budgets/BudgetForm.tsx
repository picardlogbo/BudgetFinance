// import type React from "react";
// import type { BudgetFormValues } from "../../API/API-Budgets";
// import { useForm } from "react-hook-form";

// const BudgetForm:React.FC = () => {


//   const createBudget = useCreateBudget();

//       const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetFormValues>({
//         defaultValues: {
//           categorie: "Autre",
//           montantAlloue: 0,
//           mois: now.getMonth() + 1,
//           annee: now.getFullYear(),
//         }
//       });

//       const onAddBudget = (data: BudgetFormValues) => {
//     // Sécuriser les conversions (react-hook-form renvoie string si pas de valueAsNumber)
//     const montantAlloue = Number(data.montantAlloue) || 0;
//     const mois = Number(data.mois);
//     const annee = Number(data.annee);
//     const newBudget: BudgetUI = {
//       id: crypto.randomUUID(),
//       user: "current-user-id",
//       categorie: data.categorie,
//       montantAlloue,
//       montantDepense: 0,
//       mois,
//       annee,
//       isActive: true
//     };
//     // Debug temporaire (à retirer si besoin)
//     console.log("[ADD_BUDGET]", newBudget);
//     setBudgets(prev => [newBudget, ...prev]);
//     reset({ categorie: "Autre", montantAlloue: 0, mois: filterMonth, annee: filterYear });
//     setShowForm(false);
//   };
//     return (
//         <div>
//             {/* Formulaire de budget à implémenter */}
//             {/* Formulaire de création */}
//       {showForm && (
//         <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
//           <h3 className="text-lg font-semibold mb-4">Créer un budget</h3>
//           <form onSubmit={handleSubmit(onAddBudget)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Catégorie</label>
//               <select {...register("categorie", { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
//                 {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Montant alloué (€)</label>
//               <input type="number" step="0.01" {...register("montantAlloue", { required: true, min: 0, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
//               {errors.montantAlloue && <p className="text-xs text-red-600 mt-1">Montant invalide</p>}
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Mois</label>
//               <input type="number" {...register("mois", { required: true, min: 1, max: 12, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Année</label>
//               <input type="number" {...register("annee", { required: true, min: 1970, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
//             </div>
//             <div className="md:col-span-4 flex gap-3 pt-2">
//               <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
//               <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm">Annuler</button>
//             </div>
//           </form>
//         </div>
//       )}

            
//         </div>
//     );
// }
// export default BudgetForm;