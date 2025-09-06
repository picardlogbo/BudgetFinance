import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, AlertCircle, Calendar } from 'lucide-react';
// import { Revenue, Expense, Bill, SavingGoal } from '../types/budget';
import type { Revenu } from '../Types/revenus';
import type { Depenses } from '../Types/depense';
import type { Facture } from '../Types/facture';
import type { Epargne } from '../Types/Epargne';
import { useGetEpargne } from '../Hooks/useEpargne';
import { useGetFactures } from '../Hooks/useFacture';
import { useGetDepenses } from '../Hooks/useDepense';
import { useGetRevenus } from '../Hooks/useRevenu';

// interface DashboardProps {
//   revenus: Revenu[];
//   depenses: Depenses[];
//   factures: Facture[];
//   savings: Epargne[];
// }

export const Dashboard: React.FC = () => {
  const {data: revenus = []} = useGetRevenus();
  const {data: depenses = []} = useGetDepenses();
  const {data: factures = []} = useGetFactures();
  const {data: savings = []} = useGetEpargne(); 
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRevenue = revenus
    .filter((r: Revenu) => new Date(r.date).getMonth() === currentMonth && new Date(r.date).getFullYear() === currentYear)
    .reduce((sum: number, r: Revenu) => sum + r.montant, 0);

  const monthlyExpenses = depenses
    .filter((e: Depenses) => new Date(e.createdAt).getMonth() === currentMonth && new Date(e.createdAt).getFullYear() === currentYear)
    .reduce((sum: number, e: Depenses) => sum + e.montant, 0);

  const Factures_En_Attente = factures.filter((f: Facture) => f.status === 'En_attente');
  const Factures_En_Retard = factures.filter((f: Facture) => f.status === 'En_retard');

  const totalSavings = savings.reduce((sum: number, s: Epargne) => sum + s.currentAmount, 0);
  // const savingsGoals = savings.reduce((sum: number, s: Epargne) => sum + s.targetAmount, 0);

  const balance = monthlyRevenue - monthlyExpenses;
  // const savingsRate = monthlyRevenue > 0 ? (totalSavings / monthlyRevenue) * 100 : 0;

  //calcul revenus et depenses du mois passé

 // Date actuelle
const today = new Date();

// Trouver le mois précédent
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

// Revenus du mois dernier
const lastMonthRevenue = revenus
  .filter((r: Revenu) => {
    const d = new Date(r.date);
    return (
      d.getMonth() === lastMonth.getMonth() &&
      d.getFullYear() === lastMonth.getFullYear()
    );
  })
  .reduce((sum: number, r: Revenu) => sum + r.montant, 0);

// Dépenses du mois dernier
const lastMonthExpenses = depenses
  .filter((e: Depenses) => {
    const d = new Date(e.createdAt);
    return (
      d.getMonth() === lastMonth.getMonth() &&
      d.getFullYear() === lastMonth.getFullYear()
    );
  })
  .reduce((sum: number, e: Depenses) => sum + e.montant, 0);

  // Calcul des tendances
  const revenueTrend = lastMonthRevenue > 0 
  ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
  : 0;

const expensesTrend = lastMonthExpenses > 0 
  ? ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
  : 0;

  const StatCard = ({ title, value, icon: Icon, color, trend }: { title: string; value: number; icon: React.ElementType; color: string; trend?: number }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {typeof value === 'number' ? `${value.toLocaleString('fr-FR')} €` : value}
          </p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              {Math.abs(trend)}% vs mois dernier
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color === 'text-green-600' ? 'bg-green-100' : color === 'text-red-600' ? 'bg-red-100' : 'bg-blue-100'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">Aperçu de votre situation financière ce mois-ci</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus ce mois"
          value={monthlyRevenue}
          icon={TrendingUp}
          color="text-green-600"
          trend={parseFloat(revenueTrend.toFixed(1))}

          // trend={5.2}
        />
        <StatCard
          title="Dépenses ce mois"
          value={monthlyExpenses}
          icon={TrendingDown}
          color="text-red-600"
          trend={parseFloat(expensesTrend.toFixed(1))}
          // trend={-2.1}
        />
        <StatCard
          title="Solde disponible"
          value={balance}
          icon={Wallet}
          color={balance >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Épargne totale"
          value={totalSavings}
          icon={Target}
          color="text-blue-600"
        />
      </div>

      {/* Alerts & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Alertes & Rappels
          </h3>
          <div className="space-y-3">
            {Factures_En_Retard.length > 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-red-800">
                    {Factures_En_Retard.length} facture(s) en retard
                  </p>
                  <p className="text-sm text-red-600">
                    Total: {Factures_En_Retard.reduce((sum: number, bill: Facture) => sum + bill.montant, 0).toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
            )}
            {Factures_En_Attente.length > 0 && (
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-orange-800">
                    {Factures_En_Attente.length} facture(s) à payer
                  </p>
                  <p className="text-sm text-orange-600">
                    Total: {Factures_En_Attente.reduce((sum: number, bill: Facture) => sum + bill.montant, 0).toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
            )}
            {balance < 0 && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="font-medium text-red-800">Budget dépassé</p>
                  <p className="text-sm text-red-600">
                    Déficit de {Math.abs(balance).toLocaleString('fr-FR')} € ce mois
                  </p>
                </div>
              </div>
            )}
            {Factures_En_Retard.length === 0 && Factures_En_Attente.length === 0 && balance >= 0 && (
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-5 h-5 bg-green-500 rounded-full mr-3"></div>
                <p className="font-medium text-green-800">Tout va bien ! Aucune alerte active.</p>
              </div>
            )}
          </div>
        </div>

        {/* Savings Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Objectifs d'épargne</h3>
          <div className="space-y-4">
            {savings.slice(0, 3).map((goal: Epargne) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal._id}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">{goal.name}</p>
                    <p className="text-sm text-gray-500">{progress.toFixed(1)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {goal.currentAmount.toLocaleString('fr-FR')} € / {goal.targetAmount.toLocaleString('fr-FR')} €
                  </p>
                </div>
              );
            })}
            {savings.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                Aucun objectif d'épargne défini
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des dépenses ce mois</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Alimentation', 'Transport', 'Logement', 'Loisirs', 'Factures'].map((category) => {
            const categoryExpenses = depenses
              .filter((e: Depenses) => e.categorie === category && new Date(e.createdAt).getMonth() === currentMonth)
              .reduce((sum: number, e: Depenses) => sum + e.montant, 0);

            const categoryLabels: Record<string, string> = {
              Alimentation: 'Alimentation',
              Transport: 'Transport',
              Logement: 'Logement',
              Loisirs: 'Loisirs',
              Factures: 'Factures'
            };

            return (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">{categoryLabels[category]}</p>
                <p className="text-xl font-bold text-gray-900">{categoryExpenses.toLocaleString('fr-FR')} €</p>
                <p className="text-xs text-gray-500 mt-1">
                  {monthlyExpenses > 0 ? ((categoryExpenses / monthlyExpenses) * 100).toFixed(1) : 0}% du total
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};