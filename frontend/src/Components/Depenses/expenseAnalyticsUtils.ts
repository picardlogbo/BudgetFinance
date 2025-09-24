// ============================================================================
// 🔧 Utils analytiques pour les dépenses
// ============================================================================
import type { Depenses } from "../../Types/depense";

// Catégories considérées comme fixes (personnalisable)
export const FIXED_CATEGORIES = new Set<Depenses['categorie']>([
  'Loyer', 'Factures', 'Éducation'
]);

// Regroupe les montants par jour (clé ISO YYYY-MM-DD)
export const groupDailyTotals = (depenses: Depenses[]) => {
  return depenses.reduce<Record<string, number>>((acc, d) => {
    const dateObj = new Date(d.createdAt);
    dateObj.setHours(0,0,0,0);
    const key = dateObj.toISOString().split('T')[0];
    acc[key] = (acc[key] || 0) + d.montant;
    return acc;
  }, {});
};

// Somme filtrée sur intervalle [start, end[
const sumInRange = (depenses: Depenses[], start: Date, end: Date) => {
  const s = start.getTime();
  const e = end.getTime();
  return depenses.reduce((tot, d) => {
    const t = new Date(d.createdAt).getTime();
    if (t >= s && t < e) return tot + d.montant; return tot;
  }, 0);
};

// Résultat des variations mensuelles et annuelles

export interface MonthVarianceResult {
  current: number; previous: number; lastYear: number;
  momDelta: number; momPct: number; yoyDelta: number; yoyPct: number;
}

// Calcul des variations mensuelles (MoM) et annuelles (YoY) pour un mois donné
export const computeMonthVariances = (depenses: Depenses[], anchor: Date): MonthVarianceResult => {
  const curStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const nextCur = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const prevStart = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
  const prevEnd = curStart;
  const lastYearStart = new Date(anchor.getFullYear() - 1, anchor.getMonth(), 1);
  const lastYearEnd = new Date(anchor.getFullYear() - 1, anchor.getMonth() + 1, 1);
  const cur = sumInRange(depenses, curStart, nextCur);
  const prev = sumInRange(depenses, prevStart, prevEnd);
  const lastYear = sumInRange(depenses, lastYearStart, lastYearEnd);
  const pct = (base: number, now: number) => base === 0 ? (now > 0 ? 100 : 0) : ((now - base) / base) * 100;
  return {
    current: cur,
    previous: prev,
    lastYear,
    momDelta: cur - prev,
    momPct: pct(prev, cur),
    yoyDelta: cur - lastYear,
    yoyPct: pct(lastYear, cur)
  };
};
// Résultat de projection
export interface ProjectionResult {
  simpleAvg: number; linearFit: number; totalSoFar: number; elapsedDays: number; totalDays: number;
}

// Projection de fin de mois basée sur les dépenses jusqu'à la date d'ancrage
export const projectEndOfMonth = (depenses: Depenses[], anchor: Date): ProjectionResult => {
  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const nextMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
  const totalDays = Math.round((nextMonth.getTime() - monthStart.getTime()) / 86400000);
  const inMonth = depenses.filter(d => {
    const t = new Date(d.createdAt).getTime();
    return t >= monthStart.getTime() && t < nextMonth.getTime();
  });
  if (!inMonth.length) {
    return { simpleAvg: 0, linearFit: 0, totalSoFar: 0, elapsedDays: 0, totalDays };
  }
  const byDay = groupDailyTotals(inMonth);
  const sorted = Object.keys(byDay).sort();
  const elapsedDays = sorted.length;
  let running = 0;
  const cumulative: Array<{ dayIndex: number; value: number }> = [];
  sorted.forEach((k, i) => { running += byDay[k]; cumulative.push({ dayIndex: i+1, value: running }); });
  const totalSoFar = running;
  const simpleAvg = (totalSoFar / elapsedDays) * totalDays;
  // régression linéaire y = a x + b
  const n = cumulative.length;
  let sumX=0,sumY=0,sumXY=0,sumX2=0;
  cumulative.forEach(p=>{ sumX+=p.dayIndex; sumY+=p.value; sumXY+=p.dayIndex*p.value; sumX2+=p.dayIndex*p.dayIndex; });
  const denom = (n * sumX2 - sumX * sumX) || 1;
  const a = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - a * sumX) / n;
  const linearFit = a * totalDays + b;
  return { simpleAvg, linearFit, totalSoFar, elapsedDays, totalDays };
};

export interface AnomalyScores { [id: string]: number; }
// Score d'anomalie par dépense (écart type par rapport à la moyenne de la catégorie)
export const computeAnomalyScores = (depenses: Depenses[]): AnomalyScores => {
  const byCat: Record<string, number[]> = {};
  depenses.forEach(d => { (byCat[d.categorie] ||= []).push(d.montant); });
  const stats: Record<string, { mean: number; std: number }> = {};
  Object.entries(byCat).forEach(([cat, arr]) => {
    const mean = arr.reduce((s,v)=>s+v,0) / arr.length;
    const variance = arr.reduce((s,v)=>s + (v-mean)**2,0) / (arr.length || 1);
    stats[cat] = { mean, std: Math.sqrt(variance) };
  });
  const scores: AnomalyScores = {};
  depenses.forEach(d => {
    const st = stats[d.categorie];
    if (!st || st.std === 0) scores[d._id] = 0; else scores[d._id] = (d.montant - st.mean)/st.std;
  });
  return scores;
};

// Ratio dépenses fixes vs variables pour un mois donné
export interface FixedVariableRatioResult { fixedTotal: number; variableTotal: number; fixedRatio: number; }

// Ratio dépenses fixes vs variables pour un mois donné
export const computeFixedVariableRatio = (depenses: Depenses[], monthAnchor: Date): FixedVariableRatioResult => {
  const m = monthAnchor.getMonth();
  const y = monthAnchor.getFullYear();
  const monthExpenses = depenses.filter(d => {
    const dt = new Date(d.createdAt);
    return dt.getMonth() === m && dt.getFullYear() === y;
  });
  const fixedTotal = monthExpenses.filter(d => FIXED_CATEGORIES.has(d.categorie)).reduce((s,d)=>s+d.montant,0);
  const total = monthExpenses.reduce((s,d)=>s+d.montant,0);
  const variableTotal = total - fixedTotal;
  const fixedRatio = (fixedTotal / (total || 1)) * 100;
  return { fixedTotal, variableTotal, fixedRatio };
};
