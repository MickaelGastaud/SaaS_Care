'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TachesPage() {
  const router = useRouter();
  const [taches, setTaches] = useState([]);
  const [filter, setFilter] = useState('toutes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'beneficiaire',
    clientId: '',
    importance: 'normale',
    dateLimit: '',
    assigne: '',
    status: 'a_attribuer'
  });

  useEffect(() => {
    const savedTaches = JSON.parse(localStorage.getItem('taches') || '[]');
    const savedBenef = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    const savedAVS = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    setTaches(savedTaches);
    setBeneficiaires(savedBenef);
    setAuxiliaires(savedAVS);
    setCurrentUser(user);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingTask) {
      const updated = taches.map(t => 
        t.id === editingTask.id 
          ? { ...t, ...formData }
          : t
      );
      setTaches(updated);
      localStorage.setItem('taches', JSON.stringify(updated));
      setEditingTask(null);
    } else {
      const newTache = {
        ...formData,
        id: Date.now(),
        status: formData.assigne ? 'en_cours' : 'a_attribuer',
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.name || 'Utilisateur'
      };
      const updated = [...taches, newTache];
      setTaches(updated);
      localStorage.setItem('taches', JSON.stringify(updated));
    }
    
    setShowForm(false);
    setFormData({
      titre: '',
      description: '',
      type: 'beneficiaire',
      clientId: '',
      importance: 'normale',
      dateLimit: '',
      assigne: '',
      status: 'a_attribuer'
    });
  };

  const assignToMe = (id) => {
    const updated = taches.map(t => 
      t.id === id 
        ? { ...t, assigne: currentUser?.name || 'Moi', status: 'en_cours' }
        : t
    );
    setTaches(updated);
    localStorage.setItem('taches', JSON.stringify(updated));
  };

  const changeStatus = (id, newStatus) => {
    const updated = taches.map(t => 
      t.id === id 
        ? { ...t, status: newStatus }
        : t
    );
    setTaches(updated);
    localStorage.setItem('taches', JSON.stringify(updated));
  };

  const deleteTache = (id) => {
    if (confirm('Supprimer cette tâche ?')) {
      const updated = taches.filter(t => t.id !== id);
      setTaches(updated);
      localStorage.setItem('taches', JSON.stringify(updated));
    }
  };

  const handleEdit = (tache) => {
    setEditingTask(tache);
    setFormData({
      titre: tache.titre,
      description: tache.description || '',
      type: tache.type || 'beneficiaire',
      clientId: tache.clientId || '',
      importance: tache.importance || 'normale',
      dateLimit: tache.dateLimit || '',
      assigne: tache.assigne || '',
      status: tache.status || 'a_attribuer'
    });
    setShowForm(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'terminee':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">✅ Terminée</span>;
      case 'en_cours':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">🔄 En cours</span>;
      case 'a_attribuer':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">📌 À attribuer</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">En cours</span>;
    }
  };

  const getDelayBadge = (dateLimit, status) => {
    if (status === 'terminee' || !dateLimit) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const limit = new Date(dateLimit);
    limit.setHours(0, 0, 0, 0);
    const diffTime = limit - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return (
        <span className="px-2 py-1 bg-red-500 text-white rounded text-xs ml-2 flex items-center gap-1">
          ⚠️ Dépassé
        </span>
      );
    } else if (diffDays === 0) {
      return <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs ml-2">Aujourd'hui</span>;
    } else if (diffDays <= 3) {
      return <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs ml-2">{diffDays}j restants</span>;
    }
    return <span className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs ml-2">{diffDays}j restants</span>;
  };

  // Compteurs pour les filtres
  const statusCounts = {
    toutes: taches.length,
    a_attribuer: taches.filter(t => t.status === 'a_attribuer').length,
    en_cours: taches.filter(t => t.status === 'en_cours').length,
    terminee: taches.filter(t => t.status === 'terminee').length,
    mes_taches: taches.filter(t => t.assigne === (currentUser?.name || 'Moi')).length,
  };

  // Filtrage avec recherche
  const filteredTaches = taches.filter(t => {
    let matchesFilter = true;
    
    // Filtre par statut
    if (filter === 'a_attribuer') matchesFilter = t.status === 'a_attribuer';
    else if (filter === 'en_cours') matchesFilter = t.status === 'en_cours';
    else if (filter === 'terminee') matchesFilter = t.status === 'terminee';
    else if (filter === 'mes_taches') matchesFilter = t.assigne === (currentUser?.name || 'Moi');
    
    // Recherche
    const searchLower = searchTerm.toLowerCase();
    const client = t.type === 'beneficiaire' 
      ? beneficiaires.find(b => b.id == t.clientId)
      : auxiliaires.find(a => a.id == t.clientId);
    
    const matchesSearch = !searchTerm || 
      t.titre.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower)) ||
      (client && (`${client.prenom} ${client.nom}`).toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">📋 Tâches</h1>
            <p className="text-gray-500">Gestion des tâches et suivis</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              ← Retour
            </button>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-[#d85940] text-white px-4 py-2 rounded hover:bg-[#c04330]"
            >
              + Nouvelle tâche
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom, titre ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-gray-800"
              />
            </div>
            
            {/* Filtres par statut */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('toutes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'toutes' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes ({statusCounts.toutes})
              </button>
              <button
                onClick={() => setFilter('a_attribuer')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'a_attribuer' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                À attribuer ({statusCounts.a_attribuer})
              </button>
              <button
                onClick={() => setFilter('en_cours')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'en_cours' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                En cours ({statusCounts.en_cours})
              </button>
              <button
                onClick={() => setFilter('terminee')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'terminee' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Terminées ({statusCounts.terminee})
              </button>
              <button
                onClick={() => setFilter('mes_taches')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'mes_taches' 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Mes tâches ({statusCounts.mes_taches})
              </button>
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#74ccc3] text-white">
                <th className="px-4 py-3 text-left text-sm font-medium">Patient / AVS</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Titre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Créé par</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Assigné à</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Avant le</th>
                <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    {searchTerm 
                      ? `Aucune tâche trouvée pour "${searchTerm}"`
                      : 'Aucune tâche dans cette catégorie'}
                  </td>
                </tr>
              ) : (
                filteredTaches.map((tache, index) => {
                  const client = tache.type === 'beneficiaire' 
                    ? beneficiaires.find(b => b.id == tache.clientId)
                    : auxiliaires.find(a => a.id == tache.clientId);
                  
                  const isOverdue = tache.dateLimit && new Date(tache.dateLimit) < new Date() && tache.status !== 'terminee';
                  const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                  const overdueBg = isOverdue ? 'bg-red-50' : '';
                  
                  return (
                    <tr key={tache.id} className={`${rowColor} ${overdueBg} hover:bg-gray-100 border-b`}>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {client ? `${client.prenom} ${client.nom}` : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tache.type === 'beneficiaire' ? 'Bénéficiaire' : 'AVS'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">{tache.titre}</div>
                          {tache.description && (
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {tache.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {tache.createdBy || 'Caroline'}
                      </td>
                      <td className="px-4 py-3">
                        {tache.assigne ? (
                          <span className="text-sm font-medium text-gray-900">{tache.assigne}</span>
                        ) : (
                          <button
                            onClick={() => assignToMe(tache.id)}
                            className="text-sm text-[#d85940] hover:underline font-medium"
                          >
                            M'attribuer
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(tache.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {tache.dateLimit ? (
                            <>
                              <span className="text-sm">
                                {new Date(tache.dateLimit).toLocaleDateString('fr-FR')}
                              </span>
                              {getDelayBadge(tache.dateLimit, tache.status)}
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setShowDetails(tache)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Voir détails"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(tache)}
                            className="p-1 text-[#74ccc3] hover:bg-[#74ccc3] hover:bg-opacity-10 rounded"
                            title="Éditer"
                          >
                            ✏️
                          </button>
                          {tache.status !== 'terminee' && (
                            <button
                              onClick={() => changeStatus(tache.id, 'terminee')}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Terminer"
                            >
                              ✅
                            </button>
                          )}
                          <button
                            onClick={() => deleteTache(tache.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Modal détails */}
        {showDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-xl font-bold">Détails de la tâche</h3>
                <button 
                  onClick={() => setShowDetails(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-500">Titre</label>
                  <p className="text-lg font-semibold">{showDetails.titre}</p>
                </div>
                
                {showDetails.description && (
                  <div>
                    <label className="text-sm text-gray-500">Description</label>
                    <p className="text-gray-800">{showDetails.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Statut</label>
                    <div className="mt-1">{getStatusBadge(showDetails.status)}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-500">Assigné à</label>
                    <p className="text-gray-800">{showDetails.assigne || 'Non assigné'}</p>
                  </div>
                </div>
                
                {showDetails.dateLimit && (
                  <div>
                    <label className="text-sm text-gray-500">Date limite</label>
                    <p className="text-gray-800">
                      📅 {new Date(showDetails.dateLimit).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleEdit(showDetails);
                      setShowDetails(null);
                    }}
                    className="flex-1 bg-[#74ccc3] text-white py-2 rounded-lg hover:bg-[#5cb8ae]"
                  >
                    Éditer
                  </button>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire modal - reste le même */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-lg">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-xl font-bold">
                  {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </h3>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                    <input
                      type="text"
                      required
                      value={formData.titre}
                      onChange={(e) => setFormData({...formData, titre: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      placeholder="Ex: Appeler le médecin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      rows="3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      >
                        <option value="beneficiaire">Bénéficiaire</option>
                        <option value="avs">AVS</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Client / AVS</label>
                      <select
                        value={formData.clientId}
                        onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      >
                        <option value="">Sélectionner...</option>
                        {formData.type === 'beneficiaire' 
                          ? beneficiaires.map(b => (
                              <option key={b.id} value={b.id}>
                                {b.prenom} {b.nom}
                              </option>
                            ))
                          : auxiliaires.map(a => (
                              <option key={a.id} value={a.id}>
                                {a.prenom} {a.nom}
                              </option>
                            ))
                        }
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date limite</label>
                      <input
                        type="date"
                        value={formData.dateLimit}
                        onChange={(e) => setFormData({...formData, dateLimit: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                      <select
                        value={formData.assigne}
                        onChange={(e) => setFormData({...formData, assigne: e.target.value})}
                        className="w-full border rounded-lg px-4 py-2.5 text-gray-800"
                      >
                        <option value="">Non assigné</option>
                        <option value={currentUser?.name || 'Moi'}>Moi</option>
                        <option value="Équipe">Équipe</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingTask(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#d85940] text-white py-2.5 rounded-lg hover:bg-[#c04330]"
                    >
                      {editingTask ? 'Modifier' : 'Créer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}