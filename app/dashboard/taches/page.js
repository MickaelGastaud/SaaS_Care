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
        t.id === editingTask.id ? { ...t, ...formData } : t
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
      t.id === id ? { ...t, assigne: currentUser?.name || 'Moi', status: 'en_cours' } : t
    );
    setTaches(updated);
    localStorage.setItem('taches', JSON.stringify(updated));
  };

  const changeStatus = (id, newStatus) => {
    const updated = taches.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
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
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Terminée</span>;
      case 'en_cours':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">En cours</span>;
      case 'a_attribuer':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">À attribuer</span>;
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
      return <span className="px-2 py-1 bg-red-500 text-white rounded text-xs ml-2">Dépassé</span>;
    } else if (diffDays === 0) {
      return <span className="px-2 py-1 bg-orange-500 text-white rounded text-xs ml-2">Aujourd hui</span>;
    } else if (diffDays <= 3) {
      return <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs ml-2">{diffDays}j</span>;
    }
    return <span className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs ml-2">{diffDays}j</span>;
  };

  const statusCounts = {
    toutes: taches.length,
    a_attribuer: taches.filter(t => t.status === 'a_attribuer').length,
    en_cours: taches.filter(t => t.status === 'en_cours').length,
    terminee: taches.filter(t => t.status === 'terminee').length,
    mes_taches: taches.filter(t => t.assigne === (currentUser?.name || 'Moi')).length,
  };

  const filteredTaches = taches.filter(t => {
    let matchesFilter = true;
    
    if (filter === 'a_attribuer') matchesFilter = t.status === 'a_attribuer';
    else if (filter === 'en_cours') matchesFilter = t.status === 'en_cours';
    else if (filter === 'terminee') matchesFilter = t.status === 'terminee';
    else if (filter === 'mes_taches') matchesFilter = t.assigne === (currentUser?.name || 'Moi');
    
    const searchLower = searchTerm.toLowerCase();
    const client = t.type === 'beneficiaire' 
      ? beneficiaires.find(b => b.id == t.clientId)
      : auxiliaires.find(a => a.id == t.clientId);
    
    const matchesSearch = !searchTerm || 
      t.titre.toLowerCase().includes(searchLower) ||
      (t.description && t.description.toLowerCase().includes(searchLower)) ||
      (client && (client.prenom + ' ' + client.nom).toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tâches</h2>
          <p className="text-sm text-gray-500">Gestion des tâches et suivis</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#d85940] text-white px-4 py-2 rounded-lg hover:bg-[#c04330]"
        >
          + Nouvelle tâche
        </button>
      </header>
      
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['toutes', 'a_attribuer', 'en_cours', 'terminee', 'mes_taches'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f === 'toutes' ? 'Toutes' : f === 'a_attribuer' ? 'À attribuer' : f === 'en_cours' ? 'En cours' : f === 'terminee' ? 'Terminées' : 'Mes tâches'} ({statusCounts[f]})
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#74ccc3] text-white">
                <th className="px-4 py-3 text-left text-sm">Patient / AVS</th>
                <th className="px-4 py-3 text-left text-sm">Titre</th>
                <th className="px-4 py-3 text-left text-sm">Créé par</th>
                <th className="px-4 py-3 text-left text-sm">Assigné à</th>
                <th className="px-4 py-3 text-left text-sm">Statut</th>
                <th className="px-4 py-3 text-left text-sm">Avant le</th>
                <th className="px-4 py-3 text-center text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTaches.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                    Aucune tâche
                  </td>
                </tr>
              ) : (
                filteredTaches.map((tache, index) => {
                  const client = tache.type === 'beneficiaire' 
                    ? beneficiaires.find(b => b.id == tache.clientId)
                    : auxiliaires.find(a => a.id == tache.clientId);
                  const isOverdue = tache.dateLimit && new Date(tache.dateLimit) < new Date() && tache.status !== 'terminee';
                  
                  return (
                    <tr key={tache.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${isOverdue ? 'bg-red-50' : ''} hover:bg-gray-100 border-b`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{client ? client.prenom + ' ' + client.nom : '-'}</div>
                        <div className="text-xs text-gray-500">{tache.type === 'beneficiaire' ? 'Bénéficiaire' : 'AVS'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{tache.titre}</div>
                        {tache.description && <div className="text-xs text-gray-500 truncate max-w-xs">{tache.description}</div>}
                      </td>
                      <td className="px-4 py-3 text-sm">{tache.createdBy || 'Utilisateur'}</td>
                      <td className="px-4 py-3">
                        {tache.assigne ? (
                          <span className="text-sm font-medium">{tache.assigne}</span>
                        ) : (
                          <button onClick={() => assignToMe(tache.id)} className="text-sm text-[#d85940] hover:underline">
                            M attribuer
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(tache.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {tache.dateLimit ? (
                            <>
                              <span className="text-sm">{new Date(tache.dateLimit).toLocaleDateString('fr-FR')}</span>
                              {getDelayBadge(tache.dateLimit, tache.status)}
                            </>
                          ) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => setShowDetails(tache)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">Voir</button>
                          <button onClick={() => handleEdit(tache)} className="p-1 text-[#74ccc3] hover:bg-[#74ccc3]/10 rounded">Edit</button>
                          {tache.status !== 'terminee' && (
                            <button onClick={() => changeStatus(tache.id, 'terminee')} className="p-1 text-green-600 hover:bg-green-50 rounded">OK</button>
                          )}
                          <button onClick={() => deleteTache(tache.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">X</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {showDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className={`px-6 py-5 ${
                showDetails.status === 'terminee' ? 'bg-green-500' :
                showDetails.status === 'en_cours' ? 'bg-[#74ccc3]' : 'bg-[#d85940]'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-white/80 text-xs uppercase">
                      {showDetails.status === 'terminee' ? 'Terminée' : showDetails.status === 'en_cours' ? 'En cours' : 'À attribuer'}
                    </span>
                    <h3 className="text-white text-xl font-bold mt-1">{showDetails.titre}</h3>
                  </div>
                  <button onClick={() => setShowDetails(null)} className="text-white/70 hover:text-white p-2">X</button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {showDetails.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                    <p className="mt-2 text-gray-700">{showDetails.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Assigné à</label>
                    <p className="mt-2 font-semibold text-gray-800">{showDetails.assigne || 'Non assigné'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Créé par</label>
                    <p className="mt-2 font-semibold text-gray-800">{showDetails.createdBy || 'Utilisateur'}</p>
                  </div>
                </div>
                
                {showDetails.dateLimit && (
                  <div className="bg-[#a5fce8]/30 rounded-xl p-4">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Date limite</label>
                    <p className="mt-2 font-semibold text-gray-800">
                      {new Date(showDetails.dateLimit).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
                <button
                  onClick={() => { handleEdit(showDetails); setShowDetails(null); }}
                  className="flex-1 bg-[#d85940] text-white font-semibold py-3 rounded-xl"
                >
                  Éditer
                </button>
                <button onClick={() => setShowDetails(null)} className="flex-1 bg-white text-gray-700 font-semibold py-3 rounded-xl border">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
                <h3 className="text-xl font-bold">{editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}</h3>
                <button onClick={() => { setShowForm(false); setEditingTask(null); }} className="text-gray-400 hover:text-gray-600 p-2">X</button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.titre}
                    onChange={(e) => setFormData({...formData, titre: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="Ex: Appeler le médecin"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border rounded-xl px-4 py-3"
                    rows="3"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value, clientId: ''})}
                      className="w-full border rounded-xl px-4 py-3"
                    >
                      <option value="beneficiaire">Bénéficiaire</option>
                      <option value="avs">AVS</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.type === 'beneficiaire' ? 'Bénéficiaire' : 'AVS'}
                    </label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="w-full border rounded-xl px-4 py-3"
                    >
                      <option value="">Sélectionner...</option>
                      {(formData.type === 'beneficiaire' ? beneficiaires : auxiliaires).map(item => (
                        <option key={item.id} value={item.id}>{item.prenom} {item.nom}</option>
                      ))}
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
                      className="w-full border rounded-xl px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigné à</label>
                    <select
                      value={formData.assigne}
                      onChange={(e) => setFormData({...formData, assigne: e.target.value})}
                      className="w-full border rounded-xl px-4 py-3"
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
                    onClick={() => { setShowForm(false); setEditingTask(null); }}
                    className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button type="submit" className="flex-1 bg-[#d85940] text-white font-semibold py-3 rounded-xl">
                    {editingTask ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}