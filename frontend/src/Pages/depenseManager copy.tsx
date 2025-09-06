// import React, { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Plus, CreditCard, Calendar, Tag } from "lucide-react";
// import type { Depenses } from "../Types/depense";
// import * as APIDepense from "../API/API-Depense";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useAppContext } from "../Utils/AppContextUtils";

// // Types pour le formulaire (mapping frontend/backend)
// type ExpenseFormValues = {
//   title: string;          // correspond au backend "title"
//   montant: number;        // correspond au backend "montant"
//   categorie: Depenses["categorie"];  // enum backend
//   frequence: Depenses["frequence"];  // enum backend  
//   isActive: boolean;      // correspond au backend "isActive"
// };

// // Composant principal de gestion des dépenses
// const ExpenseManager: React.FC = () => {

//     //   const queryClient = useQueryClient();
//     //   const {showToast} = useAppContext();


//   // État local pour stocker la liste des dépenses
// //   const [expenses, setExpenses] = useState<Depenses[]>([]);
//   // État pour gérer l'affichage du formulaire
// //   const [showForm, setShowForm] = useState(false);

// //     // ✅ Charger les dépenses avec useQuery
// //   const {data:Depense = [] , isLoading , isError } = useQuery({
// //     queryKey:["expense"], // identifiant unique du cache
// //     queryFn:["fechtch"],// fonction API qui va chercher les dépenses
// //   })

// //     // ✅ Mutation pour ajouter une dépense
// //     const addExpendMutation = useMutation({
// //         mutationFn:CreateExpenses , // appel de l'api Post
// //         onSuccess : ()=>{

// //             showToast({ type: "SUCCESS", message: " Ajouter avec succes." });
// //             queryClient.invalidateQueries({queryKey:["expenses"]});     
// //         },
// //          onError: (error) => {
// //         showToast({ type: "ERROR", message: error.message });
// //     },
// //     })

// //     // ✅ Mutation pour supprimer une dépense
// //   const deleteExpenseMutation = useMutation({
// //     mutationFn: async  deleteExpense,
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["expenses"] });
// //     },
// //      onError: (error) => {
// //         showToast({ type: "ERROR", message: error.message });
// //     },
// //   });


// //   // Fonction pour ajouter une nouvelle dépense
// //   const onAddExpense = (newExpense: Omit<Depenses, "id" | "user" | "createdAt">) => {
// //     const expense: Depenses = {
// //       ...newExpense,
// //       id: Date.now().toString(), // ID temporaire (remplacé par backend)
// //       user: "current-user-id", // À remplacer par l'ID utilisateur authentifié
// //       createdAt: new Date(), // Date actuelle
// //     };
// //     setExpenses(prev => [expense, ...prev]);
// //   };

//   // Hooks pour gestion du formulaire avec react-hook-form
//   const {

// //     register,
// //     handleSubmit,
// //     reset,
// //     formState: { errors },
// //   } = useForm<ExpenseFormValues>({
// //     defaultValues: {
// //       title: "",
// //       montant: 0,
// //       categorie: "autre",
// //       frequence: "mensuelle",
// //       isActive: true,
// //     },
// //   });

// //    // ✅ Soumission du formulaire
// //   const onSubmit = (data: ExpenseFormValues) => {
// //     addExpendMutation.mutate(data); // envoi vers l’API
// //     reset();
// //     setShowForm(false);
// //   };

// //   // ✅ Fonction pour supprimer une dépense
// //   const handleDelete = (id: string) => {
// //     if (confirm("Supprimer cette dépense ?")) {
// //       deleteExpenseMutation.mutate(id);
// //     }
// //   };

// //   // ✅ Soumission du formulaire - transforme les données pour le backend
// //   const onSubmit = (data: ExpenseFormValues) => {
// //     onAddExpense({
// //       ...data,
// //       // createdAt sera généré automatiquement par le backend
// //     });
// //     reset(); // reset du formulaire
// //     setShowForm(false);
// //   };


//   // Résumé des dépenses du mois actuel
//   const totalMonthlyExpenses = expenses
//     .filter((e) => new Date(e.createdAt).getMonth() === new Date().getMonth())
//     .reduce((sum, e) => sum + e.montant, 0);

//   // Regroupement par catégorie pour le mois actuel
//   const expensesByCategory = expenses
//     .filter((e) => new Date(e.createdAt).getMonth() === new Date().getMonth())
//     .reduce((acc, expense) => {
//       acc[expense.categorie] = (acc[expense.categorie] || 0) + expense.montant;
//       return acc;
//     }, {} as Record<string, number>);

//   return (
//     <div className="space-y-6">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">
//             Gestion des Dépenses
//           </h2>
//           <p className="text-gray-600 mt-1">
//             Total ce mois :{" "}
//             <span className="font-semibold text-red-600">
//               {totalMonthlyExpenses.toLocaleString("fr-FR")} €
//             </span>
//           </p>
//         </div>
//         <button
//           onClick={() => setShowForm(!showForm)}
//           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           Ajouter une dépense
//         </button>
//       </div>

//       {/* RÉSUMÉ PAR CATÉGORIE */}
//       <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {Object.entries(expensesByCategory)
//           .slice(0, 4)
//           .map(([category, montant]) => (
//             <div
//               key={category}
//               className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
//             >
//               <h4 className="font-medium text-gray-700 mb-2">
//                 {categoryLabels[category as Depenses["categorie"]]}
//               </h4>
//               <p className="text-xl font-bold text-red-600">
//                 {montant.toLocaleString("fr-FR")} €
//               </p>
//               <p className="text-sm text-gray-500 mt-1">
//                 {totalMonthlyExpenses > 0
//                   ? ((montant / totalMonthlyExpenses) * 100).toFixed(1)
//                   : 0}
//                 % du total
//               </p>
//             </div>
//           ))}
//       </div>

//       {/* FORMULAIRE */}
//       {showForm && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6" >
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">
//             Nouvelle Dépense
//           </h3>
//           <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             {/* Titre/Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <input
//                 type="text"
//                 {...register("title", { required: "Description requise" })}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                 placeholder="Ex: Courses, Essence..."
//               />
//               {errors.title && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.title.message}
//                 </p>
//               )}
//             </div>

//             {/* Montant */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Montant (€)
//               </label>
//               <input
//                 type="number"
//                 step="0.01"
//                 {...register("montant", {
//                   required: "Montant requis",
//                   min: { value: 0.01, message: "Doit être positif" },
//                   valueAsNumber: true,
//                 })}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//                 placeholder="0.00"
//               />
//               {errors.montant && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {errors.montant.message}
//                 </p>
//               )}
//             </div>

//             {/* Catégorie */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Catégorie
//               </label>
//               <select
//                 {...register("categorie")}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               >
//                 {Object.entries(categoryLabels).map(([key, label]) => (
//                   <option key={key} value={key}>
//                     {label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Fréquence */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Fréquence
//               </label>
//               <select
//                 {...register("frequence")}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               >
//                 {Object.entries(frequenceLabels).map(([key, label]) => (
//                   <option key={key} value={key}>
//                     {label}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             {/* Statut actif */}
//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 {...register("isActive")}
//                 id="isActive"
//                 className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
//               />
//               <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
//                 Dépense active
//               </label>
//             </div>

//             {/* Boutons */}
//             <div className="md:col-span-2 flex gap-3">
//               <button
//                 type="submit"
//                 className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
//               >
//                 Ajouter
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors"
//               >
//                 Annuler
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* LISTE DES DÉPENSES */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100">
//         <div className="p-6 border-b border-gray-100">
//           <h3 className="text-lg font-semibold text-gray-900">
//             Dépenses récentes
//           </h3>
//         </div>
//         <div className="divide-y divide-gray-100">
//           {expenses.length === 0 ? (
//             <div className="p-6 text-center text-gray-500">
//               <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
//               <p>Aucune dépense enregistrée</p>
//               <p className="text-sm">Commencez par ajouter vos dépenses</p>
//             </div>
//           ) : (
//             expenses
//               .sort(
//                 // Tri par date de création (plus récent en premier)
//                 (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//               )
//               .slice(0, 10)
//               .map((expense) => (
//                 <div
//                   key={expense.id}
//                   className="p-6 hover:bg-gray-50 transition-colors"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="p-2 bg-red-100 rounded-lg">
//                         <CreditCard className="w-5 h-5 text-red-600" />
//                       </div>
//                       <div>
//                         <h4 className="font-semibold text-gray-900">
//                           {expense.title}
//                         </h4>
//                         <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
//                           <span className="flex items-center gap-1">
//                             <Tag className="w-4 h-4" />
//                             {categoryLabels[expense.categorie]}
//                           </span>
//                           <span className="flex items-center gap-1">
//                             <Calendar className="w-4 h-4" />
//                             {new Date(expense.createdAt).toLocaleDateString("fr-FR")}
//                           </span>
//                           <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//                             {frequenceLabels[expense.frequence]}
//                           </span>
//                           {expense.isActive && (
//                             <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
//                               Actif
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="text-lg font-bold text-red-600">
//                         -{expense.montant.toLocaleString("fr-FR")} €
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // Export du composant pour utilisation comme page dans le routeur
// export default ExpenseManager;
