import React from 'react';
import type { Facture } from '../../Types/facture';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props { history?: Facture['statusHistory']; }

const statusIcon = (status: string) => {
  switch (status) {
    case 'Payée':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'En_retard':
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    default:
      return <Clock className="w-4 h-4 text-orange-500" />;
  }
};

export const FactureTimeline: React.FC<Props> = ({ history }) => {
  if (!history || history.length === 0) {
    return <p className="text-xs text-gray-500 italic">Aucun historique</p>;
  }
  // tri chronologique
  const sorted = [...history].sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime());
  return (
    <ol className="relative border-l border-gray-200 ml-2 mt-3 space-y-2">
      {sorted.map((h, idx) => (
        <li key={idx} className="ml-4">
          <div className="flex items-center gap-2">
            <span className="absolute -left-2 flex items-center justify-center w-4 h-4 rounded-full bg-white border border-gray-300">
              {statusIcon(h.to)}
            </span>
            <span className="text-xs font-medium text-gray-700">{h.to}</span>
            <span className="text-[10px] text-gray-400">
              {new Date(h.changedAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
            {h.from && (
              <span className="text-[10px] text-gray-400 italic">(depuis {h.from})</span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
};

export default FactureTimeline;