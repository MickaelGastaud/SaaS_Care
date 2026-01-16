'use client';
import { useState, useEffect } from 'react';

// ==================== CONFIGURATION ====================
const JOURS_FERIES_2024_2026 = [
  '2024-01-01', '2024-04-01', '2024-05-01', '2024-05-08', '2024-05-09',
  '2024-05-20', '2024-07-14', '2024-08-15', '2024-11-01', '2024-11-11', '2024-12-25',
  '2025-01-01', '2025-04-21', '2025-05-01', '2025-05-08', '2025-05-29',
  '2025-06-09', '2025-07-14', '2025-08-15', '2025-11-01', '2025-11-11', '2025-12-25',
  '2026-01-01', '2026-04-06', '2026-05-01', '2026-05-08', '2026-05-14',
  '2026-05-25', '2026-07-14', '2026-08-15', '2026-11-01', '2026-11-11', '2026-12-25'
];

// ==================== COMPOSANT PRINCIPAL ====================
export default function FacturationModule({ 
  auxiliaireId = null,
  showAvsSelector = true,
  onCalculate = null
}) {
  const [auxiliairesList, setAuxiliairesList] = useState([]);
  const [selectedId, setSelectedId] = useState(auxiliaireId || '');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (showAvsSelector) {
      const stored = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
      setAuxiliairesList(stored.filter(a => a.status === 'actif' || !a.status));
    }
  }, [showAvsSelector]);

  useEffect(() => {
    if (auxiliaireId) setSelectedId(auxiliaireId);
  }, [auxiliaireId]);

  // Helpers
  const isJourFerie = (dateStr) => JOURS_FERIES_2024_2026.includes(dateStr.slice(0, 10));
  const isDimanche = (dateStr) => new Date(dateStr).getDay() === 0;
  const isHeureNuit = (hour) => hour >= 21 || hour < 7;

  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`;
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Calcul
  const handleCalculate = () => {
    if (!selectedId) return;
    setLoading(true);

    setTimeout(() => {
      const allAuxiliaires = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
      const auxiliaire = allAuxiliaires.find(a => a.id === selectedId);
      
      if (!auxiliaire) {
        setLoading(false);
        return;
      }

      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      const auxAppointments = appointments.filter(appt => {
        if (appt.auxiliaire_id !== selectedId && appt.avs_id !== selectedId) return false;
        if (!appt.start_datetime) return false;
        return appt.start_datetime.slice(0, 7) === selectedMonth;
      });

      let minutesNormal = 0, minutesNuit = 0, minutesDimanche = 0, minutesFerie = 0;
      const details = [];

      auxAppointments.forEach(appt => {
        const start = new Date(appt.start_datetime);
        const end = new Date(appt.end_datetime);
        const durationMinutes = Math.round((end - start) / (1000 * 60));
        const dateStr = appt.start_datetime.slice(0, 10);
        const hour = start.getHours();

        let category = 'normal';
        if (isJourFerie(dateStr)) { minutesFerie += durationMinutes; category = 'ferie'; }
        else if (isDimanche(dateStr)) { minutesDimanche += durationMinutes; category = 'dimanche'; }
        else if (isHeureNuit(hour)) { minutesNuit += durationMinutes; category = 'nuit'; }
        else { minutesNormal += durationMinutes; }

        let beneficiaireName = 'Non assigné';
        if (appt.beneficiaire_id) {
          const beneficiaires = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
          const ben = beneficiaires.find(b => b.id === appt.beneficiaire_id);
          if (ben) beneficiaireName = `${ben.civilite || ''} ${ben.prenom || ''} ${ben.nom || ''}`.trim();
        }

        details.push({
          date: dateStr,
          start: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          end: end.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          duration: durationMinutes,
          category,
          title: appt.title,
          beneficiaire: beneficiaireName
        });
      });

      details.sort((a, b) => a.date.localeCompare(b.date));

      const tauxNormal = auxiliaire.taux_horaire || 12;
      const tauxNuit = auxiliaire.taux_horaire_nuit || 15;
      const tauxDimanche = auxiliaire.taux_horaire_dimanche || 18;
      const tauxFerie = auxiliaire.taux_horaire_ferie || 20;

      const montantNormal = (minutesNormal / 60) * tauxNormal;
      const montantNuit = (minutesNuit / 60) * tauxNuit;
      const montantDimanche = (minutesDimanche / 60) * tauxDimanche;
      const montantFerie = (minutesFerie / 60) * tauxFerie;
      const montantTotal = montantNormal + montantNuit + montantDimanche + montantFerie;

      const [year, month] = selectedMonth.split('-');

      const calculResult = {
        auxiliaire: { ...auxiliaire, tauxNormal, tauxNuit, tauxDimanche, tauxFerie },
        moisLabel: new Date(year, parseInt(month) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        heures: {
          normal: { minutes: minutesNormal, label: formatDuration(minutesNormal), montant: montantNormal },
          nuit: { minutes: minutesNuit, label: formatDuration(minutesNuit), montant: montantNuit },
          dimanche: { minutes: minutesDimanche, label: formatDuration(minutesDimanche), montant: montantDimanche },
          ferie: { minutes: minutesFerie, label: formatDuration(minutesFerie), montant: montantFerie },
          total: { 
            minutes: minutesNormal + minutesNuit + minutesDimanche + minutesFerie,
            label: formatDuration(minutesNormal + minutesNuit + minutesDimanche + minutesFerie),
            montant: montantTotal
          }
        },
        nombreRdv: auxAppointments.length,
        details
      };

      setResult(calculResult);
      if (onCalculate) onCalculate(calculResult);
      setLoading(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="font-semibold text-gray-800">Facturation Mensuelle</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {showAvsSelector && (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Auxiliaire de vie</label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setResult(null); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
            >
              <option value="">Sélectionner un auxiliaire</option>
              {auxiliairesList.map(aux => (
                <option key={aux.id} value={aux.id}>
                  {aux.civilite} {aux.prenom} {aux.nom}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm text-gray-600 mb-1">Mois</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(e.target.value); setResult(null); }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
          />
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || !selectedId}
          className="px-6 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? <span className="animate-spin">⏳</span> : <><span>📊</span> Calculer</>}
        </button>
      </div>

      {/* Résultats */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Header résultat */}
          <div className="bg-gradient-to-r from-[#74ccc3] to-[#5cb8ae] text-white rounded-lg p-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-sm opacity-90">Facturation de</p>
                <p className="text-xl font-bold">{result.auxiliaire.civilite} {result.auxiliaire.prenom} {result.auxiliaire.nom}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 capitalize">{result.moisLabel}</p>
                <p className="text-2xl font-bold">{formatMoney(result.heures.total.montant)}</p>
              </div>
            </div>
          </div>

          {/* Cartes récap */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Normal</span>
                <span className="text-xs text-gray-400">{result.auxiliaire.tauxNormal}€/h</span>
              </div>
              <p className="text-lg font-bold text-gray-800">{result.heures.normal.label}</p>
              <p className="text-sm text-gray-600">{formatMoney(result.heures.normal.montant)}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-600">🌙 Nuit</span>
                <span className="text-xs text-blue-400">{result.auxiliaire.tauxNuit}€/h</span>
              </div>
              <p className="text-lg font-bold text-blue-800">{result.heures.nuit.label}</p>
              <p className="text-sm text-blue-600">{formatMoney(result.heures.nuit.montant)}</p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-orange-600">☀️ Dimanche</span>
                <span className="text-xs text-orange-400">{result.auxiliaire.tauxDimanche}€/h</span>
              </div>
              <p className="text-lg font-bold text-orange-800">{result.heures.dimanche.label}</p>
              <p className="text-sm text-orange-600">{formatMoney(result.heures.dimanche.montant)}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-red-600">🎉 Férié</span>
                <span className="text-xs text-red-400">{result.auxiliaire.tauxFerie}€/h</span>
              </div>
              <p className="text-lg font-bold text-red-800">{result.heures.ferie.label}</p>
              <p className="text-sm text-red-600">{formatMoney(result.heures.ferie.montant)}</p>
            </div>

            <div className="bg-[#a5fce8] border border-[#74ccc3] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#5cb8ae] font-medium">TOTAL</span>
                <span className="text-xs text-[#5cb8ae]">{result.nombreRdv} RDV</span>
              </div>
              <p className="text-lg font-bold text-[#5cb8ae]">{result.heures.total.label}</p>
              <p className="text-sm font-semibold text-[#5cb8ae]">{formatMoney(result.heures.total.montant)}</p>
            </div>
          </div>

          {/* Bouton détails */}
          {result.details.length > 0 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-[#d85940] hover:underline flex items-center gap-1"
            >
              {showDetails ? '▼ Masquer' : '▶ Voir'} le détail des {result.details.length} intervention(s)
            </button>
          )}

          {/* Tableau détail */}
          {showDetails && result.details.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Horaires</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Durée</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Type</th>
                    <th className="px-3 py-2 text-left text-gray-500 font-medium">Bénéficiaire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {result.details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        {new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{item.start} - {item.end}</td>
                      <td className="px-3 py-2">{formatDuration(item.duration)}</td>
                      <td className="px-3 py-2">
                        {item.category === 'normal' && <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Normal</span>}
                        {item.category === 'nuit' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">🌙 Nuit</span>}
                        {item.category === 'dimanche' && <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">☀️ Dim.</span>}
                        {item.category === 'ferie' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">🎉 Férié</span>}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{item.beneficiaire}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.details.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <span className="text-3xl">📭</span>
              <p className="mt-2 text-gray-500">Aucune intervention trouvée pour ce mois</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}