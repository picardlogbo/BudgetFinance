
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, PiggyBank, Receipt, ArrowLeft, AlertTriangle } from "lucide-react";
// import type { Budget as BackendBudget } from "../Types/budget"; // backend-aligned shape (simplified frontend version)
import type { Depenses } from "../Types/depense";
import { useCreateBudget, useGetBudget } from "../Hooks/useBudjet";
import type { BudgetFormValues } from "../API/API-Budgets";
import { useGetDepenses } from "../Hooks/useDepense";
import type {Budgets} from "../Types/budget";
import { useAppContext } from "../Utils/AppContextUtils";

/**
 * Frontend UI model enrichie : ajoute un id local (string) & isActive (par défaut true)
 * Le backend renverra _id, montantAlloue, montantDepense, categorie, mois, annee
 */
// interface BudgetUI extends BackendBudget {
//   id: string; // identifiant (simule _id Mongo -> string)
//   isActive: boolean;
// }

// interface BudgetFormValues {
//   categorie: string;
//   montantAlloue: number;
//   mois: number;
//   annee: number;
// }

// Catégories (alignées avec le modèle backend - majuscules)
const BUDGET_CATEGORIES: string[] = [
  "Transport",
  "Factures",
  "Loyer",
  "Loisirs",
  "Alimentation",
  "Santé",
  "Éducation",
  "Autre",
];

const now = new Date();

const BudgetPage: React.FC = () => {
  // Etat budgets et dépenses (placeholder local pour démarrer)
  // const [budgets, setBudgets] = useState<BudgetUI[]>([]);
  // const [expenses] = useState<Depenses[]>([]); // placeholder dépenses (remplacer par fetch API)
  const [showForm, setShowForm] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<number>(now.getMonth() + 1); // 1..12
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
  // Option d'affichage: filtrer uniquement les budgets en dépassement
  const [showOnlyOverspent, setShowOnlyOverspent] = useState<boolean>(false);

  const createBudget = useCreateBudget();
  // Hooks pour gestion des budgets
  const {data : budgets = []} = useGetBudget();
  // Hooks pour gestion des dépenses
  const {data : depenses = []} = useGetDepenses();
  const { showToast } = useAppContext();

  // Hooks pour gestion du formulaire avec react-hook-form

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BudgetFormValues>({
    defaultValues: {
      categorie: "Autre",
      montantAlloue: 0,
      montantDepense: 0,
      mois: now.getMonth() + 1,
      annee: now.getFullYear(),
    }
  });

  // Ajout budget (local). Plus tard : remplacer par POST /budget
  // const onAddBudget = (data: BudgetFormValues) => {
  //   // Sécuriser les conversions (react-hook-form renvoie string si pas de valueAsNumber)
  //   const montantAlloue = Number(data.montantAlloue) || 0;
  //   const mois = Number(data.mois);
  //   const annee = Number(data.annee);
  //   const newBudget: BudgetUI = {
  //     id: crypto.randomUUID(),
  //     user: "current-user-id",
  //     categorie: data.categorie,
  //     montantAlloue,
  //     montantDepense: 0,
  //     mois,
  //     annee,
  //     isActive: true
  //   };
  //   // Debug temporaire (à retirer si besoin)
  //   console.log("[ADD_BUDGET]", newBudget);
  //   setBudgets(prev => [newBudget, ...prev]);
  //   reset({ categorie: "Autre", montantAlloue: 0, mois: filterMonth, annee: filterYear });
  //   setShowForm(false);
  // };

    const onSubmit = (data: BudgetFormValues) => {
           // envoi vers l’API
          createBudget.mutate(data);
          setShowForm(false);
      };

  // Budgets filtrés par période sélectionnée (puis optionnellement par dépassement)
  // On calcule en deux temps pour pouvoir afficher un bandeau d'alerte basé sur TOUS les budgets de la période,
  // même si l'utilisateur active ensuite le filtre "voir budgets dépassés".
  const periodBudgets = useMemo(
    () => budgets.filter((b: Budgets) => b.mois === filterMonth && b.annee === filterYear),
    [budgets, filterMonth, filterYear]
  );
  const overspentCount = useMemo(
    () => periodBudgets.filter((b: Budgets) => b.montantAlloue < b.montantDepense).length,
    [periodBudgets]
  );
  // Seuil d'alerte préventif (80%)
  const ALERT_THRESHOLD = 0.8;

  // Détection d'un passage en dépassement: toast dès qu'un budget passe >100% (évite le toast à l'initialisation)
  const prevOverspentRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef<boolean>(false);
  useEffect(() => {
    const currentOverspent = new Set<string>(
      periodBudgets
        .filter((b: Budgets) => b.montantDepense > b.montantAlloue)
        .map((b: Budgets) => b._id)
    );
    if (!initializedRef.current) {
      prevOverspentRef.current = currentOverspent;
      initializedRef.current = true;
      return;
    }
    const prev = prevOverspentRef.current;
    const newlyOverspentIds: string[] = [];
    currentOverspent.forEach((id) => { if (!prev.has(id)) newlyOverspentIds.push(id); });
    if (newlyOverspentIds.length > 0) {
      showToast({ type: 'ERROR', message: newlyOverspentIds.length === 1 ? 'Un budget vient de passer en dépassement.' : `${newlyOverspentIds.length} budgets viennent de passer en dépassement.` });
    }
    prevOverspentRef.current = currentOverspent;
  }, [periodBudgets, showToast]);

  // Réinitialiser la détection lors d'un changement de période sélectionnée
  useEffect(() => {
    initializedRef.current = false;
    prevOverspentRef.current = new Set<string>();
  }, [filterMonth, filterYear]);

  // Ouvre le formulaire avec les valeurs du budget à ajuster
  const adjustBudget = (b: Budgets) => {
    setShowForm(true);
    reset({ categorie: b.categorie, montantAlloue: b.montantAlloue, mois: b.mois, annee: b.annee });
    // Scroll vers le haut vers le formulaire
  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { /* ignore scroll errors */ }
  };
  const filteredBudgets = useMemo(
    () => showOnlyOverspent
      ? periodBudgets.filter((b: Budgets) => b.montantAlloue < b.montantDepense)
      : periodBudgets,
    [periodBudgets, showOnlyOverspent]
  );

  // Agrégation pour total période
  // Totaux basés sur les budgets affichés (si "voir dépassés" actif, ces totaux se basent sur le sous-ensemble visible)
  const totalAllocated = useMemo(() => filteredBudgets.reduce((s: number, b: Budgets) => s + b.montantAlloue, 0), [filteredBudgets]);
  const totalSpent = useMemo(() => filteredBudgets.reduce((s: number, b: Budgets) => s + b.montantDepense, 0), [filteredBudgets]);

  // Dépenses liées au budget sélectionné (dans un vrai flux -> GET /depenses?budget=ID)
  const selectedBudget = useMemo(() => filteredBudgets.find((b: Budgets) => b._id === selectedBudgetId) || null, [filteredBudgets, selectedBudgetId]);
  const expensesForBudget = useMemo(() => {
    if (!selectedBudget) return [];
    // IMPORTANT: Nous n'affichons PAS les dépenses archivées dans la liste
    // mais elles DOIVENT compter dans le total du budget du mois (géré côté backend via 'montantDepense').
    // Ici on filtre donc explicitement 'isArchived !== true'.
    return depenses.filter((e: Depenses) => {
      // Suppose qu'on stockera plus tard e.budgetId; pour le moment on simule par catégorie + mois/année
      const d = new Date(e.createdAt);
      const dMonth = d.getMonth() + 1;
      const dYear = d.getFullYear();
      const sameBucket = e.categorie === selectedBudget.categorie && dMonth === selectedBudget.mois && dYear === selectedBudget.annee;
      const notArchived = e.isArchived !== true; // ← exclusion des archivées de l'affichage
      return sameBucket && notArchived;
    });
  }, [depenses, selectedBudget]);

  // UI helpers -------------------------------------------------------------
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  // Petite fonction de rendu progress ring (CSS conic-gradient)
  const ProgressRing: React.FC<{ percent: number; size?: number; colorClass?: string; label?: string; }> = ({ percent, size = 130, colorClass = "#2563eb", label }) => {
    const p = Math.min(100, Math.max(0, percent));
    const background = `conic-gradient(${colorClass} ${p}%, #e5e7eb ${p}% 100%)`;
    return (
      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <div className="rounded-full" style={{ width: size, height: size, background }} />
        <div className="absolute text-center">
          <div className="text-sm font-semibold">{p.toFixed(0)}%</div>
          {label && <div className="text-[10px] text-gray-500 mt-1 max-w-[90px] leading-tight">{label}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header + filtres */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><PiggyBank className="w-6 h-6 text-blue-600" /> Budgets</h2>
          <p className="text-gray-600 mt-1 text-sm">Suivi des allocations et dépenses par période.</p>
          <div className="flex gap-3 mt-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Mois</label>
              <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
                {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Année</label>
              <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Filtre optionnel: voir uniquement les budgets dépassés */}
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2 text-xs text-gray-600 mb-[6px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  checked={showOnlyOverspent}
                  onChange={e => setShowOnlyOverspent(e.target.checked)}
                />
                Voir budgets dépassés
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-end gap-6">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gray-500">Total alloué</p>
            <p className="text-lg font-semibold text-gray-900">{totalAllocated.toLocaleString("fr-FR")} €</p>
            <p className="text-xs text-gray-500 mt-1">Dépensé : <span className={`font-medium ${totalSpent > totalAllocated ? "text-red-600" : "text-blue-600"}`}>{totalSpent.toLocaleString("fr-FR")}</span> €</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg shadow text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Nouveau budget
          </button>
        </div>
      </div>

      {/* Bandeau d'alerte si au moins un budget est dépassé sur la période sélectionnée */}
      {overspentCount > 0 && (
        <div className="flex items-start gap-3 p-3 rounded-lg border bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="w-5 h-5 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Attention: {overspentCount} budget(s) dépassé(s) pour {filterMonth}/{filterYear}.</p>
            <p className="text-xs opacity-90">Activez le filtre « Voir budgets dépassés » pour les lister en priorité.</p>
          </div>
        </div>
      )}

      {/* Formulaire de création */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Créer un budget</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Catégorie</label>
              <select {...register("categorie", { required: true })} className="w-full border rounded-lg px-3 py-2 text-sm">
                {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Montant alloué (€)</label>
              <input type="number" step="0.01" {...register("montantAlloue", { required: true, min: 0, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              {errors.montantAlloue && <p className="text-xs text-red-600 mt-1">Montant invalide</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mois</label>
              <input type="number" {...register("mois", { required: true, min: 1, max: 12, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Année</label>
              <input type="number" {...register("annee", { required: true, min: 1970, valueAsNumber: true })} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-4 flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium">Enregistrer</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg text-sm">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Cartes budgets */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBudgets.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed rounded-xl bg-gray-50">
            <p className="text-gray-500 text-sm">Aucun budget pour cette période.</p>
          </div>
        )}
        {filteredBudgets.map((b: Budgets) => {
          const percent = b.montantAlloue > 0 ? (b.montantDepense / b.montantAlloue) * 100 : 0;
          const over = percent > 100;
          const nearOver = !over && b.montantAlloue > 0 && (b.montantDepense / b.montantAlloue) >= ALERT_THRESHOLD;
          return (
            <div
              key={b._id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedBudgetId(b._id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedBudgetId(b._id); }}
              className={`relative group bg-white border rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow transition ${selectedBudgetId === b._id ? "ring-2 ring-blue-500" : ""} ${over ? "border-red-200" : nearOver ? "border-orange-200" : ""}`}
              aria-label={`Budget ${b.categorie} ${b.mois}/${b.annee}${over ? " en dépassement" : nearOver ? " proche du dépassement" : ""}`}
            >
              {/* Pastille d'alerte discrète si dépassement */}
              {over && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white items-center justify-center text-[10px]" title="Dépassement">
                    !
                  </span>
                </span>
              )}
              {/* Signal préventif orange si >80% */}
              {!over && nearOver && (
                <span className="absolute top-2 right-2 text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Alerte</span>
              )}
              <ProgressRing percent={percent} label={b.categorie} colorClass={over ? "#dc2626" : nearOver ? "#ea580c" : "#2563eb"} />
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-900">{b.categorie}</p>
                <p className="text-xs text-gray-500">{b.mois}/{b.annee}</p>
              </div>
              <div className="flex gap-6 text-xs mt-1">
                <div className="text-gray-600"><span className="block font-medium text-gray-900">{b.montantAlloue.toLocaleString("fr-FR")} €</span>Alloué</div>
                <div className={`${over ? "text-red-600" : nearOver ? "text-orange-600" : "text-gray-600"}`}>
                  <span className={`block font-medium ${over ? "text-red-600" : nearOver ? "text-orange-600" : "text-gray-900"}`}>{b.montantDepense.toLocaleString("fr-FR")} €</span>
                  Dépensé
                </div>
              </div>
              {over && <span className="absolute top-2 right-2 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Dépassement</span>}
              {/* Bouton d'action pour ouvrir le formulaire pré-rempli */}
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); adjustBudget(b); }}
                  className="px-3 py-1.5 rounded-md text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                >
                  Ajuster budget
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panneau détails / dépenses du budget sélectionné */}
      {selectedBudget && (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedBudgetId(null)} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"><ArrowLeft className="w-3 h-3" /> Retour</button>
            <h3 className="text-lg font-semibold">Dépenses - {selectedBudget.categorie} ({selectedBudget.mois}/{selectedBudget.annee})</h3>
          </div>
          {expensesForBudget.length === 0 ? (
            <div className="text-sm text-gray-500 flex items-center gap-2"><Receipt className="w-4 h-4 text-gray-400" /> Aucune dépense enregistrée pour ce budget.</div>
          ) : (
            <ul className="divide-y text-sm">
              {expensesForBudget.map((e: Depenses) => (
                <li key={e._id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-800">{e.title}</p>
                    <p className="text-xs text-gray-500">{new Date(e.createdAt).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{e.montant.toLocaleString("fr-FR")} €</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;
