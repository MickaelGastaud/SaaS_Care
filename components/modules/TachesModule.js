'use client';
import { useState, useEffect } from 'react';

// ==================== CONFIGURATION ====================
const PRIORITY_CONFIG = {
  basse: { label: 'Basse', bg: 'bg-gray-100', text: 'text-gray-600' },
  normale: { label: 'Normale', bg: 'bg-blue-100', text: 'text-blue-600' },
  haute: { label: 'Urgente', bg: 'bg-red-100', text: 'text-red-600' }
};

// ==================== COMPOSANT PRINCIPAL ====================
/**
 * Module Tâches réutilisable
 * @param {string} entityType - 'beneficiaire' ou 'avs'
 * @param {string} entityId - ID de l'entité
 */
export default function TachesModule({ entityType, entityId }) {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    priorite: 'normale',
    echeance: '',
    assignee: ''
  });

  // Clé de stockage
  const storageKey = `tasks_${entityType}s`;

  // ==================== CHARGEMENT / SAUVEGARDE ====================
  useEffect(() => {
    if (entityId) {
      const allTasks = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setTasks(allTasks[entityId] || []);
    }
  }, [entityId, storageKey]);

  const saveTasks = (newTasks) => {
    const allTasks = JSON.parse(localStorage.getItem(storageKey) || '{}');
    allTasks[entityId] = newTasks;
    localStorage.setItem(storageKey, JSON.stringify(allTasks));
    setTasks(newTasks);
  };

  // ==================== STATISTIQUES ====================
  const stats = {
    total: tasks.length,
    aFaire: tasks.filter(t => t.status === 'a_faire').length,
    terminee: tasks.filter(t => t.status === 'terminee').length,
    enRetard: tasks.filter(t => t.status === 'a_faire' && t.echeance && new Date(t.echeance) < new Date()).length
  };

  // ==================== FILTRAGE & TRI ====================
  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'all') return true;
      return task.status === filter;
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'a_faire' ? -1 : 1;
      const priorityOrder = { haute: 0, normale: 1, basse: 2 };
      if (a.priorite !== b.priorite) return priorityOrder[a.priorite] - priorityOrder[b.priorite];
      if (a.echeance && b.echeance) return a.echeance.localeCompare(b.echeance);
      return a.echeance ? -1 : 1;
    });

  // ==================== GESTION TÂCHES ====================
  const isOverdue = (task) => task.status === 'a_faire' && task.echeance && new Date(task.echeance) < new Date();

  const handleToggleStatus = (taskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const newStatus = t.status === 'a_faire' ? 'terminee' : 'a_faire';
        return { ...t, status: newStatus, completed_at: newStatus === 'terminee' ? new Date().toISOString() : null };
      }
      return t;
    });
    saveTasks(updated);
  };

  const handleSave = () => {
    if (!formData.titre) {
      alert('Veuillez renseigner le titre de la tâche');
      return;
    }
    
    if (editingTask) {
      const updated = tasks.map(t => 
        t.id === editingTask.id ? { ...t, ...formData, updated_at: new Date().toISOString() } : t
      );
      saveTasks(updated);
    } else {
      const newTask = {
        ...formData,
        id: Date.now().toString(),
        status: 'a_faire',
        created_at: new Date().toISOString()
      };
      saveTasks([...tasks, newTask]);
    }
    
    closeForm();
  };

  const handleDelete = (taskId) => {
    if (confirm('Supprimer cette tâche ?')) {
      saveTasks(tasks.filter(t => t.id !== taskId));
      closeForm();
    }
  };

  const openEditForm = (task) => {
    setEditingTask(task);
    setFormData({
      titre: task.titre,
      description: task.description || '',
      priorite: task.priorite || 'normale',
      echeance: task.echeance || '',
      assignee: task.assignee || ''
    });
    setShowTaskForm(true);
  };

  const closeForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
    setFormData({ titre: '', description: '', priorite: 'normale', echeance: '', assignee: '' });
  };

  // ==================== RENDU ====================
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Tâches</h2>
          <div className="flex items-center gap-4 mt-1 text-sm">
            <span className="text-gray-500">{stats.aFaire} en cours</span>
            <span className="text-green-600">{stats.terminee} terminée(s)</span>
            {stats.enRetard > 0 && (
              <span className="text-red-500 font-medium">{stats.enRetard} en retard</span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => { setEditingTask(null); setFormData({ titre: '', description: '', priorite: 'normale', echeance: '', assignee: '' }); setShowTaskForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#d85940] text-white rounded-lg hover:bg-[#c04330] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle tâche
        </button>
      </div>
      
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `Toutes (${stats.total})`, color: 'bg-gray-800' },
          { key: 'a_faire', label: `À faire (${stats.aFaire})`, color: 'bg-[#d85940]' },
          { key: 'terminee', label: `Terminées (${stats.terminee})`, color: 'bg-green-600' }
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === key ? `${color} text-white` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      {/* Liste des tâches */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <p>{filter === 'all' ? 'Aucune tâche' : filter === 'a_faire' ? 'Aucune tâche en cours' : 'Aucune tâche terminée'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                  task.status === 'terminee' ? 'bg-gray-50' : ''
                } ${isOverdue(task) ? 'border-l-4 border-red-500' : ''}`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    task.status === 'terminee' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-[#d85940]'
                  }`}
                >
                  {task.status === 'terminee' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-medium ${task.status === 'terminee' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {task.titre}
                    </span>
                    
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${PRIORITY_CONFIG[task.priorite]?.bg} ${PRIORITY_CONFIG[task.priorite]?.text}`}>
                      {PRIORITY_CONFIG[task.priorite]?.label}
                    </span>
                    
                    {isOverdue(task) && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white font-medium">En retard</span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className={`text-sm mt-1 ${task.status === 'terminee' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                    {task.echeance && (
                      <span className={`flex items-center gap-1 ${isOverdue(task) ? 'text-red-500 font-medium' : ''}`}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(task.echeance).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                    
                    {task.assignee && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {task.assignee}
                      </span>
                    )}
                    
                    {task.status === 'terminee' && task.completed_at && (
                      <span className="text-green-500">Terminée le {new Date(task.completed_at).toLocaleDateString('fr-FR')}</span>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEditForm(task)} className="p-2 text-gray-400 hover:text-[#d85940] transition-colors" title="Modifier">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  placeholder="Que faut-il faire ?"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  placeholder="Détails supplémentaires..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={formData.priorite}
                    onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  >
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute (Urgente)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                  <input
                    type="date"
                    value={formData.echeance}
                    onChange={(e) => setFormData({ ...formData, echeance: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                <input
                  type="text"
                  value={formData.assignee}
                  onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                  placeholder="Nom de la personne"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} className="flex-1 bg-[#d85940] text-white py-2 px-4 rounded-lg hover:bg-[#c04330] transition-colors">
                {editingTask ? 'Enregistrer' : 'Ajouter'}
              </button>
              {editingTask && (
                <button onClick={() => handleDelete(editingTask.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                  Supprimer
                </button>
              )}
              <button onClick={closeForm} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}