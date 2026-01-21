'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';

// ==================== CONFIGURATION ====================
const EVENT_TYPE_COLORS = {
  rdv_medical: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  intervention_avs: { bg: 'bg-green-500', light: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  kine: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  infirmier: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  reunion: { bg: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  administratif: { bg: 'bg-gray-500', light: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  conge: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  autre: { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' }
};

const EVENT_TYPE_LABELS = {
  rdv_medical: 'RDV Médical',
  intervention_avs: 'Intervention AVS',
  kine: 'Kinésithérapeute',
  infirmier: 'Infirmier(e)',
  reunion: 'Réunion',
  administratif: 'Administratif',
  conge: 'Congé / Absence',
  autre: 'Autre'
};

// ==================== COMPOSANT AUTOCOMPLETE ====================
function AutocompleteInput({ placeholder, value, onChange, suggestions, onSelect, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!value || value.length === 0) return suggestions.slice(0, 10);
    return suggestions.filter(s => s.label.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
  }, [value, suggestions]);

  useEffect(() => {
    if (isFocused && filteredSuggestions.length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isFocused, filteredSuggestions.length]);

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#d85940] focus:border-transparent ${icon ? 'pl-10' : ''}`}
          autoComplete="off"
        />
      </div>
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(suggestion); setIsOpen(false); }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center gap-2"
            >
              {suggestion.icon && <span>{suggestion.icon}</span>}
              <span className="font-medium">{suggestion.label}</span>
              {suggestion.sublabel && <span className="text-gray-400 text-xs">({suggestion.sublabel})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================
/**
 * Module Calendrier réutilisable
 * @param {string} entityType - 'beneficiaire' ou 'avs' (optionnel - si absent = mode dashboard)
 * @param {string} entityId - ID de l'entité (optionnel - si absent = mode dashboard)
 * @param {boolean} showTitle - Afficher le titre (défaut: true)
 * @param {boolean} compactMode - Mode compact pour dashboard (défaut: false)
 */
export default function CalendrierModule({ entityType = null, entityId = null, showTitle = true, compactMode = false }) {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    type: 'rdv_medical',
    date: '',
    heure_debut: '',
    heure_fin: '',
    intervenant: '',
    lieu: '',
    notes: '',
    // Champs pour mode dashboard
    entityType: 'beneficiaire',
    entityId: '',
    entityName: ''
  });

  // Mode dashboard = pas d'entité spécifique
  const isDashboardMode = !entityType || !entityId;

  // ==================== CHARGEMENT ====================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(JSON.parse(userData || '{}'));
    setBeneficiaires(JSON.parse(localStorage.getItem('beneficiaires') || '[]'));
    setAuxiliaires(JSON.parse(localStorage.getItem('auxiliaires') || '[]'));
    loadEvents();
  }, [entityId, entityType]);

  const loadEvents = useCallback(() => {
    const eventsBenef = JSON.parse(localStorage.getItem('events_beneficiaires') || '{}');
    const eventsAvs = JSON.parse(localStorage.getItem('events_avss') || '{}');

    if (isDashboardMode) {
      // Mode dashboard : charger TOUS les événements
      let allEvents = [];
      
      // Événements bénéficiaires
      Object.entries(eventsBenef).forEach(([benefId, evts]) => {
        evts.forEach(e => {
          allEvents.push({
            ...e,
            entityType: 'beneficiaire',
            entityId: benefId
          });
        });
      });
      
      // Événements auxiliaires
      Object.entries(eventsAvs).forEach(([avsId, evts]) => {
        evts.forEach(e => {
          allEvents.push({
            ...e,
            entityType: 'avs',
            entityId: avsId
          });
        });
      });
      
      setEvents(allEvents);
    } else {
      // Mode fiche : charger uniquement les événements de l'entité
      const storageKey = entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
      const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setEvents((allEvents[entityId] || []).map(e => ({
        ...e,
        entityType,
        entityId
      })));
    }
  }, [isDashboardMode, entityType, entityId]);

  // ==================== SAUVEGARDE ====================
  const saveEvent = (eventData) => {
    const targetEntityType = isDashboardMode ? eventData.entityType : entityType;
    const targetEntityId = isDashboardMode ? eventData.entityId : entityId;
    
    if (!targetEntityId) {
      alert('Veuillez sélectionner un bénéficiaire ou un auxiliaire');
      return false;
    }

    const storageKey = targetEntityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (!allEvents[targetEntityId]) {
      allEvents[targetEntityId] = [];
    }

    if (editingEvent) {
      // Modification
      // Si l'entité a changé, supprimer de l'ancienne
      if (editingEvent.entityType !== targetEntityType || editingEvent.entityId !== targetEntityId) {
        const oldStorageKey = editingEvent.entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
        const oldEvents = JSON.parse(localStorage.getItem(oldStorageKey) || '{}');
        if (oldEvents[editingEvent.entityId]) {
          oldEvents[editingEvent.entityId] = oldEvents[editingEvent.entityId].filter(e => e.id !== editingEvent.id);
          localStorage.setItem(oldStorageKey, JSON.stringify(oldEvents));
        }
      }
      
      // Mettre à jour ou ajouter dans la nouvelle entité
      const existingIndex = allEvents[targetEntityId].findIndex(e => e.id === editingEvent.id);
      const updatedEvent = {
        ...eventData,
        id: editingEvent.id,
        created_at: editingEvent.created_at,
        updated_at: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        allEvents[targetEntityId][existingIndex] = updatedEvent;
      } else {
        allEvents[targetEntityId].push(updatedEvent);
      }
    } else {
      // Création
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        creePar: user?.name || 'Utilisateur'
      };
      allEvents[targetEntityId].push(newEvent);
    }

    localStorage.setItem(storageKey, JSON.stringify(allEvents));
    loadEvents();
    return true;
  };

  const deleteEvent = (event) => {
    if (!confirm('Supprimer ce RDV ?')) return;
    
    const storageKey = event.entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (allEvents[event.entityId]) {
      allEvents[event.entityId] = allEvents[event.entityId].filter(e => e.id !== event.id);
      localStorage.setItem(storageKey, JSON.stringify(allEvents));
      loadEvents();
      setViewingEvent(null);
    }
  };

  // ==================== HELPERS ====================
  const getEntityName = useCallback((event) => {
    if (event.entityType === 'beneficiaire') {
      const benef = beneficiaires.find(b => String(b.id) === String(event.entityId));
      return benef ? `${benef.civilite || ''} ${benef.nom || ''} ${benef.prenom || ''}`.trim() : 'Bénéficiaire inconnu';
    } else {
      const avs = auxiliaires.find(a => String(a.id) === String(event.entityId));
      return avs ? `${avs.prenom || ''} ${avs.nom || ''}`.trim() : 'Auxiliaire inconnu';
    }
  }, [beneficiaires, auxiliaires]);

  const beneficiaireSuggestions = useMemo(() => beneficiaires.map(b => ({ 
    id: b.id, 
    label: `${b.civilite || ''} ${b.nom || ''} ${b.prenom || ''}`.trim(), 
    sublabel: b.ville || '',
    icon: '👤',
    type: 'beneficiaire'
  })), [beneficiaires]);

  const auxiliaireSuggestions = useMemo(() => auxiliaires.map(a => ({ 
    id: a.id, 
    label: `${a.prenom || ''} ${a.nom || ''}`.trim(), 
    sublabel: a.fonction || 'AVS',
    icon: '💚',
    type: 'avs'
  })), [auxiliaires]);

  const allSuggestions = useMemo(() => [
    ...beneficiaireSuggestions,
    ...auxiliaireSuggestions
  ], [beneficiaireSuggestions, auxiliaireSuggestions]);

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
    return events.filter(e => e.date === dateStr);
  };

  // ==================== GESTION FORMULAIRE ====================
  const openFormForDay = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData({
      titre: '',
      type: 'rdv_medical',
      date: dateStr,
      heure_debut: '',
      heure_fin: '',
      intervenant: '',
      lieu: '',
      notes: '',
      entityType: entityType || 'beneficiaire',
      entityId: entityId || '',
      entityName: ''
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const openFormForEvent = (event, e) => {
    if (e) e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      titre: event.titre || '',
      type: event.type || 'rdv_medical',
      date: event.date || '',
      heure_debut: event.heure_debut || '',
      heure_fin: event.heure_fin || '',
      intervenant: event.intervenant || '',
      lieu: event.lieu || '',
      notes: event.notes || '',
      entityType: event.entityType || 'beneficiaire',
      entityId: event.entityId || '',
      entityName: getEntityName(event)
    });
    setViewingEvent(null);
    setShowEventForm(true);
  };

  const handleSave = () => {
    if (!formData.titre || !formData.date) {
      alert('Veuillez renseigner le titre et la date');
      return;
    }
    
    if (isDashboardMode && !formData.entityId) {
      alert('Veuillez sélectionner un bénéficiaire ou un auxiliaire');
      return;
    }
    
    if (saveEvent(formData)) {
      closeForm();
    }
  };

  const closeForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormData({
      titre: '',
      type: 'rdv_medical',
      date: '',
      heure_debut: '',
      heure_fin: '',
      intervenant: '',
      lieu: '',
      notes: '',
      entityType: entityType || 'beneficiaire',
      entityId: entityId || '',
      entityName: ''
    });
  };

  // ==================== RENDU ====================
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      {showTitle && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-800">Planning</span>
                <p className="text-sm text-gray-500">{events.length} RDV enregistré{events.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation + Bouton */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold text-gray-800 capitalize min-w-[200px] text-center">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            <button onClick={goToToday} className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Aujourd'hui
            </button>
          </div>
          
          <button
            onClick={() => openFormForDay(new Date())}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau RDV
          </button>
        </div>
      </div>
      
      {/* Grille calendrier */}
      <div className="border-b border-gray-200">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
            <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7">
          {generateCalendarDays().map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && openFormForDay(day.date)}
                className={`min-h-[100px] p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50/50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center ${
                  isToday ? 'bg-[#d85940] text-white rounded-full' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => {
                    const colors = EVENT_TYPE_COLORS[event.type] || EVENT_TYPE_COLORS.autre;
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setViewingEvent(event); }}
                        className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${colors.bg}`}
                        title={`${event.titre}${event.heure_debut ? ' - ' + event.heure_debut : ''}`}
                      >
                        {event.heure_debut && <span className="font-medium">{event.heure_debut}</span>} {event.titre}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">+{dayEvents.length - 3} autres</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Légende */}
      <div className="p-4 flex flex-wrap gap-4">
        {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => {
          const colors = EVENT_TYPE_COLORS[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Modal détail événement */}
      {viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="bg-[#d85940] px-6 py-4">
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

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Type */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${EVENT_TYPE_COLORS[viewingEvent.type]?.bg || 'bg-gray-400'}`}></div>
                <span className="text-gray-700 font-medium">{EVENT_TYPE_LABELS[viewingEvent.type] || 'Autre'}</span>
              </div>

              {/* Personne concernée (mode dashboard) */}
              {isDashboardMode && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {viewingEvent.entityType === 'beneficiaire' ? 'Bénéficiaire' : 'Auxiliaire'}
                  </p>
                  <p className="text-gray-800 flex items-center gap-2">
                    <span>{viewingEvent.entityType === 'beneficiaire' ? '👤' : '💚'}</span>
                    {getEntityName(viewingEvent)}
                  </p>
                </div>
              )}

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

              {/* Métadonnées */}
              <div className="pt-4 border-t border-gray-100 text-sm text-gray-500">
                {viewingEvent.creePar && <p>Créé par {viewingEvent.creePar}</p>}
                {viewingEvent.created_at && (
                  <p>Le {new Date(viewingEvent.created_at).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={() => openFormForEvent(viewingEvent)} 
                className="flex-1 py-2 px-4 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
              >
                Modifier
              </button>
              <button 
                onClick={() => deleteEvent(viewingEvent)} 
                className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal formulaire */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#d85940] px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  {editingEvent ? 'Modifier le RDV' : 'Nouveau RDV'}
                </h3>
                <button onClick={closeForm} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Sélection personne (mode dashboard uniquement) */}
              {isDashboardMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bénéficiaire ou Auxiliaire *
                  </label>
                  <AutocompleteInput
                    placeholder="Rechercher..."
                    value={formData.entityName}
                    onChange={(v) => setFormData({ ...formData, entityName: v, entityId: '' })}
                    suggestions={allSuggestions}
                    onSelect={(s) => setFormData({ 
                      ...formData, 
                      entityId: s.id, 
                      entityName: s.label,
                      entityType: s.type
                    })}
                    icon={formData.entityType === 'beneficiaire' ? '👤' : '💚'}
                  />
                </div>
              )}

              {/* Titre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Ex: Consultation Dr. Martin"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                >
                  {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Heures */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
                  <input
                    type="time"
                    value={formData.heure_debut}
                    onChange={(e) => setFormData({ ...formData, heure_debut: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                  <input
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Intervenant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervenant</label>
                <input
                  type="text"
                  value={formData.intervenant}
                  onChange={(e) => setFormData({ ...formData, intervenant: e.target.value })}
                  placeholder="Nom de l'intervenant"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>

              {/* Lieu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                <input
                  type="text"
                  value={formData.lieu}
                  onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
                  placeholder="Adresse ou lieu du RDV"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Informations complémentaires..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent resize-none"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#d85940] text-white py-2.5 px-4 rounded-lg hover:bg-[#c04330] transition-colors font-medium"
              >
                {editingEvent ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button
                onClick={closeForm}
                className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}