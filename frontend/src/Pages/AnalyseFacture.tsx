import React, { useMemo, useState } from 'react';
import { useGetFactures } from '../Hooks/useFacture';
import type { Facture } from '../Types/facture';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';

// Couleurs simples pour catégories
const COLORS = ['#2563eb', '#db2777', '#059669', '#f59e0b', '#7c3aed', '#dc2626', '#475569'];

const AnalyseFacture: React.FC = () => {
  const { data: factures = [], isLoading } = useGetFactures();

  const [year, setYear] = useState<string>('all');
  const [month, setMonth] = useState<string>('all');

  const filtered = useMemo(() => {
    return factures.filter((f: Facture) => {
      const d = new Date(f.createdAt);
      const y = d.getFullYear().toString();
      const m = (d.getMonth()+1).toString().padStart(2,'0');
      return (year === 'all' || y === year) && (month === 'all' || m === month);
    });
  }, [factures, year, month]);

  const byCategorie = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((f: Facture) => { map[f.categorie] = (map[f.categorie] || 0) + f.montant; });
    return Object.entries(map).map(([categorie, total]) => ({ categorie, total }));
  }, [filtered]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((f: Facture) => { map[f.status] = (map[f.status] || 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [filtered]);

  const monthly = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((f: Facture) => {
      const d = new Date(f.createdAt);
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}`;
      map[key] = (map[key] || 0) + f.montant;
    });
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b)).map(([month,total]) => ({ month, total }));
  }, [filtered]);

  // Temps moyen de paiement (en jours) : factures Payées seulement
  const delaiPaiement = useMemo(() => {
  const samples = filtered.filter((f: Facture) => f.status === 'Payée' && f.paidAt).map((f: Facture) => {
      const dE = new Date(f.dateEcheance).getTime();
      const dP = new Date(f.paidAt as string).getTime();
      return (dP - dE) / 86400000; // jours
    });
    if (!samples.length) return { avg: 0, min: 0, max: 0 };
  const avg = samples.reduce((s: number, v: number)=>s+v,0)/samples.length;
    return { avg, min: Math.min(...samples), max: Math.max(...samples) };
  }, [filtered]);

  // Segmentation récurrent vs non récurrent
  const segmentationRecurrent = useMemo(() => {
  const rec = filtered.filter((f: Facture) => f.recurrent).length;
    const non = filtered.length - rec;
    return [
      { type: 'Récurrentes', count: rec },
      { type: 'Ponctuelles', count: non }
    ];
  }, [filtered]);

  // Heatmap catégories par statut (simple conversion en tableau)
  const heatmapData = useMemo(() => {
  const catSet = new Set(filtered.map((f: Facture) => f.categorie));
    const statusList: Facture['status'][] = ['En_attente','En_retard','Payée'];
    const rows = Array.from(catSet.values()).map((c) => {
      const categorie = String(c);
      const row: Record<string, number | string> = { categorie };
      statusList.forEach((s: Facture['status']) => { row[s] = filtered.filter((f: Facture) => f.categorie === c && f.status === s).length; });
      return row;
    });
    return { statusList, rows };
  }, [filtered]);

  const exportCSV = () => {
    const headers = ['Titre','Catégorie','Montant','Statut','Echéance','Créée','Payée'];
  const lines = filtered.map((f: Facture) => [f.title, f.categorie, f.montant, f.status, f.dateEcheance, f.createdAt, f.paidAt||''].join(';'));
    const blob = new Blob([headers.join(';')+'\n'+lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'factures.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Rapport Factures', 14, 16);
    doc.setFontSize(10);
  filtered.slice(0,40).forEach((f: Facture, idx: number) => {
      const y = 26 + idx * 5;
      if (y > 280) return; // simple cutoff
      doc.text(`${f.title.substring(0,25)} | ${f.categorie} | ${f.montant}€ | ${f.status}`, 14, y);
    });
    doc.save('factures.pdf');
  };

  const totalMontant = filtered.reduce((s: number, f: Facture) => s + f.montant, 0);
  const totalPayees = filtered.filter((f: Facture) => f.status === 'Payée').length;
  const totalRetard = filtered.filter((f: Facture) => f.status === 'En_retard').length;
  const tauxRetard = filtered.length ? (totalRetard / filtered.length * 100).toFixed(1) : '0';
  const tauxPaiement = filtered.length ? (totalPayees / filtered.length * 100).toFixed(1) : '0';

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Analyse des Factures</h1>
        <div className="flex flex-wrap gap-2">
          <select value={year} onChange={e=>setYear(e.target.value)} className="border px-2 py-1 rounded text-sm">
            <option value="all">Année: Toutes</option>
            {Array.from(new Set(factures.map((f: Facture)=> new Date(f.createdAt).getFullYear())))
              .map(y => Number(y))
              .sort((a,b)=>a-b)
              .map((y: number) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="border px-2 py-1 rounded text-sm">
            <option value="all">Mois: Tous</option>
            {[...Array(12)].map((_,i)=>{
              const m = (i+1).toString().padStart(2,'0');
              return <option key={m} value={m}>{m}</option>;
            })}
          </select>
          <button onClick={exportCSV} className="text-sm px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">Export CSV</button>
          <button onClick={exportPDF} className="text-sm px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700">Export PDF</button>
          <a href="/factures" className="text-sm px-4 py-1 rounded bg-gray-200 hover:bg-gray-300">Retour</a>
        </div>
      </div>
      {isLoading ? <p>Chargement...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Total factures</p>
              <p className="text-xl font-semibold">{filtered.length}</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Montant cumulé</p>
              <p className="text-xl font-semibold">{totalMontant.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Taux paiement</p>
              <p className="text-xl font-semibold">{tauxPaiement}%</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Taux retard</p>
              <p className="text-xl font-semibold">{tauxRetard}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Délai moyen paiement (jours)</p>
              <p className="text-xl font-semibold">{delaiPaiement.avg.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">Min {delaiPaiement.min.toFixed(1)} | Max {delaiPaiement.max.toFixed(1)}</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Récurrentes</p>
              <p className="text-xl font-semibold">{segmentationRecurrent.find(s=>s.type==='Récurrentes')?.count}</p>
            </div>
            <div className="p-4 bg-white rounded shadow-sm border">
              <p className="text-xs text-gray-500">Ponctuelles</p>
              <p className="text-xl font-semibold">{segmentationRecurrent.find(s=>s.type==='Ponctuelles')?.count}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-4 rounded shadow-sm border col-span-1">
              <h2 className="font-semibold mb-2">Répartition par statut</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                    {byStatus.map((entry, idx) => <Cell key={entry.status} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border col-span-1">
              <h2 className="font-semibold mb-2">Montant par catégorie</h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byCategorie} dataKey="total" nameKey="categorie" outerRadius={90} label>
                    {byCategorie.map((entry, idx) => <Cell key={entry.categorie} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border col-span-1 lg:col-span-1">
              <h2 className="font-semibold mb-2">Montants mensuels</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-4 rounded shadow-sm border col-span-1 lg:col-span-3">
              <h2 className="font-semibold mb-2">Heatmap Catégories / Statuts</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 text-left">Catégorie</th>
                      {heatmapData.statusList.map(s => (
                        <th key={s} className="px-2 py-1 text-left">{s}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmapData.rows.map(r => (
                      <tr key={r.categorie} className="border-t">
                        <td className="px-2 py-1 font-medium">{r.categorie}</td>
                        {heatmapData.statusList.map(s => {
                          const valRaw = r[s];
                          const val = typeof valRaw === 'number' ? valRaw : 0;
                          const intensity = Math.min(1, val / 10);
                          const bg = `rgba(37,99,235,${0.15 + intensity * 0.5})`;
                          return <td key={s} className="px-2 py-1" style={{ background: val ? bg : 'transparent' }}>{val}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyseFacture;