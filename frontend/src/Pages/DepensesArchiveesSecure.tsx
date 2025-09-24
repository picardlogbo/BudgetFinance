import React, { useState } from 'react';
import { useGetArchivedDepensesSecure, useUnarchiveDepense } from '../Hooks/useDepense';
import type { Depenses } from '../Types/depense';
import { Lock, ArchiveRestore, RefreshCw } from 'lucide-react';
import { useAppContext } from '../Utils/AppContextUtils';

const DepensesArchiveesSecure: React.FC = () => {
  const [entered, setEntered] = useState(false);
  const [password, setPassword] = useState('');
  const [submittedPwd, setSubmittedPwd] = useState('');
  const { showToast } = useAppContext();
  const { data: archived = [], isLoading, isError, refetch } = useGetArchivedDepensesSecure(submittedPwd);
  const unarchiveMut = useUnarchiveDepense();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmittedPwd(password);
    setEntered(true);
  };

  const handleUnarchive = (id: string) => {
    if(!submittedPwd) return;
    unarchiveMut.mutate({ id, password: submittedPwd }, {
      onSuccess: () => { showToast({ type:'SUCCESS', message:'Dépense restaurée'}); refetch(); },
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2"><ArchiveRestore className="w-5 h-5 text-red-600"/> Accès Dépenses Archivées</h1>
        <p className="text-xs text-gray-500">Accès protégé : entrez votre mot de passe pour consulter / restaurer.</p>
      </header>

      {!entered && (
        <form onSubmit={submit} className="bg-white border rounded-xl shadow-sm p-6 space-y-4 max-w-md">
          <label className="text-xs font-medium text-gray-600 flex items-center gap-2"><Lock className="w-4 h-4"/> Mot de passe</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Votre mot de passe" />
          <button type="submit" disabled={!password} className="w-full px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white disabled:opacity-40">Valider</button>
          {submittedPwd && isError && <p className="text-xs text-red-600">Mot de passe incorrect.</p>}
        </form>
      )}

      {entered && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 text-xs">
            <div className="flex items-center gap-2">
              <span>{archived.length} élément(s)</span>
              <button onClick={()=>refetch()} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Rafraîchir</button>
            </div>
            { (isLoading || unarchiveMut.isPending) && <span className="flex items-center gap-1 text-red-600"><RefreshCw className="w-3 h-3 animate-spin"/> Chargement...</span> }
          </div>
          {isLoading && <p className="p-4 text-sm text-gray-500">Chargement...</p>}
          {!isLoading && archived.length === 0 && <p className="p-6 text-sm text-gray-500">Aucune dépense archivée.</p>}
          <ul className="divide-y max-h-[600px] overflow-auto">
            {(archived as Depenses[]).map(d => (
              <li key={d._id} className="px-4 py-3 flex items-center justify-between text-sm hover:bg-gray-50">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 truncate max-w-xs" title={d.title}>{d.title || '(Sans titre)'}</span>
                  <span className="text-[11px] text-gray-500">{d.categorie} • {new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-600 font-semibold">-{d.montant.toLocaleString('fr-FR')} €</span>
                  <button
                    onClick={()=>handleUnarchive(d._id)}
                    disabled={unarchiveMut.isPending}
                    className="px-2 py-1 rounded-md bg-indigo-600 text-white text-[11px] disabled:opacity-40"
                  >Restaurer</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default DepensesArchiveesSecure;
