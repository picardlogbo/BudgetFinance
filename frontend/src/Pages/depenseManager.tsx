

// // Types pour le formulaire (mapping frontend/backend)
// type ExpenseFormValues = {
//   title: string;          // correspond au backend "title"
//   montant: number;        // correspond au backend "montant"
//   categorie: Depenses["categorie"];  // enum backend
//   frequence: Depenses["frequence"];  // enum backend  
//   isActive: boolean;      // correspond au backend "isActive"
// };

import DepenseList from "../Components/Depenses/DepenseList";
import DepenseForm from "../Components/Depenses/FormDepense";
import HeaderDepense from "../Components/Depenses/HeaderDepense";

// Composant principal de gestion des dépenses
const ExpenseManager: React.FC = () => {

    //   const queryClient = useQueryClient();
    //   const {showToast} = useAppContext();


  // État local pour stocker la liste des dépenses
//   const [expenses, setExpenses] = useState<Depenses[]>([]);
  // État pour gérer l'affichage du formulaire
//   const [showForm, setShowForm] = useState(false);

//     // ✅ Charger les dépenses avec useQuery
//   const {data:Depense = [] , isLoading , isError } = useQuery({
//     queryKey:["expense"], // identifiant unique du cache
//     queryFn:["fechtch"],// fonction API qui va chercher les dépenses
//   })

//     // ✅ Mutation pour ajouter une dépense
//     const addExpendMutation = useMutation({
//         mutationFn:CreateExpenses , // appel de l'api Post
//         onSuccess : ()=>{

//             showToast({ type: "SUCCESS", message: " Ajouter avec succes." });
//             queryClient.invalidateQueries({queryKey:["expenses"]});     
//         },
//          onError: (error) => {
//         showToast({ type: "ERROR", message: error.message });
//     },
//     })

//     // ✅ Mutation pour supprimer une dépense
//   const deleteExpenseMutation = useMutation({
//     mutationFn: async  deleteExpense,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["expenses"] });
//     },
//      onError: (error) => {
//         showToast({ type: "ERROR", message: error.message });
//     },
//   });


//   // Fonction pour ajouter une nouvelle dépense
//   const onAddExpense = (newExpense: Omit<Depenses, "id" | "user" | "createdAt">) => {
//     const expense: Depenses = {
//       ...newExpense,
//       id: Date.now().toString(), // ID temporaire (remplacé par backend)
//       user: "current-user-id", // À remplacer par l'ID utilisateur authentifié
//       createdAt: new Date(), // Date actuelle
//     };
//     setExpenses(prev => [expense, ...prev]);
//   };

  // Hooks pour gestion du formulaire avec react-hook-form
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

//    // ✅ Soumission du formulaire
//   const onSubmit = (data: ExpenseFormValues) => {
//     addExpendMutation.mutate(data); // envoi vers l’API
//     reset();
//     setShowForm(false);
//   };

//   // ✅ Fonction pour supprimer une dépense
//   const handleDelete = (id: string) => {
//     if (confirm("Supprimer cette dépense ?")) {
//       deleteExpenseMutation.mutate(id);
//     }
//   };

//   // ✅ Soumission du formulaire - transforme les données pour le backend
//   const onSubmit = (data: ExpenseFormValues) => {
//     onAddExpense({
//       ...data,
//       // createdAt sera généré automatiquement par le backend
//     });
//     reset(); // reset du formulaire
//     setShowForm(false);
//   };


  // Résumé des dépenses du mois actuel
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

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <HeaderDepense  />
      <DepenseForm />
    <DepenseList />

     
    </div>
  );
};

// Export du composant pour utilisation comme page dans le routeur
export default ExpenseManager;
