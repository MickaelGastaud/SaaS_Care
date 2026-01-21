'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';

// ==================== CONFIGURATION ====================
const EVENT_TYPE_CONFIG = {
  rdv_medical: { 
    label: 'RDV Médical', 
    bg: 'bg-red-500', 
    bgLight: 'bg-red-50', 
    text: 'text-red-700',
    border: 'border-red-200'
  },
  intervention_avs: { 
    label: 'Intervention AVS', 
    bg: 'bg-green-500', 
    bgLight: 'bg-green-50', 
    text: 'text-green-700',
    border: 'border-green-200'
  },
  kine: { 
    label: 'Kinésithérapeute', 
    bg: 'bg-blue-500', 
    bgLight: 'bg-blue-50', 
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  infirmier: { 
    label: 'Infirmier(e)', 
    bg: 'bg-purple-500', 
    bgLight: 'bg-purple-50', 
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  reunion: { 
    label: 'Réunion', 
    bg: 'bg-yellow-500', 
    bgLight: 'bg-yellow-50', 
    text: 'text-yellow-700',
    border: 'border-yellow-200'
  },
  administratif: { 
    label: 'Administratif', 
    bg: 'bg-gray-500', 
    bgLight: 'bg-gray-50', 
    text: 'text-gray-700',
    border: 'border-gray-200'
  },
  conge: { 
    label: 'Congé / Absence', 
    bg: 'bg-orange-500', 
    bgLight: 'bg-orange-50', 
    text: 'text-orange-700',
    border: 'border-orange-200'
  },
  autre: { 
    label: 'Autre', 
    bg: 'bg-slate-500', 
    bgLight: 'bg-slate-50', 
    text: 'text-slate-700',
    border: 'border-slate-200'
  }
};

const JOURS_SEMAINE = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const JOURS_SEMAINE_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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
          className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940] ${icon ? 'pl-10' : ''}`}
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

// ==================== HELPER RÉCURRENCE ====================
function generateRecurringDates(startDate, recurrence, customDays = [], endAfterMonths = 6) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + endAfterMonths);
  
  const dayOfMonth = start.getDate();
  
  let current = new Date(start);
  
  switch (recurrence) {
    case 'once':
      dates.push(startDate);
      break;
      
    case 'daily':
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      break;
      
    case 'every_two_days':
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 2);
      }
      break;
      
    case 'weekly':
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 7);
      }
      break;
      
    case 'biweekly':
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 14);
      }
      break;
      
    case 'monthly':
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setMonth(current.getMonth() + 1);
        // Gérer les mois avec moins de jours
        if (current.getDate() !== dayOfMonth) {
          current.setDate(0); // Dernier jour du mois précédent
        }
      }
      break;
      
    case 'custom':
      // customDays = [0, 1, 2...] où 0 = Lundi, 6 = Dimanche
      while (current <= end) {
        const currentDayIndex = current.getDay() === 0 ? 6 : current.getDay() - 1; // Convertir en index Lundi=0
        if (customDays.includes(currentDayIndex)) {
          dates.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
      }
      break;
      
    default:
      dates.push(startDate);
  }
  
  return dates;
}

function getRecurrenceLabel(recurrence, date, customDays = []) {
  if (!date) return '';
  const d = new Date(date);
  const dayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const dayName = JOURS_SEMAINE_FULL[dayIndex];
  const dayOfMonth = d.getDate();
  
  switch (recurrence) {
    case 'once': return 'Une seule fois';
    case 'daily': return 'Tous les jours';
    case 'every_two_days': return 'Un jour sur deux';
    case 'weekly': return `Toutes les semaines le ${dayName}`;
    case 'biweekly': return `Une semaine sur deux le ${dayName}`;
    case 'monthly': return `Tous les ${dayOfMonth} du mois`;
    case 'custom': 
      const selectedDays = customDays.map(i => JOURS_SEMAINE[i]).join(', ');
      return `Personnalisé : ${selectedDays || 'Aucun jour'}`;
    default: return 'Une seule fois';
  }
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function CalendrierModule({ entityType = null, entityId = null, showTitle = true }) {
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
    recurrence: 'once',
    customDays: [],
    entityType: 'beneficiaire',
    entityId: '',
    entityName: ''
  });

  const isDashboardMode = !entityType || !entityId;

  // Filtres - Par défaut : 
  // - Dashboard : RDV médicaux des bénéficiaires
  // - Fiche : Tous les RDV (pas de filtre)
  const [filterType, setFilterType] = useState(isDashboardMode ? 'rdv_medical' : null);
  const [filterEntityType, setFilterEntityType] = useState(isDashboardMode ? 'beneficiaire' : 'all');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterEntityName, setFilterEntityName] = useState('');
  
  // Modal pour voir tous les RDV d'un jour
  const [viewingDayEvents, setViewingDayEvents] = useState(null);
  
  // Partage d'agenda
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [shareCopied, setShareCopied] = useState(false);

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
      let allEvents = [];
      
      Object.entries(eventsBenef).forEach(([benefId, evts]) => {
        evts.forEach(e => {
          allEvents.push({ ...e, entityType: 'beneficiaire', entityId: benefId });
        });
      });
      
      Object.entries(eventsAvs).forEach(([avsId, evts]) => {
        evts.forEach(e => {
          allEvents.push({ ...e, entityType: 'avs', entityId: avsId });
        });
      });
      
      setEvents(allEvents);
    } else {
      const storageKey = entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
      const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setEvents((allEvents[entityId] || []).map(e => ({ ...e, entityType, entityId })));
    }
  }, [isDashboardMode, entityType, entityId]);

  // ==================== PARTAGE D'AGENDA ====================
  const generateShareToken = () => {
    // Générer un token unique
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let token = '';
    for (let i = 0; i < 12; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const getEntityDisplayName = useCallback(() => {
    if (entityType === 'beneficiaire') {
      const benef = beneficiaires.find(b => String(b.id) === String(entityId));
      return benef ? `${benef.civilite || ''} ${benef.nom || ''} ${benef.prenom || ''}`.trim() : 'Bénéficiaire';
    } else {
      const avs = auxiliaires.find(a => String(a.id) === String(entityId));
      return avs ? `${avs.prenom || ''} ${avs.nom || ''}`.trim() : 'Auxiliaire';
    }
  }, [entityType, entityId, beneficiaires, auxiliaires]);

  const loadShareToken = useCallback(() => {
    if (isDashboardMode) return;
    const shares = JSON.parse(localStorage.getItem('agenda_shares') || '{}');
    const key = `${entityType}_${entityId}`;
    if (shares[key]) {
      setShareToken(shares[key].token);
    }
  }, [isDashboardMode, entityType, entityId]);

  useEffect(() => {
    loadShareToken();
  }, [loadShareToken]);

  const createShare = () => {
    const token = generateShareToken();
    const shares = JSON.parse(localStorage.getItem('agenda_shares') || '{}');
    const key = `${entityType}_${entityId}`;
    shares[key] = {
      token,
      entityType,
      entityId,
      entityName: getEntityDisplayName(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('agenda_shares', JSON.stringify(shares));
    setShareToken(token);
  };

  const revokeShare = () => {
    if (!confirm('Révoquer le partage ? Le lien actuel ne fonctionnera plus.')) return;
    const shares = JSON.parse(localStorage.getItem('agenda_shares') || '{}');
    const key = `${entityType}_${entityId}`;
    delete shares[key];
    localStorage.setItem('agenda_shares', JSON.stringify(shares));
    setShareToken(null);
    setShowShareModal(false);
  };

  const copyShareLink = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/agenda/${shareToken}`;
    navigator.clipboard.writeText(link).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  const openShareModal = () => {
    if (!shareToken) {
      createShare();
    }
    setShowShareModal(true);
  };

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
      // Modification simple (pas de récurrence)
      if (editingEvent.entityType !== targetEntityType || editingEvent.entityId !== targetEntityId) {
        const oldStorageKey = editingEvent.entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
        const oldEvents = JSON.parse(localStorage.getItem(oldStorageKey) || '{}');
        if (oldEvents[editingEvent.entityId]) {
          oldEvents[editingEvent.entityId] = oldEvents[editingEvent.entityId].filter(e => e.id !== editingEvent.id);
          localStorage.setItem(oldStorageKey, JSON.stringify(oldEvents));
        }
      }
      
      const existingIndex = allEvents[targetEntityId].findIndex(e => e.id === editingEvent.id);
      const updatedEvent = {
        ...eventData,
        id: editingEvent.id,
        groupId: editingEvent.groupId,
        created_at: editingEvent.created_at,
        updated_at: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        allEvents[targetEntityId][existingIndex] = updatedEvent;
      } else {
        allEvents[targetEntityId].push(updatedEvent);
      }
    } else {
      // Création avec récurrence
      const dates = generateRecurringDates(eventData.date, eventData.recurrence, eventData.customDays);
      const groupId = dates.length > 1 ? Date.now().toString() : null;
      
      dates.forEach((date, index) => {
        const newEvent = {
          ...eventData,
          id: `${Date.now()}_${index}`,
          date: date,
          groupId: groupId,
          recurrence: eventData.recurrence,
          customDays: eventData.customDays,
          created_at: new Date().toISOString(),
          creePar: user?.name || 'Utilisateur'
        };
        allEvents[targetEntityId].push(newEvent);
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(allEvents));
    loadEvents();
    return true;
  };

  const deleteEvent = (event, deleteAll = false) => {
    const storageKey = event.entityType === 'beneficiaire' ? 'events_beneficiaires' : 'events_avss';
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    if (allEvents[event.entityId]) {
      if (deleteAll && event.groupId) {
        allEvents[event.entityId] = allEvents[event.entityId].filter(e => e.groupId !== event.groupId);
      } else {
        allEvents[event.entityId] = allEvents[event.entityId].filter(e => e.id !== event.id);
      }
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
    return filteredEvents.filter(e => e.date === dateStr);
  };

  // Événements filtrés selon les filtres actifs
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Filtre par type
      if (filterType && e.type !== filterType) return false;
      // Filtre par entité
      if (filterEntityId) {
        if (e.entityId !== filterEntityId) return false;
      } else if (filterEntityType !== 'all') {
        if (e.entityType !== filterEntityType) return false;
      }
      return true;
    });
  }, [events, filterType, filterEntityType, filterEntityId]);

  // Nombre de RDV du mois affiché
  const eventsThisMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    }).length;
  }, [filteredEvents, currentDate]);

  // Reset du filtre entité quand on change de type d'entité
  const handleFilterEntityTypeChange = (type) => {
    setFilterEntityType(type);
    setFilterEntityId('');
    setFilterEntityName('');
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
      recurrence: 'once',
      customDays: [],
      entityType: entityType || 'beneficiaire',
      entityId: entityId || '',
      entityName: ''
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const openFormForEvent = (event) => {
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
      recurrence: 'once', // En édition, on ne modifie pas la récurrence
      customDays: [],
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
      recurrence: 'once',
      customDays: [],
      entityType: entityType || 'beneficiaire',
      entityId: entityId || '',
      entityName: ''
    });
  };

  const toggleCustomDay = (dayIndex) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(dayIndex)
        ? prev.customDays.filter(d => d !== dayIndex)
        : [...prev.customDays, dayIndex].sort()
    }));
  };

  // ==================== RENDU ====================
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      {/* Header - DESIGN HARMONISÉ */}
      {showTitle && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-800">Planning</span>
                <p className="text-sm text-gray-500">{eventsThisMonth} RDV ce mois</p>
              </div>
            </div>
            
            {/* Bouton Partager (uniquement sur fiche) */}
            {!isDashboardMode && (
              <button
                onClick={openShareModal}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  shareToken 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {shareToken ? 'Agenda partagé' : 'Partager'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Légende cliquable = FILTRES PAR TYPE */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {/* Bouton "Tous" */}
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
          {/* Types de RDV */}
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

      {/* Filtres par Bénéficiaire / Auxiliaire (mode dashboard uniquement) */}
      {isDashboardMode && (
        <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">Filtrer par :</span>
          
          {/* Boutons de type d'entité */}
          <div className="flex gap-1">
            <button
              onClick={() => handleFilterEntityTypeChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterEntityType === 'all' && !filterEntityId
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => handleFilterEntityTypeChange('beneficiaire')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterEntityType === 'beneficiaire' && !filterEntityId
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              👤 Bénéficiaires
            </button>
            <button
              onClick={() => handleFilterEntityTypeChange('avs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterEntityType === 'avs' && !filterEntityId
                  ? 'bg-gray-700 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              💚 Auxiliaires
            </button>
          </div>

          {/* Autocomplete pour choisir une personne spécifique */}
          {filterEntityType !== 'all' && (
            <div className="flex-1 min-w-[200px] max-w-[300px]">
              <AutocompleteInput
                placeholder={`Rechercher un ${filterEntityType === 'beneficiaire' ? 'bénéficiaire' : 'auxiliaire'}...`}
                value={filterEntityName}
                onChange={(v) => { setFilterEntityName(v); if (!v) setFilterEntityId(''); }}
                suggestions={filterEntityType === 'beneficiaire' ? beneficiaireSuggestions : auxiliaireSuggestions}
                onSelect={(s) => { setFilterEntityId(s.id); setFilterEntityName(s.label); }}
                icon={filterEntityType === 'beneficiaire' ? '👤' : '💚'}
              />
            </div>
          )}

          {/* Badge de filtre actif */}
          {filterEntityId && (
            <button
              onClick={() => { setFilterEntityId(''); setFilterEntityName(''); }}
              className="inline-flex items-center gap-1 px-2 py-1 bg-[#d85940] text-white rounded-full text-xs"
            >
              {filterEntityName}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Navigation + Bouton */}
      <div className="p-4 border-b border-gray-200">
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors font-medium text-sm"
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
                onClick={() => day.isCurrentMonth && openFormForDay(day.date)}
                className={`min-h-[120px] p-2 border-b border-r border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !day.isCurrentMonth ? 'bg-gray-50/50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center ${
                  isToday ? 'bg-[#d85940] text-white rounded-full' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map(event => {
                    const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.autre;
                    const personName = getEntityName(event);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); setViewingEvent(event); }}
                        className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${config.bg}`}
                        title={`${event.titre} - ${personName}${event.heure_debut ? ' à ' + event.heure_debut : ''}`}
                      >
                        <div className="font-medium truncate">
                          {event.heure_debut && <span>{event.heure_debut} </span>}
                          {event.titre}
                        </div>
                        <div className="text-white/80 truncate text-[10px]">
                          {event.entityType === 'beneficiaire' ? '👤' : '💚'} {personName}
                        </div>
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingDayEvents({ date: day.date, events: dayEvents }); }}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline px-2 font-medium"
                    >
                      +{dayEvents.length - 2} autres
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal liste des RDV d'un jour */}
      {viewingDayEvents && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {viewingDayEvents.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </h3>
                  <p className="text-sm text-gray-500">{viewingDayEvents.events.length} RDV</p>
                </div>
                <button onClick={() => setViewingDayEvents(null)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Liste des RDV */}
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {viewingDayEvents.events
                .sort((a, b) => (a.heure_debut || '').localeCompare(b.heure_debut || ''))
                .map(event => {
                  const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.autre;
                  const personName = getEntityName(event);
                  return (
                    <button
                      key={event.id}
                      onClick={() => { setViewingDayEvents(null); setViewingEvent(event); }}
                      className={`w-full text-left p-3 rounded-lg border-l-4 ${config.border} ${config.bgLight} hover:opacity-80 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {event.heure_debut && (
                              <span className="text-sm font-semibold text-gray-700">{event.heure_debut}</span>
                            )}
                            {event.heure_fin && (
                              <span className="text-sm text-gray-400">- {event.heure_fin}</span>
                            )}
                          </div>
                          <p className={`font-medium ${config.text}`}>{event.titre}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            {event.entityType === 'beneficiaire' ? '👤' : '💚'} {personName}
                          </p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${config.bg} mt-2`}></div>
                      </div>
                    </button>
                  );
                })}
            </div>
            
            {/* Action */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => { setViewingDayEvents(null); openFormForDay(viewingDayEvents.date); }}
                className="w-full py-2 px-4 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors font-medium flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un RDV ce jour
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail événement - COULEUR PAR TYPE */}
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

              {/* Récurrence */}
              {viewingEvent.groupId && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Récurrence</p>
                  <p className="text-gray-800 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {getRecurrenceLabel(viewingEvent.recurrence, viewingEvent.date, viewingEvent.customDays)}
                  </p>
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
            <div className="p-6 border-t border-gray-100 flex gap-3 flex-wrap">
              <button 
                onClick={() => openFormForEvent(viewingEvent)} 
                className="flex-1 py-2 px-4 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
              >
                Modifier
              </button>
              {viewingEvent.groupId ? (
                <>
                  <button 
                    onClick={() => { if(confirm('Supprimer ce RDV uniquement ?')) deleteEvent(viewingEvent, false); }} 
                    className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Supprimer
                  </button>
                  <button 
                    onClick={() => { if(confirm('Supprimer TOUS les RDV de cette série ?')) deleteEvent(viewingEvent, true); }} 
                    className="py-2 px-4 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Supprimer la série
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { if(confirm('Supprimer ce RDV ?')) deleteEvent(viewingEvent, false); }} 
                  className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal formulaire */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header - SOBRE */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingEvent ? 'Modifier le RDV' : 'Nouveau RDV'}
                </h3>
                <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
                />
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
                >
                  {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
                  <input
                    type="time"
                    value={formData.heure_fin}
                    onChange={(e) => setFormData({ ...formData, heure_fin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
                  />
                </div>
              </div>

              {/* Récurrence (uniquement en création) */}
              {!editingEvent && (
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence</label>
                  <select
                    value={formData.recurrence}
                    onChange={(e) => setFormData({ ...formData, recurrence: e.target.value, customDays: [] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
                  >
                    <option value="once">Une seule fois</option>
                    <option value="daily">Tous les jours</option>
                    <option value="every_two_days">Un jour sur deux</option>
                    <option value="weekly">
                      Toutes les semaines{formData.date ? ` le ${JOURS_SEMAINE_FULL[new Date(formData.date).getDay() === 0 ? 6 : new Date(formData.date).getDay() - 1]}` : ''}
                    </option>
                    <option value="biweekly">
                      Une semaine sur deux{formData.date ? ` le ${JOURS_SEMAINE_FULL[new Date(formData.date).getDay() === 0 ? 6 : new Date(formData.date).getDay() - 1]}` : ''}
                    </option>
                    <option value="monthly">
                      {formData.date ? `Tous les ${new Date(formData.date).getDate()} du mois` : 'Tous les mois'}
                    </option>
                    <option value="custom">Personnalisé...</option>
                  </select>

                  {/* Jours personnalisés */}
                  {formData.recurrence === 'custom' && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Sélectionnez les jours :</p>
                      <div className="flex gap-1">
                        {JOURS_SEMAINE.map((jour, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleCustomDay(index)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              formData.customDays.includes(index)
                                ? 'bg-[#d85940] text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {jour.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Aperçu récurrence */}
                  {formData.recurrence !== 'once' && formData.date && (
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      RDV créés sur 6 mois (~{generateRecurringDates(formData.date, formData.recurrence, formData.customDays).length} occurrences)
                    </p>
                  )}
                </div>
              )}
              
              {/* Intervenant */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervenant</label>
                <input
                  type="text"
                  value={formData.intervenant}
                  onChange={(e) => setFormData({ ...formData, intervenant: e.target.value })}
                  placeholder="Nom de l'intervenant"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940]"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940]/30 focus:border-[#d85940] resize-none"
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

      {/* Modal de partage d'agenda */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#74ccc3] to-[#5cb8ae] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Partager l'agenda
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {entityType === 'beneficiaire' ? '👤' : '💚'} {getEntityDisplayName()}
                  </p>
                </div>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-4">
              {/* Lien de partage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lien de partage</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/agenda/${shareToken}`}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm text-gray-600"
                  />
                  <button
                    onClick={copyShareLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      shareCopied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-[#d85940] text-white hover:bg-[#c04330]'
                    }`}
                  >
                    {shareCopied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copié !
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        Copier
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Informations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Accès en lecture seule</p>
                    <p className="text-blue-600">
                      Les personnes avec ce lien peuvent consulter l'agenda mais ne peuvent pas le modifier. 
                      Idéal pour les aidants familiaux ou les intervenants.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cas d'usage */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Parfait pour :</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#74ccc3] rounded-full"></span>
                    Les aidants familiaux qui suivent leur proche
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#74ccc3] rounded-full"></span>
                    Les auxiliaires pour voir leurs interventions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#74ccc3] rounded-full"></span>
                    Les professionnels de santé partenaires
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={revokeShare}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Révoquer
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
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