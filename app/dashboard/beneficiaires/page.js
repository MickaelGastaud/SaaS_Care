'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BeneficiairesPage() {
  const router = useRouter();
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('beneficiaires') || '[]');
    setBeneficiaires(saved);
  }, []);

  const handleDelete = (id) => {
    if (confirm('Supprimer ce bénéficiaire ?')) {
      const updated = beneficiaires.filter(b => b.id !== id);
      setBeneficiaires(updated);
      localStorage.setItem('beneficiaires', JSON.stringify(updated));
    }
  };

  // Compteurs par statut
  const statusCounts = {
    tous: beneficiaires.length,
    actif: beneficiaires.filter(b => (b.status || 'actif') === 'actif').length,
    inactif: beneficiaires.filter(b => b.status === 'inactif').length,
    prospect: beneficiaires.filter(b => b.status === 'prospect').length,
  };

  // Filtrage
  const filteredBeneficiaires = beneficiaires.filter(b => {
    const matchesSearch = !searchTerm || 
      b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.ville && b.ville.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const status = b.status || 'actif';
    const matchesStatus = filterStatus === 'tous' || status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const s = status || 'actif';
    switch(s) {
      case 'actif':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Actif</span>;
      case 'inactif':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactif</span>;
      case 'prospect':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Prospect</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{s}</span>;
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bénéficiaires</h2>
          <p className="text-sm text-gray-500">{beneficiaires.length} patient(s) enregistré(s)</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
          className="bg-[#d85940] text-white px-4 py-2 rounded-lg hover:bg-[#c04330] flex items-center space-x-2"
        >
          <span>+</span>
          <span>Nouveau Bénéficiaire</span>
        </button>
      </header>
      
      {/* Contenu */}
      <div className="p-6">
        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou ville..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'tous', label: 'Tous' },
                { key: 'actif', label: 'Actifs' },
                { key: 'prospect', label: 'Prospects' },
                { key: 'inactif', label: 'Inactifs' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilterStatus(f.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === f.key 
                      ? 'bg-gray-900 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label} ({statusCounts[f.key]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredBeneficiaires.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-500 text-lg">
                {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun bénéficiaire enregistré'}
              </p>
              {!searchTerm && (
                <button 
                  onClick={() => router.push('/dashboard/beneficiaires/nouveau')}
                  className="mt-4 text-[#d85940] hover:underline"
                >
                  + Ajouter votre premier bénéficiaire
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#74ccc3] text-white">
                  <th className="px-4 py-3 text-left text-sm font-medium">Patient</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Adresse</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBeneficiaires.map((b, index) => (
                  <tr key={b.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 border-b`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#74ccc3] flex items-center justify-center text-white font-bold">
                          {b.prenom?.charAt(0)}{b.nom?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{b.civilite} {b.prenom} {b.nom}</div>
                          {b.dateNaissance && (
                            <div className="text-xs text-gray-500">
                              Né(e) le {new Date(b.dateNaissance).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        {b.telephone && <div className="text-gray-900">{b.telephone}</div>}
                        {b.email && <div className="text-gray-500 text-xs">{b.email}</div>}
                        {!b.telephone && !b.email && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="text-gray-900">{b.codePostal} {b.ville}</div>
                        {b.adresse && <div className="text-gray-500 text-xs truncate max-w-xs">{b.adresse}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => router.push(`/dashboard/beneficiaires/${b.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Voir"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => router.push(`/dashboard/beneficiaires/${b.id}/edit`)}
                          className="p-2 text-[#74ccc3] hover:bg-[#74ccc3]/10 rounded-lg"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats rapides */}
        {beneficiaires.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-xs text-gray-500 uppercase">Actifs</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.actif}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-xs text-gray-500 uppercase">Prospects</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.prospect}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
              <p className="text-xs text-gray-500 uppercase">Inactifs</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.inactif}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-[#d85940]">
              <p className="text-xs text-gray-500 uppercase">Total</p>
              <p className="text-2xl font-bold text-gray-800">{statusCounts.tous}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}