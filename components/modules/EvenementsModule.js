'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ==================== CONFIGURATION ====================
const RETENTION_MONTHS = 24; // Conserver 24 mois d'historique

// ==================== COMPOSANT AUTOCOMPLETE ====================
function AutocompleteInput({ label, placeholder, value, onChange, suggestions, onSelect, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
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
          onBlur={() => setTimeout(() => { if (!wrapperRef.current?.contains(document.activeElement)) { setIsFocused(false); setIsOpen(false); } }, 150)}
          placeholder={placeholder}
          className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#74ccc3] focus:border-transparent ${icon ? 'pl-10' : ''}`}
          autoComplete="off"
        />
      </div>
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <li
              key={suggestion.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(suggestion); setIsOpen(false); setIsFocused(false); }}
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

// ==================== MODAL CONFIRMATION ====================
function ConfirmModal({ isOpen, title, message, confirmText, confirmColor, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className={`flex-1 py-2 px-4 rounded-lg text-white transition-colors ${confirmColor}`}>{confirmText}</button>
          <button onClick={onCancel} className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DÉTAIL ÉVÉNEMENT ====================
function EventDetailModal({ event, isOpen, onClose, onEdit, onTogglePin, onDelete, getClientName }) {
  if (!isOpen || !event) return null;

  const clientName = getClientName(event);
  const isGeneral = !clientName;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#74ccc3] px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="text-white">
              <p className="text-white/80 text-sm">Événement du {new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <h3 className="text-lg font-semibold mt-1 flex items-center gap-2">
                {isGeneral ? (
                  <span>📋 Événement général</span>
                ) : (
                  <>{event.type === 'beneficiaire' ? '👤' : '💚'} {clientName}</>
                )}
              </h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
            <p className="text-gray-800 whitespace-pre-wrap">{event.description || 'Aucune description'}</p>
          </div>

          {/* Patient concerné (si sur fiche AVS ou si renseigné) */}
          {event.beneficiaireName && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Patient concerné</p>
              <p className="text-gray-800">👤 {event.beneficiaireName}</p>
            </div>
          )}

          {/* AVS concernée (si sur fiche bénéficiaire ou si renseigné) */}
          {event.avsName && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">AVS concernée</p>
              <p className="text-gray-800">💚 {event.avsName}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-500">Créé par</p>
              <p className="text-gray-800">{event.creePar || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Créé le</p>
              <p className="text-gray-800">{event.created_at ? new Date(event.created_at).toLocaleDateString('fr-FR') : '—'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3 flex-wrap">
          <button 
            onClick={() => onTogglePin(event.id)} 
            className={`flex-1 py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              event.isPinned 
                ? 'bg-[#74ccc3] text-white hover:bg-[#5cb8ae]' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill={event.isPinned ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            {event.isPinned ? 'Épinglé' : 'Épingler'}
          </button>
          <button onClick={() => onEdit(event)} className="flex-1 py-2 px-4 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors">
            Modifier
          </button>
          <button 
            onClick={() => onDelete(event.id)} 
            className="py-2 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function EvenementsModule({ entityType = null, entityId = null, showTitle = true }) {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, eventId: null });
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'beneficiaire',
    clientId: '',
    clientName: '',
    avsId: '',
    avsName: '',
    beneficiaireId: '',
    beneficiaireName: ''
  });

  const isDashboardMode = !entityType || !entityId;
  const storageKey = 'evenements';

  // ==================== CHARGEMENT ====================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(JSON.parse(userData || '{}'));
    setBeneficiaires(JSON.parse(localStorage.getItem('beneficiaires') || '[]'));
    setAuxiliaires(JSON.parse(localStorage.getItem('auxiliaires') || '[]'));
    loadData();
  }, [entityId, entityType]);

  const loadData = useCallback(() => {
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Nettoyage des anciens événements (> 24 mois)
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - RETENTION_MONTHS);
    const validEvents = allEvents.filter(e => new Date(e.created_at || e.date) > cutoffDate);

    if (validEvents.length !== allEvents.length) {
      localStorage.setItem(storageKey, JSON.stringify(validEvents));
    }

    if (isDashboardMode) {
      setEvents(validEvents);
    } else {
      const entityEvents = validEvents.filter(e => e.type === entityType && String(e.clientId) === String(entityId));
      setEvents(entityEvents);
    }
  }, [isDashboardMode, entityType, entityId]);

  const saveEvents = (newEvents) => {
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (isDashboardMode) {
      localStorage.setItem(storageKey, JSON.stringify(newEvents));
      setEvents(newEvents);
    } else {
      const otherEvents = allEvents.filter(e => !(e.type === entityType && String(e.clientId) === String(entityId)));
      localStorage.setItem(storageKey, JSON.stringify([...otherEvents, ...newEvents]));
      setEvents(newEvents);
    }
  };

  // ==================== TRI ====================
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      // Épinglés en premier
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Puis par date décroissante
      return (b.date || '').localeCompare(a.date || '') || (b.created_at || '').localeCompare(a.created_at || '');
    });
  }, [events]);

  // ==================== HELPERS ====================
  const getClientName = useCallback((event) => {
    // Événement général (sans entité liée)
    if (!event.clientId || event.type === 'general') return null;
    
    if (event.type === 'beneficiaire') {
      const client = beneficiaires.find(b => String(b.id) === String(event.clientId));
      return client ? `${client.civilite || ''} ${client.nom || ''}`.trim() : event.clientName || '—';
    } else {
      const client = auxiliaires.find(a => String(a.id) === String(event.clientId));
      return client ? `${client.prenom || ''} ${client.nom || ''}`.trim() : event.clientName || '—';
    }
  }, [beneficiaires, auxiliaires]);

  const beneficiaireSuggestions = useMemo(() => beneficiaires.map(b => ({ 
    id: b.id, 
    label: `${b.civilite || ''} ${b.nom || ''} ${b.prenom || ''}`.trim(), 
    sublabel: b.ville || '',
    icon: '👤'
  })), [beneficiaires]);

  const auxiliaireSuggestions = useMemo(() => auxiliaires.map(a => ({ 
    id: a.id, 
    label: `${a.prenom || ''} ${a.nom || ''}`.trim(), 
    sublabel: a.fonction || 'AVS',
    icon: '💚'
  })), [auxiliaires]);

  // ==================== ACTIONS ====================
  const handleSave = () => {
    if (!formData.description.trim()) { 
      alert('Veuillez décrire l\'événement'); 
      return; 
    }
    // Pas de validation obligatoire pour patient/AVS - on peut créer un événement général

    if (editingEvent) {
      const updated = events.map(e => e.id === editingEvent.id ? { 
        ...e, 
        ...formData, 
        updated_at: new Date().toISOString() 
      } : e);
      saveEvents(updated);
    } else {
      const newEvent = {
        id: Date.now().toString(),
        ...formData,
        creePar: user?.name || 'Utilisateur',
        created_at: new Date().toISOString(),
        type: isDashboardMode ? (formData.clientId ? formData.type : 'general') : entityType,
        clientId: isDashboardMode ? formData.clientId : entityId,
        clientName: isDashboardMode ? formData.clientName : '',
        isPinned: false
      };
      saveEvents([newEvent, ...events]);
    }
    closeForm();
  };

  const handleDelete = (eventId) => setConfirmModal({ isOpen: true, eventId });

  const confirmDelete = () => {
    saveEvents(events.filter(e => e.id !== confirmModal.eventId));
    setConfirmModal({ isOpen: false, eventId: null });
    setViewingEvent(null);
  };

  const handleTogglePin = (eventId) => {
    const updated = events.map(e => e.id === eventId ? { ...e, isPinned: !e.isPinned } : e);
    saveEvents(updated);
    if (viewingEvent && viewingEvent.id === eventId) {
      setViewingEvent({ ...viewingEvent, isPinned: !viewingEvent.isPinned });
    }
  };

  const openEditForm = (event) => {
    setEditingEvent(event);
    setFormData({
      date: event.date || new Date().toISOString().split('T')[0],
      description: event.description || '',
      type: event.type || 'beneficiaire',
      clientId: event.clientId || '',
      clientName: getClientName(event),
      avsId: event.avsId || '',
      avsName: event.avsName || '',
      beneficiaireId: event.beneficiaireId || '',
      beneficiaireName: event.beneficiaireName || ''
    });
    setViewingEvent(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: entityType || 'beneficiaire',
      clientId: entityId || '',
      clientName: '',
      avsId: '',
      avsName: '',
      beneficiaireId: '',
      beneficiaireName: ''
    });
  };

  const openNewForm = () => {
    setEditingEvent(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      type: entityType || 'beneficiaire',
      clientId: entityId || '',
      clientName: '',
      avsId: '',
      avsName: '',
      beneficiaireId: '',
      beneficiaireName: ''
    });
    setShowForm(true);
  };

  // ==================== RENDU ====================
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      {showTitle && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#74ccc3]/20 rounded-lg">
                <svg className="w-5 h-5 text-[#74ccc3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-800">Événements</span>
                <p className="text-sm text-gray-500">{events.length} événement{events.length > 1 ? 's' : ''}</p>
              </div>
            </div>

            <button
              onClick={openNewForm}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouvel événement
            </button>
          </div>
        </div>
      )}

      {/* Liste des événements */}
      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600">Aucun événement</p>
          <p className="text-sm text-gray-400 mt-1">Les événements apparaîtront ici</p>
          {!showTitle && (
            <button
              onClick={openNewForm}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter un événement
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#74ccc3] text-white">
                {isDashboardMode && <th className="px-4 py-3 text-left text-sm font-semibold">Patient / AVS</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold">Créé par</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, index) => {
                const clientName = getClientName(event);
                
                return (
                  <tr
                    key={event.id}
                    onClick={() => setViewingEvent(event)}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    {isDashboardMode && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {clientName ? (
                            <>
                              <span>{event.type === 'beneficiaire' ? '👤' : '💚'}</span>
                              <span className="font-semibold text-gray-800">{clientName}</span>
                            </>
                          ) : (
                            <span className="text-gray-400 italic">Événement général</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className="text-gray-600 text-sm">
                        créé par {event.creePar || '—'} le {event.date ? new Date(event.date).toLocaleDateString('fr-FR') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 line-clamp-2">{event.description}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {event.isPinned && (
                        <svg className="w-5 h-5 text-[#74ccc3] inline-block" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail */}
      <EventDetailModal 
        event={viewingEvent} 
        isOpen={!!viewingEvent} 
        onClose={() => setViewingEvent(null)} 
        onEdit={openEditForm} 
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
        getClientName={getClientName}
      />

      {/* Modal confirmation suppression */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title="Supprimer cet événement ?" 
        message="Cette action est irréversible."
        confirmText="Supprimer" 
        confirmColor="bg-red-500 hover:bg-red-600" 
        onConfirm={confirmDelete} 
        onCancel={() => setConfirmModal({ isOpen: false, eventId: null })} 
      />

      {/* Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header du formulaire */}
            <div className="bg-[#74ccc3] px-6 py-4">
              <h3 className="text-lg font-semibold text-white">
                {editingEvent ? 'MODIFIER L\'ÉVÉNEMENT' : 'NOUVEL ÉVÉNEMENT'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">Le</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#74ccc3] focus:border-transparent"
                />
              </div>

              {/* Patient (si mode dashboard ou fiche AVS) */}
              {(isDashboardMode || entityType === 'avs') && (
                <AutocompleteInput
                  placeholder="Patient"
                  value={entityType === 'avs' ? formData.beneficiaireName : (formData.type === 'beneficiaire' ? formData.clientName : formData.beneficiaireName)}
                  onChange={(v) => {
                    if (entityType === 'avs') {
                      setFormData({ ...formData, beneficiaireName: v, beneficiaireId: '' });
                    } else if (isDashboardMode && formData.type === 'beneficiaire') {
                      setFormData({ ...formData, clientName: v, clientId: '' });
                    } else {
                      setFormData({ ...formData, beneficiaireName: v, beneficiaireId: '' });
                    }
                  }}
                  suggestions={beneficiaireSuggestions}
                  onSelect={(s) => {
                    if (entityType === 'avs') {
                      setFormData({ ...formData, beneficiaireId: s.id, beneficiaireName: s.label });
                    } else if (isDashboardMode && formData.type === 'beneficiaire') {
                      setFormData({ ...formData, clientId: s.id, clientName: s.label, type: 'beneficiaire' });
                    } else {
                      setFormData({ ...formData, beneficiaireId: s.id, beneficiaireName: s.label });
                    }
                  }}
                  icon="👤"
                />
              )}

              {/* AVS (si mode dashboard ou fiche bénéficiaire) */}
              {(isDashboardMode || entityType === 'beneficiaire') && (
                <AutocompleteInput
                  placeholder="AVS"
                  value={entityType === 'beneficiaire' ? formData.avsName : (formData.type === 'avs' ? formData.clientName : formData.avsName)}
                  onChange={(v) => {
                    if (entityType === 'beneficiaire') {
                      setFormData({ ...formData, avsName: v, avsId: '' });
                    } else if (isDashboardMode && formData.type === 'avs') {
                      setFormData({ ...formData, clientName: v, clientId: '' });
                    } else {
                      setFormData({ ...formData, avsName: v, avsId: '' });
                    }
                  }}
                  suggestions={auxiliaireSuggestions}
                  onSelect={(s) => {
                    if (entityType === 'beneficiaire') {
                      setFormData({ ...formData, avsId: s.id, avsName: s.label });
                    } else if (isDashboardMode && formData.type === 'avs') {
                      setFormData({ ...formData, clientId: s.id, clientName: s.label, type: 'avs' });
                    } else {
                      setFormData({ ...formData, avsId: s.id, avsName: s.label });
                    }
                  }}
                  icon="💚"
                />
              )}

              {/* Description */}
              <div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  placeholder="Que s'est-il passé ?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#74ccc3] focus:border-transparent resize-none"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSave} 
                  className="flex-1 bg-[#74ccc3] text-white py-2.5 px-4 rounded-lg hover:bg-[#5cb8ae] transition-colors font-medium"
                >
                  Valider
                </button>
                <button 
                  onClick={closeForm} 
                  className="px-6 py-2.5 text-[#d85940] hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}