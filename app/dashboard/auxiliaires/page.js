'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FacturationModule from '@/components/modules/FacturationModule';

// ==================== COMPOSANTS UI ====================

const IconView = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const IconEdit = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const IconDelete = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DeleteModal = ({ isOpen, onClose, onConfirm, name }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        <div className="bg-red-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
          </div>
        </div>
        <div className="px-6 py-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer <strong>{name}</strong> ?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cette action est irréversible. Toutes les données associées seront définitivement perdues.
          </p>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const config = {
    actif: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif' },
    inactif: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Inactif' },
    prospect: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prospect' },
    blackliste: { bg: 'bg-red-100', text: 'text-red-700', label: 'Blacklisté' }
  };
  const style = config[status] || config.actif;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
export default function AuxiliairesPage() {
  const router = useRouter();
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, auxiliaire: null });

  useEffect(() => {
    loadAuxiliaires();
  }, []);

  const loadAuxiliaires = () => {
    const saved = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    setAuxiliaires(saved);
  };

  const getAvatarColor = (prenom, nom) => {
    const colors = [
      'bg-[#74ccc3]', 'bg-[#d85940]', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-blue-500', 'bg-green-500'
    ];
    const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`;
    const index = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
    return colors[index];
  };

  const filteredAuxiliaires = auxiliaires.filter(aux => {
    const status = aux.status || 'actif';
    const matchesFilter = filter === 'tous' || status === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (aux.nom?.toLowerCase().includes(searchLower)) ||
      (aux.prenom?.toLowerCase().includes(searchLower)) ||
      (aux.competences?.some(c => c.toLowerCase().includes(searchLower))) ||
      (aux.lieux_intervention?.some(l => l.toLowerCase().includes(searchLower)));
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    tous: auxiliaires.length,
    actif: auxiliaires.filter(a => (a.status || 'actif') === 'actif').length,
    prospect: auxiliaires.filter(a => a.status === 'prospect').length,
    inactif: auxiliaires.filter(a => a.status === 'inactif').length,
    blackliste: auxiliaires.filter(a => a.status === 'blackliste').length,
  };

  const handleDelete = () => {
    if (!deleteModal.auxiliaire) return;
    const updated = auxiliaires.filter(a => a.id !== deleteModal.auxiliaire.id);
    localStorage.setItem('auxiliaires', JSON.stringify(updated));
    setAuxiliaires(updated);
    setDeleteModal({ isOpen: false, auxiliaire: null });
  };

  return (
    <>
      {/* HEADER */}
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Auxiliaires de Vie</h1>
            <p className="text-gray-500">{auxiliaires.length} auxiliaire(s) enregistré(s)</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
            className="bg-[#d85940] text-white px-4 py-2 rounded-lg hover:bg-[#c04330] transition-colors flex items-center gap-2"
          >
            <span>+</span> Nouvel Auxiliaire
          </button>
        </div>
      </header>
      
      <main className="p-6 space-y-6">
        {/* MODULE FACTURATION */}
        <FacturationModule showAvsSelector={true} />

        {/* RECHERCHE & FILTRES */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Rechercher par nom ou compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#d85940] focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {Object.entries(statusCounts).map(([key, count]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key 
                      ? key === 'blackliste' ? 'bg-red-500 text-white' : 'bg-gray-900 text-white'
                      : key === 'blackliste' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {key === 'tous' ? 'Tous' : key === 'actif' ? 'Actifs' : key === 'prospect' ? 'Prospects' : key === 'inactif' ? 'Inactifs' : 'Blacklistés'} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* TABLEAU */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Auxiliaire</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Lieux d'intervention</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Taux horaire</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAuxiliaires.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">👥</span>
                      <p className="text-gray-500">Aucun auxiliaire trouvé</p>
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="mt-2 text-[#d85940] hover:underline text-sm">
                          Effacer la recherche
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAuxiliaires.map(aux => (
                  <tr key={aux.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {aux.photo_url ? (
                          <img src={aux.photo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(aux.prenom, aux.nom)} text-white flex items-center justify-center font-bold text-sm`}>
                            {aux.prenom?.[0]}{aux.nom?.[0]}
                          </div>
                        )}
                        <p className="font-medium text-gray-800">
                          {aux.civilite || 'Mme'} {aux.prenom} {aux.nom}
                        </p>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <StatusBadge status={aux.status || 'actif'} />
                    </td>
                    
                    <td className="px-4 py-3">
                      {aux.telephone ? (
                        <a href={`tel:${aux.telephone}`} className="flex items-center gap-1 text-[#d85940] hover:underline">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {aux.telephone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {aux.lieux_intervention?.length > 0 ? (
                          aux.lieux_intervention.slice(0, 3).map((lieu, i) => (
                            <span key={i} className="px-2 py-1 bg-[#a5fce8] text-[#5cb8ae] rounded text-xs">{lieu}</span>
                          ))
                        ) : aux.ville ? (
                          <span className="px-2 py-1 bg-[#a5fce8] text-[#5cb8ae] rounded text-xs">{aux.ville}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        {aux.lieux_intervention?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">+{aux.lieux_intervention.length - 3}</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-800">€ {aux.taux_horaire || 12}/h</span>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => router.push(`/dashboard/auxiliaires/${aux.id}`)}
                          className="p-2 text-gray-400 hover:text-[#74ccc3] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Voir la fiche"
                        >
                          <IconView />
                        </button>
                        
                        <button 
                          onClick={() => router.push(`/dashboard/auxiliaires/${aux.id}/edit`)}
                          className="p-2 text-gray-400 hover:text-[#d85940] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <IconEdit />
                        </button>
                        
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, auxiliaire: aux })}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <IconDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, auxiliaire: null })}
        onConfirm={handleDelete}
        name={deleteModal.auxiliaire ? `${deleteModal.auxiliaire.civilite || ''} ${deleteModal.auxiliaire.prenom} ${deleteModal.auxiliaire.nom}` : ''}
      />
    </>
  );
}