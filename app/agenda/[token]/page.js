'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';

// ==================== CONFIGURATION ====================
const EVENT_TYPE_CONFIG = {
  rdv_medical: { 
    label: 'RDV Médical', 
    bg: 'bg-red-500', 
    bgLight: 'bg-red-50', 
    text: 'text-red-700'
  },
  intervention_avs: { 
    label: 'Intervention AVS', 
    bg: 'bg-green-500', 
    bgLight: 'bg-green-50', 
    text: 'text-green-700'
  },
  kine: { 
    label: 'Kinésithérapeute', 
    bg: 'bg-blue-500', 
    bgLight: 'bg-blue-50', 
    text: 'text-blue-700'
  },
  infirmier: { 
    label: 'Infirmier(e)', 
    bg: 'bg-purple-500', 
    bgLight: 'bg-purple-50', 
    text: 'text-purple-700'
  },
  reunion: { 
    label: 'Réunion', 
    bg: 'bg-yellow-500', 
    bgLight: 'bg-yellow-50', 
    text: 'text-yellow-700'
  },
  administratif: { 
    label: 'Administratif', 
    bg: 'bg-gray-500', 
    bgLight: 'bg-gray-50', 
    text: 'text-gray-700'
  },
  conge: { 
    label: 'Congé / Absence', 
    bg: 'bg-orange-500', 
    bgLight: 'bg-orange-50', 
    text: 'text-orange-700'
  },
  autre: { 
    label: 'Autre', 
    bg: 'bg-slate-500', 
    bgLight: 'bg-slate-50', 
    text: 'text-slate-700'
  }
};

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// ==================== COMPOSANT PRINCIPAL ====================
export default function PublicAgendaPage() {
  const params = useParams();
  const token = params.token;
  
  const [shareData, setShareData] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingEvent, setViewingEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ==================== CHARGEMENT ====================
  useEffect(() => {
    loadAgenda();
    
    // Auto-refresh toutes les 5 minutes
    const interval = setInterval(loadAgenda, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const loadAgenda = useCallback(() => {
    try {
      // Chercher le partage correspondant au token
      const shares = JSON.parse(localStorage.getItem('agenda_shares') || '{}');
      const share = Object.values(shares).find(s => s.token === token);
      
      if (!share) {
        setError('Agenda introuvable ou lien expiré');
        setLoading(false);
        return;
      }
      
      setShareData(share);
      
      // Charger les événements
      const storageKey = share.entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
      const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const entityEvents = allEvents[share.entityId] || [];
      
      setEvents(entityEvents);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Erreur chargement agenda:', err);
      setError('Erreur lors du chargement de l\'agenda');
      setLoading(false);
    }
  }, [token]);

  // ==================== FILTRAGE ====================
  const filteredEvents = useMemo(() => {
    if (!filterType) return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  // ==================== NAVIGATION ====================
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // ==================== GÉNÉRATION CALENDRIER ====================
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay() || 7;
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    for (let i = startDay - 1; i > 0; i--) {
      days.push({ date: new Date(year, month, -i + 1), isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return filteredEvents.filter(e => e.date === dateStr);
  };

  // Nombre de RDV du mois
  const eventsThisMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).length;
  }, [filteredEvents, currentDate]);

  // ==================== RENDU - ÉTATS SPÉCIAUX ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#74ccc3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'agenda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Agenda non disponible</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Ce lien de partage n'est peut-être plus valide. 
            Contactez la personne qui vous l'a envoyé.
          </p>
        </div>
      </div>
    );
  }

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Styles d'impression */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .hidden.print\\:block {
            display: block !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          header {
            position: relative !important;
            box-shadow: none !important;
          }
          main {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .bg-white {
            box-shadow: none !important;
          }
          .min-h-\\[80px\\] {
            min-height: 60px !important;
          }
          /* Forcer les couleurs de fond */
          .bg-red-500 { background-color: #ef4444 !important; }
          .bg-green-500 { background-color: #22c55e !important; }
          .bg-blue-500 { background-color: #3b82f6 !important; }
          .bg-purple-500 { background-color: #a855f7 !important; }
          .bg-yellow-500 { background-color: #eab308 !important; }
          .bg-orange-500 { background-color: #f97316 !important; }
          .bg-gray-500 { background-color: #6b7280 !important; }
          .bg-slate-500 { background-color: #64748b !important; }
          .text-white { color: white !important; }
          /* Texte plus petit pour impression */
          .text-xs {
            font-size: 9px !important;
            line-height: 1.2 !important;
          }
          .space-y-1 > * + * {
            margin-top: 2px !important;
          }
          .px-1\\.5 {
            padding-left: 4px !important;
            padding-right: 4px !important;
          }
          .py-0\\.5 {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
          }
        }
        @page {
          size: A4 landscape;
          margin: 0.5cm;
        }
      `}</style>
      {/* Header - masqué à l'impression */}
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#d85940] to-[#c04330] rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">Care-Pilot</h1>
                <p className="text-xs text-gray-500">Agenda partagé</p>
              </div>
            </div>
            
            {/* Badge lecture seule + Bouton Imprimer */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors print:hidden"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimer / PDF
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm print:hidden">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Lecture seule
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu */}
      <main className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Info personne */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-[#74ccc3]/10 to-transparent">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  shareData.entityType === 'beneficiaire' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {shareData.entityType === 'beneficiaire' ? '👤' : '💚'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{shareData.entityName}</h2>
                  <p className="text-sm text-gray-500">
                    {shareData.entityType === 'beneficiaire' ? 'Bénéficiaire' : 'Auxiliaire'}
                    {' • '}{eventsThisMonth} RDV ce mois
                  </p>
                </div>
              </div>
              
              {lastUpdate && (
                <p className="text-xs text-gray-400 print:hidden">
                  Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>

          {/* Légende cliquable - masquée à l'impression */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 print:hidden">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterType === null 
                    ? 'bg-gray-700 text-white' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                Tous
              </button>
              {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setFilterType(filterType === key ? null : key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === key 
                      ? `${config.bg} text-white` 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${filterType === key ? 'bg-white' : config.bg}`}></div>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-center gap-4">
              <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-xl font-semibold text-gray-800 capitalize min-w-[200px] text-center">
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors print:hidden">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button onClick={goToToday} className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 print:hidden">
                Aujourd'hui
              </button>
            </div>
            
            {/* Légende pour impression */}
            <div className="hidden print:flex flex-wrap gap-3 mt-3 justify-center text-xs">
              {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                <div key={key} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${config.bg}`}></div>
                  <span>{config.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grille calendrier */}
          <div>
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
              {JOURS_SEMAINE.map(day => (
                <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-600">{day}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7">
              {generateCalendarDays().map((day, index) => {
                const dayEvents = getEventsForDay(day.date);
                const isToday = day.date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`min-h-[80px] p-1.5 border-b border-r border-gray-200 ${
                      !day.isCurrentMonth ? 'bg-gray-50/50' : ''
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center ${
                      isToday ? 'bg-[#d85940] text-white rounded-full' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.map(event => {
                        const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.autre;
                        return (
                          <div
                            key={event.id}
                            onClick={() => setViewingEvent(event)}
                            className={`text-xs px-1.5 py-0.5 rounded text-white cursor-pointer hover:opacity-80 ${config.bg}`}
                            title={event.titre}
                          >
                            <div className="truncate">
                              {event.heure_debut && <span className="font-medium">{event.heure_debut} </span>}
                              {event.titre}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer - masqué à l'impression */}
        <div className="mt-6 text-center text-sm text-gray-400 print:hidden">
          <p>Propulsé par <span className="font-semibold text-[#d85940]">Care-Pilot</span></p>
        </div>
        
        {/* Footer pour impression uniquement */}
        <div className="hidden print:block mt-4 text-center text-xs text-gray-500 border-t pt-2">
          <p>Planning imprimé le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • Care-Pilot</p>
        </div>
      </main>

      {/* Modal détail événement (lecture seule) */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            {/* Header avec couleur du type */}
            {(() => {
              const config = EVENT_TYPE_CONFIG[viewingEvent.type] || EVENT_TYPE_CONFIG.autre;
              return (
                <div className={`${config.bg} px-6 py-4`}>
                  <div className="flex items-start justify-between">
                    <div className="text-white">
                      <p className="text-white/80 text-sm">
                        {new Date(viewingEvent.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {viewingEvent.heure_debut && ` • ${viewingEvent.heure_debut}`}
                        {viewingEvent.heure_fin && ` - ${viewingEvent.heure_fin}`}
                      </p>
                      <h3 className="text-lg font-semibold mt-1">{viewingEvent.titre}</h3>
                    </div>
                    <button onClick={() => setViewingEvent(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Type */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_TYPE_CONFIG[viewingEvent.type]?.bg || 'bg-gray-400'}`}></div>
                <span className="text-gray-700 font-medium">{EVENT_TYPE_CONFIG[viewingEvent.type]?.label || 'Autre'}</span>
              </div>

              {/* Intervenant */}
              {viewingEvent.intervenant && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Intervenant</p>
                  <p className="text-gray-800">{viewingEvent.intervenant}</p>
                </div>
              )}

              {/* Lieu */}
              {viewingEvent.lieu && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Lieu</p>
                  <p className="text-gray-800">{viewingEvent.lieu}</p>
                </div>
              )}

              {/* Notes */}
              {viewingEvent.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{viewingEvent.notes}</p>
                </div>
              )}
            </div>

            {/* Action */}
            <div className="p-6 border-t border-gray-100">
              <button
                onClick={() => setViewingEvent(null)}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}