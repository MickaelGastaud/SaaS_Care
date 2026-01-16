'use client';
import { useState, useEffect } from 'react';

// ==================== CONFIGURATION ====================
const EVENT_TYPE_COLORS = {
  rdv_medical: 'bg-red-500',
  intervention_avs: 'bg-green-500',
  kine: 'bg-blue-500',
  infirmier: 'bg-purple-500',
  reunion: 'bg-yellow-500',
  administratif: 'bg-gray-500',
  conge: 'bg-orange-500',
  autre: 'bg-slate-500'
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

// ==================== COMPOSANT PRINCIPAL ====================
/**
 * Module Calendrier réutilisable
 * @param {string} entityType - 'beneficiaire' ou 'avs'
 * @param {string} entityId - ID de l'entité
 */
export default function CalendrierModule({ entityType, entityId }) {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    type: 'rdv_medical',
    date: '',
    heure_debut: '',
    heure_fin: '',
    intervenant: '',
    notes: ''
  });

  // Clé de stockage
  const storageKey = `events_${entityType}s`;

  // ==================== CHARGEMENT / SAUVEGARDE ====================
  useEffect(() => {
    if (entityId) {
      const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setEvents(allEvents[entityId] || []);
    }
  }, [entityId, storageKey]);

  const saveEvents = (newEvents) => {
    const allEvents = JSON.parse(localStorage.getItem(storageKey) || '{}');
    allEvents[entityId] = newEvents;
    localStorage.setItem(storageKey, JSON.stringify(allEvents));
    setEvents(newEvents);
  };

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
      notes: ''
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const openFormForEvent = (event, e) => {
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      titre: event.titre,
      type: event.type,
      date: event.date,
      heure_debut: event.heure_debut || '',
      heure_fin: event.heure_fin || '',
      intervenant: event.intervenant || '',
      notes: event.notes || ''
    });
    setShowEventForm(true);
  };

  const handleSave = () => {
    if (!formData.titre || !formData.date) {
      alert('Veuillez renseigner le titre et la date');
      return;
    }
    
    if (editingEvent) {
      const updated = events.map(e => 
        e.id === editingEvent.id ? { ...e, ...formData, updated_at: new Date().toISOString() } : e
      );
      saveEvents(updated);
    } else {
      const newEvent = {
        ...formData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };
      saveEvents([...events, newEvent]);
    }
    
    closeForm();
  };

  const handleDelete = () => {
    if (editingEvent && confirm('Supprimer cet événement ?')) {
      saveEvents(events.filter(e => e.id !== editingEvent.id));
      closeForm();
    }
  };

  const closeForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setFormData({ titre: '', type: 'rdv_medical', date: '', heure_debut: '', heure_fin: '', intervenant: '', notes: '' });
  };

  // ==================== RENDU ====================
  return (
    <div className="space-y-4">
      {/* Header */}
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
          onClick={() => {
            setFormData({ ...formData, date: new Date().toISOString().split('T')[0] });
            setEditingEvent(null);
            setShowEventForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel événement
        </button>
      </div>
      
      {/* Grille calendrier */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
                  !day.isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center ${
                  isToday ? 'bg-[#d85940] text-white rounded-full' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => openFormForEvent(event, e)}
                      className={`text-xs px-2 py-1 rounded text-white truncate cursor-pointer hover:opacity-80 ${EVENT_TYPE_COLORS[event.type] || 'bg-gray-500'}`}
                      title={`${event.titre}${event.heure_debut ? ' - ' + event.heure_debut : ''}`}
                    >
                      {event.heure_debut && <span className="font-medium">{event.heure_debut}</span>} {event.titre}
                    </div>
                  ))}
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
      <div className="flex flex-wrap gap-4">
        {Object.entries(EVENT_TYPE_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${EVENT_TYPE_COLORS[key]}`}></div>
            <span className="text-sm text-gray-600">{label}</span>
          </div>
        ))}
      </div>
      
      {/* Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
              </h3>
              {editingEvent && (
                <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Supprimer">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="space-y-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  placeholder="Informations complémentaires..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#d85940] text-white py-2 px-4 rounded-lg hover:bg-[#c04330] transition-colors"
              >
                {editingEvent ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button
                onClick={closeForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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