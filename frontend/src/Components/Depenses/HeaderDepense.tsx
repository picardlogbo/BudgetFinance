import { useState } from "react";
import { useGetDepenses } from "../../Hooks/useDepense";
import type { Depenses } from "../../Types/depense";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeaderDepense: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // 🔹 Nouvelle "date de référence" : toutes les périodes (jour, semaine, etc.)
  // seront calculées par rapport à cette date (par défaut : aujourd’hui).
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  const { data: depenses = [], isLoading, isError } = useGetDepenses();

  // const categoryLabels: Record<Depenses["categorie"], string> = {
  //   Alimentation: "Alimentation",
  //   Transport: "Transport",
  //   Santé: "Santé",
  //   Loisirs: "Loisirs",
  //   Loyer: "Logement",
  //   Factures: "Factures",
  //   Éducation: "Éducation",
  //   Autre: "Autre",
  // };

  if (isLoading) return <div>Chargement...</div>;
  if (isError) return <div>Erreur lors du chargement des dépenses</div>;

  // =========================================================
  // ✅ Helpers de dates (toutes exclusives en "fin de période")
  // =========================================================
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  // const startOfISOWeek = (d: Date) => {
  //   const s = startOfDay(d);
  //   const day = s.getDay(); // 0 = dim → ISO (lundi=0) => (day+6)%7
  //   const delta = (day + 6) % 7;
  //   return addDays(s, -delta); // Lundi
  // };

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const startOfNextMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);

  // const startOfQuarter = (d: Date) => {
  //   const m = d.getMonth();
  //   const qStart = Math.floor(m / 3) * 3; // 0,3,6,9
  //   return new Date(d.getFullYear(), qStart, 1);
  // };
  // const startOfNextQuarter = (d: Date) => {
  //   const m = d.getMonth();
  //   const qStart = Math.floor(m / 3) * 3;
  //   return new Date(d.getFullYear(), qStart + 3, 1);
  // };

  // const startOfSemester = (d: Date) => {
  //   const m = d.getMonth();
  //   const sStart = m < 6 ? 0 : 6; // 0 = Jan→Juin, 6 = Juil→Déc
  //   return new Date(d.getFullYear(), sStart, 1);
  // };
  // const startOfNextSemester = (d: Date) => {
  //   const m = d.getMonth();
  //   const sStart = m < 6 ? 0 : 6;
  //   return new Date(d.getFullYear(), sStart + 6, 1);
  // };


  

  // const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  // const startOfNextYear = (d: Date) => new Date(d.getFullYear() + 1, 0, 1);

  // 🔹 Somme des dépenses dans [from, to[
  const sumInRange = (from: Date, to: Date) => {
    const fromMs = +from;
    const toMs = +to;
    return depenses.reduce((sum: number, e: Depenses) => {
      const raw = e.createdAt ?? (e as Depenses).createdAt; // fallback si jamais
      const t = raw ? +new Date(raw) : 0;
      if (t >= fromMs && t < toMs) sum += e.montant;
      return sum;
    }, 0);
  };

  // 🔹 Calcul du total pour la date choisie
const selectedDayStart = startOfDay(anchorDate);
const selectedDayEnd = addDays(selectedDayStart, 1);
const totalAtSelectedDate = sumInRange(selectedDayStart, selectedDayEnd);

// 🔹 Card spéciale pour la date choisie
const SpecialDateCard = ({
  date,
  amount,
}: {
  date: Date;
  amount: number;
}) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-4">
    <h4 className="font-semibold text-yellow-800">
      Dépenses du {date.toLocaleDateString("fr-FR")}
    </h4>
    <p className="text-2xl font-bold text-yellow-600 mt-1">
      {amount.toLocaleString("fr-FR")} €
    </p>
  </div>
);

  // =========================================================
  // ✅ Calculs des totaux relatifs à la date de référence
  // =========================================================
  // const dayStart = startOfDay(anchorDate);
  // const dayEnd = addDays(dayStart, 1);
  // const weekStart = startOfISOWeek(anchorDate);
  // const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = startOfNextMonth(anchorDate);
  // const quarterStart = startOfQuarter(anchorDate);
  // const quarterEnd = startOfNextQuarter(anchorDate);
  // const semesterStart = startOfSemester(anchorDate);
  // const semesterEnd = startOfNextSemester(anchorDate);
  // const yearStart = startOfYear(anchorDate);
  // const yearEnd = startOfNextYear(anchorDate);

  // const totalToday = sumInRange(dayStart, dayEnd);
  // const totalThisWeek = sumInRange(weekStart, weekEnd);
  const totalThisMonth = sumInRange(monthStart, monthEnd);
  // const totalThisQuarter = sumInRange(quarterStart, quarterEnd);
  // const totalThisSemester = sumInRange(semesterStart, semesterEnd);
  // const totalThisYear = sumInRange(yearStart, yearEnd);

  // ✅ Résumé du mois actuel (tu l’avais déjà)
  const totalMonthlyExpenses = totalThisMonth;

  // ✅ Regroupement par catégorie (mois courant)
  // const expensesByCategory: Record<string, number> = depenses
  //   .filter((e: Depenses) => {
  //     const d = new Date(e.createdAt);
  //     return d >= monthStart && d < monthEnd;
  //   })
  //   .reduce((acc: Record<string, number>, depense: Depenses) => {
  //     acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant;
  //     return acc;
  //   }, {});

  // Petit composant visuel pour une card KPI
  // const KpiCard = ({
  //   title,
  //   amount,
  //   sub,
  // }: {
  //   title: string;
  //   amount: number;
  //   sub?: string;
  // }) => (
  //   <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
  //     <div className="flex items-center justify-between">
  //       <div>
  //         <p className="text-sm text-gray-600">{title}</p>
  //         <p className="text-2xl font-bold">
  //           {amount.toLocaleString("fr-FR")} €
  //         </p>
  //         {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  //       </div>
  //       <div className="p-2 rounded-lg bg-gray-50">
  //         <Calendar className="w-5 h-5 text-gray-600" />
  //       </div>
  //     </div>
  //   </div>
  // );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Dépenses</h2>
          <p className="text-gray-600 mt-1">
            Total ce mois :{" "}
            <span className="font-semibold text-red-600">
              {totalMonthlyExpenses.toLocaleString("fr-FR")} €
            </span>
          </p>
        </div>

        {/* 🔹 Sélecteur de date de référence */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700">Date de référence</label>
          <input
            type="date"
            value={startOfDay(anchorDate).toISOString().slice(0, 10)}
            onChange={(e) => {
              const parts = e.target.value.split("-").map(Number);
              if (parts.length === 3) {
                const [y, m, d] = parts;
                setAnchorDate(new Date(y, m - 1, d));
              }
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
           <button
            onClick={() => navigate("/analyse-depenses")}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Analyses
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter une dépense
          </button>
        </div>
      </div>

      {/* 🔹 NOUVELLE LIGNE : Cards de synthèse par période */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Aujourd’hui" amount={totalToday} />
        <KpiCard title="Cette semaine" amount={totalThisWeek} />
        <KpiCard title="Ce mois" amount={totalThisMonth} />
        <KpiCard title="Ce trimestre" amount={totalThisQuarter} />
        <KpiCard title="Ce semestre" amount={totalThisSemester} />
        <KpiCard title="Cette année" amount={totalThisYear} />
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpecialDateCard date={anchorDate} amount={totalAtSelectedDate} />
      </div>

      {/* RÉSUMÉ PAR CATÉGORIE (mois courant) */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(expensesByCategory)
          .slice(0, 4)
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
      </div> */}
    </div>
  );
};

export default HeaderDepense;
