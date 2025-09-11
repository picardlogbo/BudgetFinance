// =================================================================
// 📦 Imports
// =================================================================

// React et hooks
import { useState } from "react";

// Types et hooks personnalisés
import type { Depenses } from "../../Types/depense";
import { useGetDepenses } from "../../Hooks/useDepense";

// Icônes et UI
import { Calendar, TrendingUp, PieChart, ArrowUpRight } from "lucide-react";

// Graphiques
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Configuration de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

// =================================================================
// 🛠️ Fonctions utilitaires
// =================================================================

/**
 * Utilitaires pour la manipulation des dates
 */
const dateUtils = {
  /**
   * Retourne le début de la journée (00:00:00.000)
   */
  startOfDay: (d: Date): Date => {
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    return start;
  },
  
  /**
   * Retourne la fin de la journée (23:59:59.999)
   */
  endOfDay: (d: Date): Date => {
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    return end;
  },
  
  /**
   * Ajoute n jours à une date
   */
  addDays: (d: Date, n: number): Date => {
    const result = new Date(d);
    result.setDate(result.getDate() + n);
    return result;
  },
  
  /**
   * Calcule le nombre de jours entre deux dates (inclus)
   */
  daysBetween: (start: Date, end: Date): number => {
    const startTime = dateUtils.startOfDay(start).getTime();
    const endTime = dateUtils.endOfDay(end).getTime();
    return Math.max(1, Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)) + 1);
  }
};

/**
 * Filtre les dépenses par plage de dates
 * @param depenses - Liste des dépenses à filtrer
 * @param start - Date de début (incluse)
 * @param end - Date de fin (incluse)
 * @returns Les dépenses comprises entre start et end (bornes incluses)
 */
const filterExpensesByDateRange = (depenses: Depenses[], start: Date, end: Date): Depenses[] => {
  const startTime = dateUtils.startOfDay(start).getTime();
  const endTime = dateUtils.endOfDay(end).getTime();
  return depenses.filter((depense) => {
    const expenseTime = new Date(depense.createdAt).getTime();
    return expenseTime >= startTime && expenseTime <= endTime;
  });
};

/**
 * Calcule la somme des dépenses dans une plage de dates
 * @param depenses - Liste des dépenses
 * @param start - Date de début (incluse)
 * @param end - Date de fin (incluse)
 * @returns Le total des dépenses sur la période
 */
const sumInDateRange = (depenses: Depenses[], start: Date, end: Date): number => {
  return filterExpensesByDateRange(depenses, start, end)
    .reduce((sum, expense) => sum + expense.montant, 0);
};

/**
 * Calculer les dépenses par catégorie pour une plage de dates
 * @param depenses - Liste des dépenses
 * @param start - Date de début (incluse)
 * @param end - Date de fin (incluse)
 * @returns Un objet contenant les montants et pourcentages par catégorie
 */
// const getExpensesByCategory = (depenses: Depenses[], start: Date, end: Date) => {
//   const filteredExpenses = filterExpensesByDateRange(depenses, start, end);
//   const totalForPeriod = sumInDateRange(depenses, start, end);

//   const byCategory = filteredExpenses.reduce<Record<string, { amount: number; percentage: number }>>(
//     (acc, depense) => {
//       if (!acc[depense.categorie]) {
//         acc[depense.categorie] = { amount: 0, percentage: 0 };
//       }
      
//       acc[depense.categorie].amount += depense.montant;
//       acc[depense.categorie].percentage = totalForPeriod > 0
//         ? (acc[depense.categorie].amount / totalForPeriod) * 100
//         : 0;
      
//       return acc;
//     },
//     {}
//   );

//   return {
//     byCategory,
//     total: totalForPeriod
//   };
// };

// =================================================================
// 📊 Composants de visualisation
// =================================================================

/**
 * Calcule et retourne les dépenses groupées par catégorie pour une plage de dates
 */
const getExpensesByCategory = (depenses: Depenses[], start: Date, end: Date) => {
  // Filtrer les dépenses pour la plage de dates
  const filteredExpenses = filterExpensesByDateRange(depenses, start, end);
  
  // Calculer le total pour la période
  const totalForPeriod = sumInDateRange(depenses, start, end);
  
  // Grouper par catégorie
  const byCategory = filteredExpenses.reduce<Record<string, { amount: number; percentage: number }>>(
    (acc, depense) => {
      // Si la catégorie n'existe pas encore, l'initialiser
      if (!acc[depense.categorie]) {
        acc[depense.categorie] = { amount: 0, percentage: 0 };
      }
      
      // Ajouter le montant à la catégorie
      acc[depense.categorie].amount += depense.montant;
      
      // Calculer le pourcentage si le total n'est pas 0
      acc[depense.categorie].percentage = totalForPeriod > 0
        ? (acc[depense.categorie].amount / totalForPeriod) * 100
        : 0;
        
      return acc;
    },
    {}
  );
  
  return {
    byCategory,
    total: totalForPeriod
  };
};

/**
 * Calcule la somme des dépenses pour une période donnée
 * @deprecated Utilisez sumInDateRange à la place
 */
const calculateTotalInRange = (start: Date, end: Date, depenses: Depenses[]): number => {
  return sumInDateRange(depenses, start, end);
};


const ExpensesLineChart: React.FC<{ 
  startDate: Date; 
  endDate: Date;
  depenses: Depenses[];
}> = ({ startDate, endDate, depenses }) => {
  const filteredExpenses = filterExpensesByDateRange(depenses, startDate, endDate);
  
  // Agréger les dépenses par jour
  const dailyExpenses = filteredExpenses.reduce<Record<string, number>>((acc, expense) => {
    // Utiliser la date sans l'heure comme clé
    const dateKey = dateUtils.startOfDay(new Date(expense.createdAt))
      .toISOString().split('T')[0];
    
    // Ajouter le montant au total du jour
    acc[dateKey] = (acc[dateKey] || 0) + expense.montant;
    return acc;
  }, {});

  // Trier les jours chronologiquement
  const sortedDays = Object.keys(dailyExpenses).sort();
  
  // Préparation des données pour le graphique
  const data = {
    labels: sortedDays.map(date => new Date(date).toLocaleDateString('fr-FR')),
    datasets: [{
      label: 'Total des dépenses par jour',
      data: sortedDays.map(day => dailyExpenses[day]),
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.1,
      fill: true
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: true
        },
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return `${value.toLocaleString('fr-FR')}€`;
            }
            return value;
          }
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
};

/**
 * Graphique en camembert montrant la répartition par catégorie
 */
const CategoryPieChart: React.FC<{ 
  startDate: Date; 
  endDate: Date;
  depenses: Depenses[];
  categoryLabels: Record<string, string>;
}> = ({ startDate, endDate, depenses, categoryLabels }) => {
                  const { byCategory } = getExpensesByCategory(depenses, startDate, endDate);  // Préparation des données pour le graphique
  const data = {
    labels: Object.keys(byCategory).map(cat => categoryLabels[cat as keyof typeof categoryLabels]),
    datasets: [{
      data: Object.values(byCategory).map(v => v.amount),
      backgroundColor: [
        '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
        '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'
      ]
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15
        }
      }
    }
  };

  return (
    <div className="h-64">
      <Pie data={data} options={options} />
    </div>
  );
};

/**
 * Statistiques avancées sur les dépenses
 */
const AdvancedStats: React.FC<{ 
  startDate: Date; 
  endDate: Date;
  depenses: Depenses[];
}> = ({ startDate, endDate, depenses }) => {
  const expenses = filterExpensesByDateRange(depenses, startDate, endDate);
  const total = sumInDateRange(depenses, startDate, endDate);
  
  // Calcul des statistiques
  const stats = {
    // Moyenne par dépense (avec protection contre division par 0)
    moyenne: total / (expenses.length || 1),
    
    // Maximum et minimum des montants
    max: Math.max(...expenses.map(e => e.montant), 0),
    min: expenses.length > 0 ? Math.min(...expenses.map(e => e.montant)) : 0,
    
    // Nombre de dépenses
    count: expenses.length,
    
    // Moyenne par jour (en utilisant le nombre réel de jours)
    avgPerDay: total / dateUtils.daysBetween(startDate, endDate)
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard 
        title="Moyenne par dépense" 
        value={stats.moyenne} 
        icon={<TrendingUp className="w-5 h-5" />} 
      />
      <StatCard 
        title="Maximum" 
        value={stats.max} 
        icon={<ArrowUpRight className="w-5 h-5" />} 
      />
      <StatCard 
        title="Minimum" 
        value={stats.min} 
        icon={<ArrowUpRight className="w-5 h-5 transform rotate-180" />} 
      />
      <StatCard 
        title="Nombre" 
        value={stats.count} 
        isCount={true}
        icon={<PieChart className="w-5 h-5" />} 
      />
      <StatCard 
        title="Moyenne / jour" 
        value={stats.avgPerDay} 
        icon={<Calendar className="w-5 h-5" />} 
      />
    </div>
  );
};

/**
 * Carte statistique réutilisable
 */
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  isCount?: boolean;
}> = ({ title, value, icon, isCount = false }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm text-gray-600">{title}</h4>
      <div className="p-2 rounded-lg bg-gray-50">
        {icon}
      </div>
    </div>
    <p className="text-xl font-bold text-gray-900">
      {isCount ? value : `${value.toLocaleString('fr-FR')}€`}
    </p>
  </div>
);

// =================================================================
// 📱 Composant principal
// =================================================================

export const AnalyseDepense: React.FC = () => {
  // 🔹 État local : plage de dates pour le filtrage
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: new Date(),
  });

  // 🔹 État pour le filtre de catégorie
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 🔹 Récupération des dépenses depuis le backend
  const { data: depenses = [], isLoading, isError } = useGetDepenses();

  // 🔹 Libellés pour traduire les catégories
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

  // États de chargement / erreur
  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement des dépenses</div>;

  // =========================================================
  // ✅ Helpers de dates (début/jour/semaine/mois/etc.)
  // =========================================================
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  // 🔹 Début de semaine ISO (lundi)
  const startOfISOWeek = (d: Date) => {
    const s = startOfDay(d);
    const day = s.getDay(); // JS : 0=dimanche, 1=lundi...
    const delta = (day + 6) % 7; // Décalage pour tomber sur lundi
    return addDays(s, -delta);
  };

  // 🔹 Début / fin de mois
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfNextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);

  // 🔹 Début / fin de trimestre
  const startOfQuarter = (d: Date) => {
    const m = d.getMonth();
    const qStart = Math.floor(m / 3) * 3; // 0,3,6,9
    return new Date(d.getFullYear(), qStart, 1);
  };
  const startOfNextQuarter = (d: Date) => {
    const m = d.getMonth();
    const qStart = Math.floor(m / 3) * 3;
    return new Date(d.getFullYear(), qStart + 3, 1);
  };

  // 🔹 Début / fin de semestre
  const startOfSemester = (d: Date) => {
    const m = d.getMonth();
    const sStart = m < 6 ? 0 : 6; // 0 = Jan→Juin, 6 = Juil→Déc
    return new Date(d.getFullYear(), sStart, 1);
  };
  const startOfNextSemester = (d: Date) => {
    const m = d.getMonth();
    const sStart = m < 6 ? 0 : 6;
    return new Date(d.getFullYear(), sStart + 6, 1);
  };

  // 🔹 Début / fin d’année
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  const startOfNextYear = (d: Date) => new Date(d.getFullYear() + 1, 0, 1);

  // Les calculs de sommes sont maintenant gérés par calculateTotalInRange

  //fonction qui donne la liste des dépenses pour une plage de date
  // const getExpensesInRange = (from: Date, to: Date) => {
  //   const fromMs = +from;
  //   const toMs = +to;
  //   return depenses.filter((e: Depenses) => {
  //     const raw = e.createdAt ?? (e as Depenses).createdAt;
  //     const t = raw ? +new Date(raw) : 0;
  //     return t >= fromMs && t < toMs;
  //   });
  // };

  

  // =========================================================
  // ✅ Total pour la date choisie
  // =========================================================
  // const selectedDayStart = startOfDay(anchorDate);
  // const selectedDayEnd = addDays(selectedDayStart, 1);
  // const totalAtSelectedDate = sumInRange(selectedDayStart, selectedDayEnd);

  // Cette variable n'est plus utilisée car nous utilisons maintenant filterExpensesByDateRange

  // 🔹 Card spéciale pour la date choisie
  // const SpecialDateCard = ({ date, amount }: { date: Date; amount: number }) => (
  //   <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-4">
  //     <h4 className="font-semibold text-yellow-800">
  //       Dépenses du {date.toLocaleDateString("fr-FR")}
  //     </h4>
  //     <p className="text-2xl font-bold text-yellow-600 mt-1">
  //       {amount.toLocaleString("fr-FR")} €
  //     </p>
  //   </div>
  // );

  // =========================================================
  // ✅ Calculs des totaux par période
  // =========================================================
  const dayStart = startOfDay(dateRange.start);
  const dayEnd = addDays(dayStart, 1);
  const weekStart = startOfISOWeek(dateRange.start);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(dateRange.start);
  const monthEnd = startOfNextMonth(dateRange.start);
  const quarterStart = startOfQuarter(dateRange.start);
  const quarterEnd = startOfNextQuarter(dateRange.start);
  const semesterStart = startOfSemester(dateRange.start);
  const semesterEnd = startOfNextSemester(dateRange.start);
  const yearStart = startOfYear(dateRange.start);
  const yearEnd = startOfNextYear(dateRange.start);

  // Calcul des totaux par période
  const totalToday = calculateTotalInRange(dayStart, dayEnd, depenses);
  const totalThisWeek = calculateTotalInRange(weekStart, weekEnd, depenses);
  const totalThisMonth = calculateTotalInRange(monthStart, monthEnd, depenses);
  const totalThisQuarter = calculateTotalInRange(quarterStart, quarterEnd, depenses);
  const totalThisSemester = calculateTotalInRange(semesterStart, semesterEnd, depenses);
  const totalThisYear = calculateTotalInRange(yearStart, yearEnd, depenses);

  // =========================================================
  // ✅ Résumé par catégorie pour une plage de dates
  // =========================================================
  
  /**
   * Calcule les dépenses par catégorie pour une plage de dates donnée
   * @param start - Date de début
   * @param end - Date de fin
   * @returns Un objet avec les totaux par catégorie
   */
  const getExpensesByCategory = (start: Date, end: Date) => {
    // Filtrer les dépenses pour la plage de dates
    const filteredExpenses = filterExpensesByDateRange(depenses, start, end);
    
    // Calculer le total pour la période
    const totalForPeriod = sumInDateRange(depenses, start, end);
    
    // Regrouper par catégorie
    const expensesByCategory: Record<string, { amount: number; percentage: number }> = 
      filteredExpenses.reduce((acc: Record<string, { amount: number; percentage: number }>, depense: Depenses) => {
        // Si la catégorie n'existe pas encore, l'initialiser
        if (!acc[depense.categorie]) {
          acc[depense.categorie] = { amount: 0, percentage: 0 };
        }
        
        // Ajouter le montant à la catégorie
        acc[depense.categorie].amount += depense.montant;
        
        // Calculer le pourcentage si le total n'est pas 0
        acc[depense.categorie].percentage = totalForPeriod > 0
          ? (acc[depense.categorie].amount / totalForPeriod) * 100
          : 0;
          
        return acc;
      }, {});
      
    return {
      byCategory: expensesByCategory,
      total: totalForPeriod
    };
  };

  // =========================================================
  // ✅ Composant visuel : card KPI (jour/semaine/mois/...)
  // =========================================================
  const KpiCard = ({ title, amount, sub }: { title: string; amount: number; sub?: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{amount.toLocaleString("fr-FR")} €</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <Calendar className="w-5 h-5 text-gray-600" />
        </div>
      </div>
    </div>
  );

  // États de chargement et erreur
  if (isLoading) return <div className="text-center py-8">Chargement des dépenses...</div>;
  if (isError) return <div className="text-center py-8 text-red-600">Erreur lors du chargement des dépenses</div>;

  return (
    <div>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyse des Dépenses</h2>
            <p className="text-gray-600 mt-1">
              Total pour la période :{" "}
              <span className="font-semibold text-red-600">
                {(() => {
                  const dateFiltered = filterExpensesByDateRange(depenses, dateRange.start, dateRange.end);
                  const categoryFiltered = selectedCategory === "all"
                    ? dateFiltered
                    : dateFiltered.filter(d => d.categorie === selectedCategory);
                  return categoryFiltered.reduce((sum, d) => sum + d.montant, 0).toLocaleString("fr-FR");
                })()} €
              </span>
            </p>
          </div>

         
         

          {/* 🔹 Sélecteurs de plage de dates */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Du</label>
              <input
                type="date"
                value={startOfDay(dateRange.start).toISOString().slice(0, 10)}
                onChange={(e) => {
                  const parts = e.target.value.split("-").map(Number);
                  if (parts.length === 3) {
                    const [y, m, d] = parts;
                    setDateRange(prev => ({
                      ...prev,
                      start: new Date(y, m - 1, d)
                    }));
                  }
                }}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Au</label>
              <input
                type="date"
                value={startOfDay(dateRange.end).toISOString().slice(0, 10)}
                onChange={(e) => {
                  const parts = e.target.value.split("-").map(Number);
                  if (parts.length === 3) {
                    const [y, m, d] = parts;
                    setDateRange(prev => ({
                      ...prev,
                      end: new Date(y, m - 1, d)
                    }));
                  }
                }}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>


        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ========================== */}
          {/* 🔹 Card 1 : Dépenses par période */}
          {/* ========================== */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Dépenses par période
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-2 gap-4">
              <KpiCard title="Aujourd’hui" amount={totalToday} />
              <KpiCard title="Cette semaine" amount={totalThisWeek} />
              <KpiCard title="Ce mois" amount={totalThisMonth} />
              <KpiCard title="Ce trimestre" amount={totalThisQuarter} />
              <KpiCard title="Ce semestre" amount={totalThisSemester} />
              <KpiCard title="Cette année" amount={totalThisYear} />
            </div>
          </div>

          {/* ========================== */}
          {/* 🔹 Card 2 : Visualisation des données */}
          {/* ========================== */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Visualisation des dépenses
              </h3>
              <p className="text-sm text-gray-600">
                {dateRange.start.toLocaleDateString("fr-FR")} au {dateRange.end.toLocaleDateString("fr-FR")}
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Graphique d'évolution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Évolution temporelle</h4>
                <ExpensesLineChart 
                  startDate={dateRange.start} 
                  endDate={dateRange.end} 
                  depenses={depenses}
                />
              </div>
              
              {/* Graphique de répartition */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Répartition par catégorie</h4>
                <CategoryPieChart 
                  startDate={dateRange.start} 
                  endDate={dateRange.end}
                  depenses={depenses}
                  categoryLabels={categoryLabels}
                />
              </div>
              
              {/* Statistiques détaillées */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques détaillées</h4>
                <AdvancedStats 
                  startDate={dateRange.start} 
                  endDate={dateRange.end}
                  depenses={depenses}
                />
              </div>
              
              {/* Liste des catégories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Détail par catégorie</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(getExpensesByCategory(dateRange.start, dateRange.end).byCategory)
                    .sort(([, a], [, b]) => b.amount - a.amount)
                    .map(([category, data]) => (
                      <div
                        key={category}
                        className="bg-gray-50 rounded-lg shadow-sm border border-gray-100 p-4"
                      >
                        {/* Nom de la catégorie */}
                        <h4 className="font-medium text-gray-700 mb-2">
                          {categoryLabels[category as Depenses["categorie"]] || category}
                        </h4>
                        
                        {/* Montant */}
                        <p className="text-xl font-bold text-red-600">
                          {data.amount.toLocaleString("fr-FR")} €
                        </p>
                        
                        {/* Pourcentage */}
                        <p className="text-sm text-gray-500 mt-1">
                          {data.percentage.toFixed(1)}% du total
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

  <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 mt-6">
    {/* <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-800">
        Dépenses du {dateRange.start.toLocaleDateString("fr-FR")} au {dateRange.end.toLocaleDateString("fr-FR")}
      </h3>
      <div className="text-gray-700">
        Total : <span className="font-bold text-red-600">{sumInDateRange(depenses, dateRange.start, dateRange.end).toLocaleString("fr-FR")} €</span>
      </div>
    </div> */}

    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">
        Dépenses du {dateRange.start.toLocaleDateString("fr-FR")} au {dateRange.end.toLocaleDateString("fr-FR")}
      </h3>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="all">Toutes les catégories</option>
          {Object.keys(categoryLabels).map((cat) => (
            <option key={cat} value={cat}>
              {categoryLabels[cat as keyof typeof categoryLabels]}
            </option>
          ))}
        </select>
      </div>
      <div className="text-gray-700">
        Total filtré : <span className="font-bold text-red-600">
          {(() => {
            const dateFiltered = filterExpensesByDateRange(depenses, dateRange.start, dateRange.end);
            const categoryFiltered = selectedCategory === "all"
              ? dateFiltered
              : dateFiltered.filter(d => d.categorie === selectedCategory);
            return categoryFiltered.reduce((sum, d) => sum + d.montant, 0).toLocaleString("fr-FR");
          })()} €
        </span>
      </div>
    </div>

    <ul className="space-y-2">
      {(() => {
        const filtered = filterExpensesByDateRange(depenses, dateRange.start, dateRange.end)
          .filter(d => selectedCategory === "all" || d.categorie === selectedCategory)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filtered.length === 0) {
          return (
            <p className="text-gray-500 text-center py-4">
              {selectedCategory === "all" 
                ? "Aucune dépense pour cette période" 
                : `Aucune dépense de type "${categoryLabels[selectedCategory as keyof typeof categoryLabels]}" pour cette période`}
            </p>
          );
        }

        return filtered.map((depense) => (
          <li
            key={depense._id}
            className="p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center"
          >
            <div className="flex flex-col">
              <span className="text-gray-700">
                {depense.title ?? categoryLabels[depense.categorie as keyof typeof categoryLabels]}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(depense.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span className="text-sm text-gray-500">
                {categoryLabels[depense.categorie as keyof typeof categoryLabels]}
              </span>
            </div>
            <span className="font-bold text-red-600">
              {depense.montant.toLocaleString("fr-FR")} €
            </span>
          </li>
        ));
      })()}
    </ul>
  </div>

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SpecialDateCard date={anchorDate} amount={totalAtSelectedDate} />
          <button
            onClick={() => setShowSelectedDateExpenses(!showSelectedDateExpenses)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showSelectedDateExpenses ? "Masquer" : "Afficher"} les dépenses
          </button>
        </div>

       
        {showSelectedDateExpenses && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-900">
              Dépenses du {anchorDate.toLocaleDateString("fr-FR")}
            </h3>
            <ul className="mt-2 space-y-2">
              {expensesOnSelectedDate.length > 0 ? (
                expensesOnSelectedDate.map((depense: Depenses) => (
                  <li
                    key={depense._id}
                    className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 flex justify-between"
                  >
                    <span className="text-gray-700">{depense.title ?? depense.categorie}</span>
                    <span className="font-bold text-red-600">
                      {depense.montant.toLocaleString("fr-FR")} €
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">Aucune dépense pour cette date</p>
              )}
            </ul>
          </div>
        )} */}

       
      </div>
    </div>
  );
};
