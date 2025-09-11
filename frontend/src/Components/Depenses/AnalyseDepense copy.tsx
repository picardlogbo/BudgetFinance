import { useState } from "react";
import type { Depenses } from "../../Types/depense";
import { useGetDepenses } from "../../Hooks/useDepense";
import { Calendar, Plus } from "lucide-react";

export const AnalyseDepense: React.FC = () => {
  // 🔹 État local : date de référence (sélecteur de date)
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  // 🔹 État local : afficher/masquer la liste des dépenses du jour choisi
  const [showSelectedDateExpenses, setShowSelectedDateExpenses] = useState(false);

  // 🔹 Récupération des dépenses depuis le backend (via React Query custom hook)
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

  // =========================================================
  // ✅ Utilitaire : somme des dépenses dans un intervalle
  // =========================================================
  const sumInRange = (from: Date, to: Date) => {
    const fromMs = +from;
    const toMs = +to;
    return depenses.reduce((sum: number, e: Depenses) => {
      const raw = e.createdAt ?? (e as Depenses).createdAt;
      const t = raw ? +new Date(raw) : 0;
      if (t >= fromMs && t < toMs) sum += e.montant;
      return sum;
    }, 0);
  };

  // =========================================================
  // ✅ Total pour la date choisie
  // =========================================================
  const selectedDayStart = startOfDay(anchorDate);
  const selectedDayEnd = addDays(selectedDayStart, 1);
  const totalAtSelectedDate = sumInRange(selectedDayStart, selectedDayEnd);

  // 🔹 Liste filtrée des dépenses de la date choisie
  const expensesOnSelectedDate = depenses.filter((e: Depenses) => {
    const d = new Date(e.createdAt);
    return d >= selectedDayStart && d < selectedDayEnd;
  });

  // 🔹 Card spéciale pour la date choisie
  const SpecialDateCard = ({ date, amount }: { date: Date; amount: number }) => (
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
  // ✅ Calculs des totaux par période
  // =========================================================
  const dayStart = startOfDay(anchorDate);
  const dayEnd = addDays(dayStart, 1);
  const weekStart = startOfISOWeek(anchorDate);
  const weekEnd = addDays(weekStart, 7);
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = startOfNextMonth(anchorDate);
  const quarterStart = startOfQuarter(anchorDate);
  const quarterEnd = startOfNextQuarter(anchorDate);
  const semesterStart = startOfSemester(anchorDate);
  const semesterEnd = startOfNextSemester(anchorDate);
  const yearStart = startOfYear(anchorDate);
  const yearEnd = startOfNextYear(anchorDate);

  // Totaux
  const totalToday = sumInRange(dayStart, dayEnd);
  const totalThisWeek = sumInRange(weekStart, weekEnd);
  const totalThisMonth = sumInRange(monthStart, monthEnd);
  const totalThisQuarter = sumInRange(quarterStart, quarterEnd);
  const totalThisSemester = sumInRange(semesterStart, semesterEnd);
  const totalThisYear = sumInRange(yearStart, yearEnd);

  // =========================================================
  // ✅ Résumé par catégorie (mois courant)
  // =========================================================
  const totalMonthlyExpenses = totalThisMonth;

  const expensesByCategory: Record<string, number> = depenses
    .filter((e: Depenses) => {
      const d = new Date(e.createdAt);
      return d >= monthStart && d < monthEnd;
    })
    .reduce((acc: Record<string, number>, depense: Depenses) => {
      acc[depense.categorie] = (acc[depense.categorie] || 0) + depense.montant;
      return acc;
    }, {});

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

  return (
    <div>
      <div className="space-y-6">
        {/* =========================================================
            HEADER
        ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analyse des Dépenses</h2>
            <p className="text-gray-600 mt-1">
              Total ce mois :{" "}
              <span className="font-semibold text-red-600">
                {totalMonthlyExpenses.toLocaleString("fr-FR")} €
              </span>
            </p>
          </div>

          {/* 🔹 Sélecteur de date */}
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
          </div>
        </div>

        {/* =========================================================
            Cards de synthèse par période
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard title="Aujourd’hui" amount={totalToday} />
          <KpiCard title="Cette semaine" amount={totalThisWeek} />
          <KpiCard title="Ce mois" amount={totalThisMonth} />
          <KpiCard title="Ce trimestre" amount={totalThisQuarter} />
          <KpiCard title="Ce semestre" amount={totalThisSemester} />
          <KpiCard title="Cette année" amount={totalThisYear} />
        </div>

        {/* =========================================================
            Card spéciale + bouton toggle
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SpecialDateCard date={anchorDate} amount={totalAtSelectedDate} />
          <button
            onClick={() => setShowSelectedDateExpenses(!showSelectedDateExpenses)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {showSelectedDateExpenses ? "Masquer" : "Afficher"} les dépenses
          </button>
        </div>

        {/* =========================================================
            Liste détaillée des dépenses du jour sélectionné
        ========================================================= */}
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
        )}

        {/* =========================================================
            Résumé par catégorie (mois courant)
        ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        </div>
      </div>
    </div>
  );
};
