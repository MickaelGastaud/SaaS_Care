'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';

// ==================== CONFIGURATION ====================
const STATUS_CONFIG = {
  a_faire: { label: 'A faire', bg: 'bg-yellow-100', text: 'text-yellow-700', order: 0 },
  en_cours: { label: 'En cours', bg: 'bg-blue-100', text: 'text-blue-700', order: 1 },
  terminee: { label: 'Terminée', bg: 'bg-green-100', text: 'text-green-700', order: 2 },
  archivee: { label: 'Archivée', bg: 'bg-gray-100', text: 'text-gray-600', order: 3 }
};

const PRIORITY_CONFIG = {
  haute: { 
    label: 'Urgente', 
    bg: 'bg-red-100', 
    text: 'text-red-600',
    bar: 'bg-red-500',
    rowBg: 'bg-red-50/40'
  },
  normale: { 
    label: 'Normale', 
    bg: 'bg-blue-100', 
    text: 'text-blue-600',
    bar: 'bg-blue-400',
    rowBg: ''
  },
  basse: { 
    label: 'Basse', 
    bg: 'bg-gray-100', 
    text: 'text-gray-600',
    bar: 'bg-gray-300',
    rowBg: ''
  }
};

const RETENTION_MONTHS = 12;

// ==================== COMPOSANT AUTOCOMPLETE ====================
function AutocompleteInput({ label, placeholder, value, onChange, suggestions, onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  const filteredSuggestions = useMemo(() => {
    if (!value || value.length === 0) return suggestions;
    return suggestions.filter(s => s.label.toLowerCase().includes(value.toLowerCase()));
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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => { if (!wrapperRef.current?.contains(document.activeElement)) { setIsFocused(false); setIsOpen(false); } }, 150)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
        autoComplete="off"
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredSuggestions.slice(0, 10).map((suggestion) => (
            <li
              key={suggestion.id}
              onMouseDown={(e) => { e.preventDefault(); onSelect(suggestion); setIsOpen(false); setIsFocused(false); }}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <span className="font-medium">{suggestion.label}</span>
              {suggestion.sublabel && <span className="text-gray-500 ml-2">({suggestion.sublabel})</span>}
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

// ==================== SÉLECTEUR DE STATUT (avec Portal) ====================
function StatusSelector({ currentStatus, onStatusChange, isArchived }) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  // Calculer la position du menu quand il s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4, // 4px de marge
        left: rect.left + window.scrollX
      });
    }
  }, [isOpen]);

  // Fermer le menu si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target) &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Fermer le menu si on scroll
  useEffect(() => {
    function handleScroll() {
      if (isOpen) setIsOpen(false);
    }
    
    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [isOpen]);

  if (isArchived) {
    const config = STATUS_CONFIG.archivee;
    return <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>{config.label}</span>;
  }

  const currentConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.a_faire;
  const availableStatuses = ['a_faire', 'en_cours', 'terminee'].filter(s => s !== currentStatus);

  // Le menu dropdown rendu via Portal
  const dropdownMenu = isOpen && typeof document !== 'undefined' ? createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 9999
      }}
      className="bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[130px] animate-fadeIn"
    >
      {availableStatuses.map(status => {
        const config = STATUS_CONFIG[status];
        return (
          <button
            key={status}
            onClick={(e) => { 
              e.stopPropagation(); 
              onStatusChange(status); 
              setIsOpen(false); 
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'a_faire' ? 'bg-yellow-500' : 
              status === 'en_cours' ? 'bg-blue-500' : 
              'bg-green-500'
            }`}></span>
            {config.label}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => { 
          e.stopPropagation(); 
          setIsOpen(!isOpen); 
        }}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium ${currentConfig.bg} ${currentConfig.text} hover:opacity-80 transition-all cursor-pointer border border-transparent hover:border-gray-300`}
        title="Cliquer pour changer le statut"
      >
        {currentConfig.label}
        <svg 
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {dropdownMenu}
    </>
  );
}

// ==================== MODAL DÉTAILS TÂCHE ====================
function TaskDetailModal({ task, isOpen, onClose, onEdit, onAssignToMe, onArchive, onStatusChange, user, getClientName, isArchived }) {
  if (!isOpen || !task) return null;

  const statusConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.a_faire;
  const priorityConfig = PRIORITY_CONFIG[task.priorite] || PRIORITY_CONFIG.normale;
  const clientName = getClientName(task);
  const isUnassigned = !task.assigne;
  const isTerminee = task.status === 'terminee';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Barre de priorité en haut */}
        <div className={`h-2 ${priorityConfig.bar}`}></div>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${priorityConfig.bg} ${priorityConfig.text}`}>
                  {priorityConfig.label}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{task.titre}</h3>
              {clientName !== '—' && (
                <p className="text-sm text-gray-500 mt-1">
                  {task.type === 'beneficiaire' ? '👤 Bénéficiaire' : '💚 Auxiliaire'} : {clientName}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-4">
          {task.description && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}

          {/* Changement de statut */}
          {!isArchived && (
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Statut</p>
              <div className="flex gap-2 flex-wrap">
                {['a_faire', 'en_cours', 'terminee'].map(status => {
                  const config = STATUS_CONFIG[status];
                  const isActive = task.status === status;
                  return (
                    <button
                      key={status}
                      onClick={() => !isActive && onStatusChange(task.id, status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? `${config.bg} ${config.text} ring-2 ring-offset-1 ${status === 'a_faire' ? 'ring-yellow-400' : status === 'en_cours' ? 'ring-blue-400' : 'ring-green-400'}`
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Infos */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-500">Créé par</p>
              <p className="text-gray-800">{task.creePar || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Assigné à</p>
              <p className={`${isUnassigned ? 'text-orange-600 font-medium' : 'text-gray-800'}`}>
                {task.assigne || 'Non assigné'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Échéance</p>
              <p className="text-gray-800">
                {task.echeance ? new Date(task.echeance).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Créé le</p>
              <p className="text-gray-800">{task.created_at ? new Date(task.created_at).toLocaleDateString('fr-FR') : '—'}</p>
            </div>
            {task.completed_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">Terminé le</p>
                <p className="text-gray-800">{new Date(task.completed_at).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            {task.archived_at && (
              <div>
                <p className="text-sm font-medium text-gray-500">Archivé le</p>
                <p className="text-gray-800">{new Date(task.archived_at).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3 flex-wrap">
          {!isArchived && isUnassigned && !isTerminee && (
            <button onClick={() => onAssignToMe(task.id)} className="flex-1 py-2 px-4 bg-[#74ccc3] text-white rounded-lg hover:bg-[#5cb8ae] transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Je m'en occupe
            </button>
          )}
          {!isArchived && isTerminee && (
            <button onClick={() => onArchive(task.id)} className="flex-1 py-2 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              Archiver
            </button>
          )}
          {!isArchived && (
            <button onClick={() => onEdit(task)} className="flex-1 py-2 px-4 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors">
              Modifier
            </button>
          )}
          <button onClick={onClose} className="py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================
export default function TachesModule({ entityType = null, entityId = null }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [archives, setArchives] = useState([]);
  const [filter, setFilter] = useState('en_cours');
  const [filterAssigne, setFilterAssigne] = useState('all');
  const [collaborateurs, setCollaborateurs] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [isViewingArchived, setIsViewingArchived] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, taskId: null });
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [formData, setFormData] = useState({
    titre: '', description: '', priorite: 'normale', echeance: '', assigne: '', type: 'beneficiaire', clientId: '', clientName: ''
  });

  const isDashboardMode = !entityType || !entityId;
  const archiveKey = useMemo(() => isDashboardMode ? null : `archives_${entityType}_${entityId}`, [isDashboardMode, entityType, entityId]);

  // ==================== CHARGEMENT ====================
  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(JSON.parse(userData || '{}'));
    setBeneficiaires(JSON.parse(localStorage.getItem('beneficiaires') || '[]'));
    setAuxiliaires(JSON.parse(localStorage.getItem('auxiliaires') || '[]'));
    loadData();
  }, [entityId, entityType]);

  const loadData = useCallback(() => {
    const allTasks = JSON.parse(localStorage.getItem('taches') || '[]');

    if (isDashboardMode) {
      setTasks(allTasks);
      setCollaborateurs([...new Set(allTasks.map(t => t.assigne).filter(Boolean))]);
      setArchives([]);
    } else {
      const entityTasks = allTasks.filter(t => t.type === entityType && String(t.clientId) === String(entityId));
      setTasks(entityTasks);

      const currentArchiveKey = `archives_${entityType}_${entityId}`;
      const entityArchives = JSON.parse(localStorage.getItem(currentArchiveKey) || '[]');
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - RETENTION_MONTHS);
      const validArchives = entityArchives.filter(t => new Date(t.archived_at || t.completed_at || t.created_at) > cutoffDate);

      if (validArchives.length !== entityArchives.length) {
        localStorage.setItem(currentArchiveKey, JSON.stringify(validArchives));
      }
      setArchives(validArchives);
    }
  }, [isDashboardMode, entityType, entityId]);

  const saveTasks = (newTasks) => {
    const allTasks = JSON.parse(localStorage.getItem('taches') || '[]');
    if (isDashboardMode) {
      localStorage.setItem('taches', JSON.stringify(newTasks));
      setTasks(newTasks);
    } else {
      const otherTasks = allTasks.filter(t => !(t.type === entityType && String(t.clientId) === String(entityId)));
      localStorage.setItem('taches', JSON.stringify([...otherTasks, ...newTasks]));
      setTasks(newTasks);
    }
  };

  const saveArchives = (newArchives) => {
    if (!isDashboardMode && archiveKey) {
      localStorage.setItem(archiveKey, JSON.stringify(newArchives));
      setArchives(newArchives);
    }
  };

  // ==================== STATISTIQUES ====================
  const stats = useMemo(() => ({
    total: tasks.length,
    enCours: tasks.filter(t => t.status === 'a_faire' || t.status === 'en_cours').length,
    aFaire: tasks.filter(t => t.status === 'a_faire').length,
    terminee: tasks.filter(t => t.status === 'terminee').length,
    archives: archives.length,
    enRetard: tasks.filter(t => t.status !== 'terminee' && t.echeance && new Date(t.echeance) < new Date()).length,
    nonAssignee: tasks.filter(t => !t.assigne && t.status !== 'terminee').length,
    urgentes: tasks.filter(t => t.priorite === 'haute' && t.status !== 'terminee').length
  }), [tasks, archives]);

  // ==================== FILTRAGE ====================
  const filteredTasks = useMemo(() => {
    if (filter === 'archives') {
      return [...archives].sort((a, b) => (b.archived_at || '').localeCompare(a.archived_at || ''));
    }

    return tasks
      .filter(task => {
        if (filter === 'en_cours') return task.status === 'a_faire' || task.status === 'en_cours';
        if (filter === 'terminee') return task.status === 'terminee';
        if (filter === 'non_assignee') return !task.assigne && task.status !== 'terminee';
        if (filter === 'urgentes') return task.priorite === 'haute' && task.status !== 'terminee';
        return true;
      })
      .filter(task => {
        if (!isDashboardMode || filterAssigne === 'all') return true;
        if (filterAssigne === 'me') return task.assigne === user?.name;
        return task.assigne === filterAssigne;
      })
      .sort((a, b) => {
        // Priorité haute en premier
        const priorityOrder = { haute: 0, normale: 1, basse: 2 };
        if (a.priorite !== b.priorite) return (priorityOrder[a.priorite] || 1) - (priorityOrder[b.priorite] || 1);
        // Non assignées ensuite
        if (!a.assigne && b.assigne) return -1;
        if (a.assigne && !b.assigne) return 1;
        // Par statut
        if (a.status !== b.status) return a.status === 'a_faire' ? -1 : 1;
        // Par date
        return (a.echeance || '9999-12-31').localeCompare(b.echeance || '9999-12-31');
      });
  }, [tasks, archives, filter, filterAssigne, isDashboardMode, user?.name]);

  // ==================== HELPERS ====================
  const isOverdue = (task) => task.status !== 'terminee' && task.echeance && new Date(task.echeance) < new Date();

  const getDeadlineBadge = (task) => {
    if (!task.echeance) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limit = new Date(task.echeance); limit.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((limit - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}j retard`, bg: 'bg-red-500', text: 'text-white' };
    if (diffDays === 0) return { label: "Aujourd'hui", bg: 'bg-orange-500', text: 'text-white' };
    if (diffDays <= 3) return { label: `${diffDays}j`, bg: 'bg-yellow-500', text: 'text-white' };
    if (diffDays <= 7) return { label: `${diffDays}j`, bg: 'bg-blue-500', text: 'text-white' };
    return { label: `${diffDays}j`, bg: 'bg-gray-200', text: 'text-gray-700' };
  };

  const getClientName = useCallback((task) => {
    if (!task.clientId) return '—';
    if (task.type === 'beneficiaire') {
      const client = beneficiaires.find(b => String(b.id) === String(task.clientId));
      return client ? `${client.civilite || ''} ${client.nom || ''}`.trim() : '—';
    } else {
      const client = auxiliaires.find(a => String(a.id) === String(task.clientId));
      return client ? `${client.prenom || ''} ${client.nom || ''}`.trim() : '—';
    }
  }, [beneficiaires, auxiliaires]);

  const beneficiaireSuggestions = useMemo(() => beneficiaires.map(b => ({ id: b.id, label: `${b.civilite || ''} ${b.nom || ''} ${b.prenom || ''}`.trim(), sublabel: b.ville || '' })), [beneficiaires]);
  const auxiliaireSuggestions = useMemo(() => auxiliaires.map(a => ({ id: a.id, label: `${a.prenom || ''} ${a.nom || ''}`.trim(), sublabel: a.fonction || 'AVS' })), [auxiliaires]);

  // ==================== ACTIONS ====================
  const handleStatusChange = (taskId, newStatus) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status: newStatus,
          updated_at: new Date().toISOString(),
          completed_at: newStatus === 'terminee' ? new Date().toISOString() : (newStatus !== 'terminee' ? null : t.completed_at)
        };
      }
      return t;
    });
    saveTasks(updated);
    
    // Mettre à jour viewingTask si ouverte
    if (viewingTask && viewingTask.id === taskId) {
      setViewingTask({ ...viewingTask, status: newStatus, updated_at: new Date().toISOString() });
    }
  };

  const handleArchive = (taskId) => setConfirmModal({ isOpen: true, type: 'archive', taskId });

  const confirmArchive = () => {
    const taskToArchive = tasks.find(t => t.id === confirmModal.taskId);
    if (taskToArchive && !isDashboardMode) {
      const archivedTask = { ...taskToArchive, status: 'archivee', archived_at: new Date().toISOString() };
      const currentArchiveKey = `archives_${entityType}_${entityId}`;
      const currentArchives = JSON.parse(localStorage.getItem(currentArchiveKey) || '[]');
      localStorage.setItem(currentArchiveKey, JSON.stringify([archivedTask, ...currentArchives]));
      setArchives([archivedTask, ...currentArchives]);
      saveTasks(tasks.filter(t => t.id !== confirmModal.taskId));
    }
    setConfirmModal({ isOpen: false, type: null, taskId: null });
    setViewingTask(null);
  };

  const handleAssignToMe = (taskId) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, assigne: user?.name || 'Utilisateur', updated_at: new Date().toISOString() } : t);
    saveTasks(updated);
    setViewingTask(null);
  };

  const handleSave = () => {
    if (!formData.titre) { alert('Veuillez renseigner le titre'); return; }
    if (isDashboardMode && !formData.clientId) { alert('Veuillez sélectionner un bénéficiaire ou auxiliaire'); return; }

    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData, updated_at: new Date().toISOString() } : t));
    } else {
      const newTask = {
        id: Date.now().toString(),
        ...formData,
        status: 'a_faire',
        creePar: user?.name || 'Utilisateur',
        created_at: new Date().toISOString(),
        type: isDashboardMode ? formData.type : entityType,
        clientId: isDashboardMode ? formData.clientId : entityId
      };
      saveTasks([...tasks, newTask]);
    }
    closeForm();
  };

  const handleDelete = (taskId) => setConfirmModal({ isOpen: true, type: 'delete', taskId });

  const confirmDelete = () => {
    if (filter === 'archives') saveArchives(archives.filter(t => t.id !== confirmModal.taskId));
    else saveTasks(tasks.filter(t => t.id !== confirmModal.taskId));
    setConfirmModal({ isOpen: false, type: null, taskId: null });
    setViewingTask(null);
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setFormData({ titre: task.titre, description: task.description || '', priorite: task.priorite || 'normale', echeance: task.echeance || '', assigne: task.assigne || '', type: task.type || 'beneficiaire', clientId: task.clientId || '', clientName: getClientName(task) });
    setViewingTask(null);
    setShowTaskForm(true);
  };

  const closeForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setFormData({ titre: '', description: '', priorite: 'normale', echeance: '', assigne: '', type: 'beneficiaire', clientId: '', clientName: '' });
  };

  // ==================== RENDU ====================
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <div>
              <span className="text-lg font-bold text-gray-800">Tâches</span>
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-gray-500">{stats.enCours} en cours</span>
                {stats.urgentes > 0 && <span className="text-red-500 font-medium">🔴 {stats.urgentes} urgente(s)</span>}
                {stats.enRetard > 0 && <span className="text-orange-500 font-medium">{stats.enRetard} en retard</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isDashboardMode && (
              <select
                value={filterAssigne}
                onChange={(e) => setFilterAssigne(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#d85940]"
              >
                <option value="all">Tous</option>
                <option value="me">Mes tâches</option>
                {collaborateurs.filter(c => c !== user?.name).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button
              onClick={() => { setEditingTask(null); setFormData({ titre: '', description: '', priorite: 'normale', echeance: '', assigne: user?.name || '', type: entityType || 'beneficiaire', clientId: entityId || '', clientName: '' }); setShowTaskForm(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nouvelle tâche
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'en_cours', label: `En cours (${stats.enCours})` },
            { key: 'urgentes', label: `🔴 Urgentes (${stats.urgentes})`, color: 'red' },
            { key: 'non_assignee', label: `Non assignées (${stats.nonAssignee})`, color: 'orange' },
            { key: 'terminee', label: `Terminées (${stats.terminee})` },
            ...(!isDashboardMode ? [{ key: 'archives', label: `📦 Archives (${stats.archives})`, color: 'gray' }] : [])
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? color === 'red' ? 'bg-red-500 text-white' : color === 'orange' ? 'bg-orange-500 text-white' : color === 'gray' ? 'bg-gray-600 text-white' : 'bg-[#d85940] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Archives */}
      {filter === 'archives' && (
        <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 text-sm text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Historique des {RETENTION_MONTHS} derniers mois
        </div>
      )}

      {/* Tableau */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${filter === 'archives' ? 'bg-gray-100' : 'bg-green-100'}`}>
            <svg className={`w-8 h-8 ${filter === 'archives' ? 'text-gray-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-600">
            {filter === 'urgentes' ? '🎉 Aucune tâche urgente !' : filter === 'archives' ? 'Aucune archive' : 'Aucune tâche'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#74ccc3] text-white">
                <th className="w-1 rounded-tl-xl"></th>
                {isDashboardMode && <th className="px-4 py-3 text-left text-sm font-semibold">Patient / AVS</th>}
                <th className="px-4 py-3 text-left text-sm font-semibold">Titre</th>
                <th className="px-4 py-3 text-left text-sm font-semibold hidden md:table-cell">Créé par</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Assigné à</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{filter === 'archives' ? 'Archivé le' : 'Avant le'}</th>
                <th className="px-4 py-3 text-center text-sm font-semibold w-24 rounded-tr-xl">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, index) => {
                const deadlineBadge = getDeadlineBadge(task);
                const priorityConfig = PRIORITY_CONFIG[task.priorite] || PRIORITY_CONFIG.normale;
                const clientName = getClientName(task);
                const isUnassigned = !task.assigne;
                const isArchived = filter === 'archives';
                const isTerminee = task.status === 'terminee';

                return (
                  <tr
                    key={task.id}
                    onClick={() => { setViewingTask(task); setIsViewingArchived(isArchived); }}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    } ${!isArchived && isOverdue(task) ? 'bg-red-50/50' : ''} ${
                      !isArchived && task.priorite === 'haute' && task.status !== 'terminee' ? priorityConfig.rowBg : ''
                    }`}
                  >
                    {/* Barre de priorité */}
                    <td className={`w-1.5 ${priorityConfig.bar}`}></td>
                    
                    {isDashboardMode && <td className="px-4 py-3"><span className="font-medium text-gray-800">{clientName}</span></td>}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {task.priorite === 'haute' && task.status !== 'terminee' && !isArchived && (
                          <span className="text-red-500" title="Urgente">🔴</span>
                        )}
                        <div>
                          <span className={`text-gray-700 ${isArchived || isTerminee ? 'line-through text-gray-400' : ''}`}>{task.titre}</span>
                          {task.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{task.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="text-gray-600">{task.creePar || '—'}</span></td>
                    <td className="px-4 py-3">
                      {!isArchived && isUnassigned && !isTerminee ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAssignToMe(task.id); }}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[#74ccc3] text-white rounded text-xs font-medium hover:bg-[#5cb8ae] transition-colors"
                        >
                          Je m'en occupe
                        </button>
                      ) : (
                        <span className="text-gray-600">{task.assigne || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <StatusSelector
                        currentStatus={task.status}
                        onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                        isArchived={isArchived}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {isArchived ? (
                        <span className="text-gray-500 text-sm">{task.archived_at ? new Date(task.archived_at).toLocaleDateString('fr-FR') : '—'}</span>
                      ) : deadlineBadge ? (
                        <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${deadlineBadge.bg} ${deadlineBadge.text}`}>{deadlineBadge.label}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {!isArchived && (
                          <>
                            {isTerminee && !isDashboardMode && (
                              <button onClick={(e) => { e.stopPropagation(); handleArchive(task.id); }} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Archiver">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                              </button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); openEditForm(task); }} className="p-1.5 text-gray-400 hover:text-[#d85940] hover:bg-gray-100 rounded transition-colors" title="Modifier">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Supprimer">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <TaskDetailModal task={viewingTask} isOpen={!!viewingTask} onClose={() => setViewingTask(null)} onEdit={openEditForm} onAssignToMe={handleAssignToMe} onArchive={handleArchive} onStatusChange={handleStatusChange} user={user} getClientName={getClientName} isArchived={isViewingArchived} />

      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.type === 'delete' ? 'Supprimer ?' : 'Archiver ?'} message={confirmModal.type === 'delete' ? 'Cette action est irréversible.' : 'La tâche sera conservée 12 mois.'} confirmText={confirmModal.type === 'delete' ? 'Supprimer' : 'Archiver'} confirmColor={confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'} onConfirm={confirmModal.type === 'delete' ? confirmDelete : confirmArchive} onCancel={() => setConfirmModal({ isOpen: false, type: null, taskId: null })} />

      {/* Formulaire */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{editingTask ? 'Modifier' : 'Nouvelle tâche'}</h3>
              <div className="space-y-4">
                {isDashboardMode && !editingTask && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Associer à</label>
                    <div className="flex gap-2 mb-3">
                      <button type="button" onClick={() => setFormData({ ...formData, type: 'beneficiaire', clientId: '', clientName: '' })} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${formData.type === 'beneficiaire' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>👤 Bénéficiaire</button>
                      <button type="button" onClick={() => setFormData({ ...formData, type: 'avs', clientId: '', clientName: '' })} className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${formData.type === 'avs' ? 'bg-[#74ccc3] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>💚 Auxiliaire</button>
                    </div>
                    <AutocompleteInput label={formData.type === 'beneficiaire' ? 'Bénéficiaire *' : 'Auxiliaire *'} placeholder="Rechercher..." value={formData.clientName} onChange={(v) => setFormData({ ...formData, clientName: v, clientId: '' })} suggestions={formData.type === 'beneficiaire' ? beneficiaireSuggestions : auxiliaireSuggestions} onSelect={(s) => setFormData({ ...formData, clientId: s.id, clientName: s.label })} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input type="text" value={formData.titre} onChange={(e) => setFormData({ ...formData, titre: e.target.value })} placeholder="Que faut-il faire ?" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="2" placeholder="Détails..." className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                    <select value={formData.priorite} onChange={(e) => setFormData({ ...formData, priorite: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent">
                      <option value="basse">⚪ Basse</option>
                      <option value="normale">🔵 Normale</option>
                      <option value="haute">🔴 Haute (Urgente)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                    <input type="date" value={formData.echeance} onChange={(e) => setFormData({ ...formData, echeance: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                  <input type="text" value={formData.assigne} onChange={(e) => setFormData({ ...formData, assigne: e.target.value })} placeholder="Laisser vide = visible par tous" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent" />
                  <p className="text-xs text-gray-500 mt-1">💡 Non assigné = tous peuvent la prendre</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleSave} className="flex-1 bg-[#d85940] text-white py-2 px-4 rounded-lg hover:bg-[#c04330] transition-colors">{editingTask ? 'Enregistrer' : 'Ajouter'}</button>
                <button onClick={closeForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}