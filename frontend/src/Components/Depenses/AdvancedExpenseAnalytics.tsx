import React, { useMemo } from 'react';
import type { Depenses } from '../../Types/depense';
// import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  computeMonthVariances,
  projectEndOfMonth,
  computeAnomalyScores,
  computeFixedVariableRatio,
  groupDailyTotals,
  FIXED_CATEGORIES
} from './expenseAnalyticsUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  depenses: Depenses[];
  dateRange: { start: Date; end: Date };
  categoryLabels: Record<Depenses['categorie'], string>;
  selectedCategory: string | null;
  onSelectCategory: (c: string | null) => void;
}

const numberFmt = (v: number) => v.toLocaleString('fr-FR');

// Heatmap mensuelle simple
const HeatmapMonth: React.FC<{ depenses: Depenses[]; anchor: Date; }> = ({ depenses, anchor }) => {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const next = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const monthItems = depenses.filter(d => {
    const t = new Date(d.createdAt).getTime();
    return t >= monthStart.getTime() && t < next.getTime();
  });
  const daily = groupDailyTotals(monthItems);
  const max = Math.max(...Object.values(daily), 0);
  const cells: Array<{ date: Date; key: string; amount: number }> = [];
  for (let d = new Date(monthStart); d < next; d.setDate(d.getDate()+1)) {
    const k = new Date(d);
    k.setHours(0,0,0,0);
    const key = k.toISOString().split('T')[0];
    cells.push({ date: new Date(k), key, amount: daily[key] || 0 });
  }
  const offset = (monthStart.getDay() + 6) % 7; // lundi=0
  const colorFor = (amt: number) => {
    if (amt === 0) return 'bg-gray-50';
    const r = amt / (max || 1);
    if (r < 0.25) return 'bg-red-100';
    if (r < 0.5) return 'bg-red-200';
    if (r < 0.75) return 'bg-red-300';
    return 'bg-red-400 text-white';
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Heatmap (mois)</h4>
        <span className="text-[10px] text-gray-500">Max: {numberFmt(max)} €</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-[10px]">
        {['L','M','M','J','V','S','D'].map(d => <div key={d} className="text-gray-400 text-center mb-1">{d}</div>)}
        {Array.from({ length: offset }).map((_,i)=><div key={'b'+i} />)}
        {cells.map(c => (
          <div key={c.key} title={`${c.date.toLocaleDateString('fr-FR')} • ${numberFmt(c.amount)} €`} className={`h-7 rounded flex items-center justify-center ${colorFor(c.amount)} transition-colors`}>{c.date.getDate()}</div>
        ))}
      </div>
    </div>
  );
};

// Camembert interactif drill-down
// const CategoryDrillPie: React.FC<{
//   depenses: Depenses[];
//   start: Date; end: Date;
//   categoryLabels: Record<Depenses['categorie'], string>;
//   active: string | null;
//   onSelect: (c: string | null)=>void;
// }> = ({ depenses, start, end, categoryLabels, active, onSelect }) => {
//   const filtered = depenses.filter(d => {
//     const t = new Date(d.createdAt).getTime();
//     return t >= start.getTime() && t <= end.getTime();
//   });
//   const byCat = filtered.reduce<Record<string, number>>((acc, d) => {
//     acc[d.categorie] = (acc[d.categorie] || 0) + d.montant; return acc;
//   }, {});
//   const labels = Object.keys(byCat);
//   const data = {
//     labels: labels.map(l => categoryLabels[l as keyof typeof categoryLabels] || l),
//     datasets: [{
//       data: labels.map(l => byCat[l]),
//       backgroundColor: [
//         '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
//         '#6366F1', '#8B5CF6', '#EC4899', '#6B7280'
//       ],
//       borderWidth: 1,
//       borderColor: '#fff'
//     }]
//   };
//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: { legend: { position: 'bottom' as const } },
//     // Typage léger (chart.js retourne éléments génériques)
//     onClick: (_: unknown, els: Array<{ index: number }>) => {
//       if (!els || !els.length) { onSelect(null); return; }
//       const idx = els[0].index;
//       const cat = labels[idx];
//       onSelect(active === cat ? null : cat);
//     }
//   };
//   return (
//     <div className="h-64 relative">
//       {active && <div className="absolute top-2 right-2 text-[10px] bg-white/80 backdrop-blur px-2 py-1 rounded border">Filtré: {categoryLabels[active as keyof typeof categoryLabels] || active}</div>}
//       <Pie data={data} options={options} />
//       <p className="text-[11px] text-center mt-2 text-gray-500">(Cliquer une catégorie pour filtrer)</p>
//     </div>
//   );
// };

export const AdvancedExpenseAnalytics: React.FC<Props> = ({ depenses, dateRange, categoryLabels }) => {
  // Mémoïsation des calculs
  const monthVariance = useMemo(() => computeMonthVariances(depenses, dateRange.start), [depenses, dateRange.start]);
  const projection = useMemo(() => projectEndOfMonth(depenses, dateRange.start), [depenses, dateRange.start]);
  const anomalyScores = useMemo(() => computeAnomalyScores(depenses), [depenses]);
  const fixedRatio = useMemo(() => computeFixedVariableRatio(depenses, dateRange.start), [depenses, dateRange.start]);

  // Top anomalies (|z| >= 2)
  const topAnomalies = useMemo(() => depenses
    .filter(d => Math.abs(anomalyScores[d._id]) >= 2)
    .sort((a,b) => Math.abs(anomalyScores[b._id]) - Math.abs(anomalyScores[a._id]))
    .slice(0,5), [depenses, anomalyScores]);

  const signClass = (v: number) => v > 0 ? 'text-red-600' : (v < 0 ? 'text-emerald-600' : 'text-gray-600');

//   const monthStart = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth(), 1);
//   const monthEnd = new Date(dateRange.start.getFullYear(), dateRange.start.getMonth() + 1, 1);

  return (
    <div className="grid grid-cols-1 2xl:grid-cols-5 gap-8">
      {/* Bloc variance & projection */}
      <div className="space-y-4 2xl:col-span-2">
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Variations mensuelles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500">Total mois courant</p>
              <p className="font-semibold">{numberFmt(monthVariance.current)} €</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Δ MoM</p>
              <p className={`font-semibold ${signClass(monthVariance.momDelta)}`}>{monthVariance.momDelta > 0 ? '+' : ''}{numberFmt(monthVariance.momDelta)} €</p>
              <p className={`text-[11px] ${signClass(monthVariance.momPct)}`}>{monthVariance.momPct>0?'+':''}{monthVariance.momPct.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Δ YoY</p>
              <p className={`font-semibold ${signClass(monthVariance.yoyDelta)}`}>{monthVariance.yoyDelta > 0 ? '+' : ''}{numberFmt(monthVariance.yoyDelta)} €</p>
              <p className={`text-[11px] ${signClass(monthVariance.yoyPct)}`}>{monthVariance.yoyPct>0?'+':''}{monthVariance.yoyPct.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Mois précédent</p>
              <p className="font-semibold">{numberFmt(monthVariance.previous)} €</p>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Projection fin de mois</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500">Total actuel</p>
                <p className="font-semibold">{numberFmt(projection.totalSoFar)} €</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Jours écoulés</p>
                <p className="font-semibold">{projection.elapsedDays}/{projection.totalDays}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projection moyenne</p>
                <p className="font-semibold">{numberFmt(projection.simpleAvg)} €</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Projection linéaire</p>
                <p className="font-semibold">{numberFmt(projection.linearFit)} €</p>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-100 h-2 rounded overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${Math.min(100, (projection.totalSoFar / (projection.simpleAvg || 1)) * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-gray-500">Barre = progression vs projection moyenne.</p>
        </div>
      </div>

      {/* Bloc catégories interactif */}
      {/* <div className="bg-white border rounded-xl p-5 shadow-sm 2xl:col-span-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Répartition & Drill-down</h3>
        <CategoryDrillPie
          depenses={depenses}
          start={monthStart}
            end={monthEnd}
          categoryLabels={categoryLabels}
          active={selectedCategory}
          onSelect={onSelectCategory}
        />
      </div> */}

      {/* Bloc ratios */}
      <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4 2xl:col-span-1">
        <h3 className="text-sm font-semibold text-gray-700">Fixes vs Variables</h3>
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-xs text-gray-500">Fixes</p>
            <p className="font-semibold">{numberFmt(fixedRatio.fixedTotal)} €</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Variables</p>
            <p className="font-semibold">{numberFmt(fixedRatio.variableTotal)} €</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ratio fixes</p>
            <p className="font-semibold">{fixedRatio.fixedRatio.toFixed(1)}%</p>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded overflow-hidden flex">
          <div className="bg-red-500" style={{ width: `${fixedRatio.fixedRatio}%` }} />
          <div className="bg-emerald-500" style={{ width: `${100-fixedRatio.fixedRatio}%` }} />
        </div>
        <p className="text-[11px] text-gray-500">Catégories fixes: {Array.from(FIXED_CATEGORIES).join(', ')}</p>
        <HeatmapMonth depenses={depenses} anchor={dateRange.start} />
      </div>

      {/* Bloc anomalies */}
      <div className="bg-white border rounded-xl p-5 shadow-sm 2xl:col-span-1">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Anomalies (|z| ≥ 2)</h3>
        {topAnomalies.length === 0 && <p className="text-xs text-gray-400">Aucune anomalie détectée.</p>}
        <ul className="space-y-2 max-h-64 overflow-auto pr-1">
          {topAnomalies.map(d => {
            const z = anomalyScores[d._id];
            return (
              <li key={d._id} className="p-2 rounded border border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700">{d.title || categoryLabels[d.categorie]}</span>
                  <span className="text-[10px] text-gray-500">{new Date(d.createdAt).toLocaleDateString('fr-FR')} · {categoryLabels[d.categorie]}</span>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-semibold">{numberFmt(d.montant)} €</p>
                  <p className={`text-[10px] ${Math.abs(z) >= 2 ? 'text-red-600' : 'text-gray-400'}`}>z={z.toFixed(2)}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-[10px] text-gray-400">Méthode simple: z-score sur historique global par catégorie.</p>
      </div>
    </div>
  );
};

export default AdvancedExpenseAnalytics;
