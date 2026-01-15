'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuxiliairesPage() {
  const router = useRouter();
  const [auxiliaires, setAuxiliaires] = useState([]);
  const [filter, setFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('janvier 2026');
  const [selectedAVS, setSelectedAVS] = useState('');

  useEffect(() => {
    // Charger les auxiliaires avec des données d'exemple enrichies
    const saved = JSON.parse(localStorage.getItem('auxiliaires') || '[]');
    
    // Si vide, ajouter des exemples
    if (saved.length === 0) {
      const exemples = [
        { id: 1, nom: 'Martin', prenom: 'Sophie', telephone: '0123456789', email: 'sophie@example.com', 
          tauxHoraire: '15', status: 'actif', ville: 'Paris', initiales: 'SM', couleur: 'bg-green-500' },
        { id: 2, nom: 'Durand', prenom: 'Claire', telephone: '0678901234', email: 'claire@example.com',
          tauxHoraire: '14.5', status: 'actif', ville: 'Boulogne-Billancourt', lieux: ['Neuilly-sur-Seine'],
          initiales: 'CD', couleur: 'bg-blue-500' },
      ];
      localStorage.setItem('auxiliaires', JSON.stringify(exemples));
      setAuxiliaires(exemples);
    } else {
      // Enrichir les données existantes avec initiales et couleur
      const enriched = saved.map(a => ({
        ...a,
        initiales: `${a.prenom?.[0] || ''}${a.nom?.[0] || ''}`.toUpperCase(),
        couleur: getColorForInitials(`${a.prenom?.[0]}${a.nom?.[0]}`)
      }));
      setAuxiliaires(enriched);
    }
  }, []);

  const getColorForInitials = (initials) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredAVS = auxiliaires.filter(avs => {
    const matchesFilter = filter === 'tous' || avs.status === filter;
    const matchesSearch = avs.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          avs.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    tous: auxiliaires.length,
    actif: auxiliaires.filter(a => a.status === 'actif').length,
    prospect: auxiliaires.filter(a => a.status === 'prospect').length,
    inactif: auxiliaires.filter(a => a.status === 'inactif').length,
    blackliste: auxiliaires.filter(a => a.status === 'blackliste').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Auxiliaires de Vie</h1>
            <p className="text-gray-500">{auxiliaires.length} AVS enregistré(s)</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 px-4 py-2"
            >
              ← Retour
            </button>
            <button 
              onClick={() => router.push('/dashboard/auxiliaires/nouveau')}
              className="bg-[#d85940] text-white px-4 py-2 rounded hover:bg-[#c04330]"
            >
              + Nouvel AVS
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {/* Module Facturation */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="font-bold text-lg mb-4 flex items-center">
            <span className="mr-2">📊</span> Facturation Mensuelle
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Auxiliaire de vie</label>
              <select 
                value={selectedAVS}
                onChange={(e) => setSelectedAVS(e.target.value)}
                className="w-full border rounded px-3 py-2 text-gray-800"
              >
                <option value="">Sélectionner un AVS</option>
                {auxiliaires.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.prenom} {a.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Mois</label>
              <input 
                type="month" 
                defaultValue="2026-01"
                className="w-full border rounded px-3 py-2 text-gray-800"
              />
            </div>
            <div className="flex items-end">
              <button className="bg-[#74ccc3] text-white px-6 py-2 rounded hover:bg-[#5cb8ae] w-full">
                📊 Calculer
              </button>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom ou compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 text-gray-800"
              />
            </div>
            <div className="flex gap-2 ml-4">
              {Object.entries(statusCounts).map(([key, count]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === key 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Tableau des AVS */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-medium text-gray-600">AVS</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Statut</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Contact</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Lieux d'intervention</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Taux horaire</th>
                <th className="p-4 text-left text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAVS.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    Aucun auxiliaire trouvé
                  </td>
                </tr>
              ) : (
                filteredAVS.map(avs => (
                  <tr key={avs.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${avs.couleur} text-white flex items-center justify-center font-bold text-sm`}>
                          {avs.initiales}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {avs.civilite || 'Mme'} {avs.prenom} {avs.nom}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        avs.status === 'actif' ? 'bg-green-100 text-green-800' :
                        avs.status === 'inactif' ? 'bg-gray-100 text-gray-800' :
                        avs.status === 'blackliste' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {avs.status || 'actif'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          📞 {avs.telephone || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap">
                        {avs.ville && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {avs.ville}
                          </span>
                        )}
                        {avs.lieux?.map((lieu, i) => (
                          <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {lieu}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium">€ {avs.tauxHoraire || '15'}/h</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800" title="Voir">
                          👁️
                        </button>
                        <button className="text-red-600 hover:text-red-800" title="Supprimer">
                          🗑️
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
    </div>
  );
}